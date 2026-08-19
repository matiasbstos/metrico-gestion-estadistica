const https = require('https');

const appId = 'urgencias-dashboard';

function getCollection(colName) {
  return new Promise((resolve, reject) => {
    let allDocs = [];
    function fetchPage(pageToken) {
      let url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/${colName}?pageSize=300`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            const docs = json.documents || [];
            allDocs = allDocs.concat(docs);
            if (json.nextPageToken) {
              fetchPage(json.nextPageToken);
            } else {
              resolve(allDocs);
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    }
    fetchPage();
  });
}

function parseFields(fields) {
  if (!fields) return {};
  const res = {};
  for (const k in fields) {
    const v = fields[k];
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) res[k] = Number(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.mapValue !== undefined) res[k] = parseFields(v.mapValue.fields);
    else if (v.arrayValue !== undefined) {
      res[k] = (v.arrayValue.values || []).map(val => {
        if (val.mapValue) return parseFields(val.mapValue.fields);
        if (val.stringValue !== undefined) return val.stringValue;
        if (val.integerValue !== undefined) return Number(val.integerValue);
        return val;
      });
    }
  }
  return res;
}

async function run() {
  console.log("=== 1. PAUTAS DE TURNOS ===");
  const pautasDocs = await getCollection('pautas_turnos');
  console.log(`Documentos en pautas_turnos: ${pautasDocs.length}`);
  pautasDocs.forEach(d => {
    const id = d.name.split('/').pop();
    const data = parseFields(d.fields);
    console.log(`\nPauta ID: ${id}`);
    const dates = Object.keys(data).filter(k => k.startsWith('2026'));
    console.log(`Días configurados en ${id}:`, dates.length, dates.slice(0, 10));
    if (id === '2026-08' || dates.some(k => k.startsWith('2026-08'))) {
      console.log("Detalle de días de agosto en pauta:", JSON.stringify(data, null, 2).slice(0, 500));
    }
  });

  console.log("\n=== 2. TURNOS DE AGOSTO 2026 ===");
  const turnosDocs = await getCollection('turnos');
  console.log(`Total turnos en BD: ${turnosDocs.length}`);
  const augTurnos = [];
  turnosDocs.forEach(d => {
    const id = d.name.split('/').pop();
    const data = parseFields(d.fields);
    if (data.fechaInicio && data.fechaInicio.startsWith('2026-08')) {
      augTurnos.push({ id, ...data });
    }
  });

  console.log(`Turnos en Agosto 2026: ${augTurnos.length}`);
  augTurnos.sort((a,b) => (a.fechaInicio || '').localeCompare(b.fechaInicio || ''));
  augTurnos.forEach(t => {
    console.log(`Turno: ${t.fechaInicio} - ${t.fechaFin || t.fechaInicio} | Horario: ${t.horario} | Equipo: '${t.equipo}' | totalPacientes: ${t.totalPacientes} | totalAtendidos: ${t.totalAtendidos} | pacsInList: ${t.pacientesList ? t.pacientesList.length : 0}`);
  });

  console.log("\n=== 3. PACIENTES DE AGOSTO 2026 ===");
  const pacsDocs = await getCollection('pacientes_urgencia');
  console.log(`Total pacientes en BD: ${pacsDocs.length}`);
  let countAug = 0;
  let countAugAtendidos = 0;
  let countAugAdmitidos = 0;
  const pacsByDay = {};
  pacsDocs.forEach(d => {
    const p = parseFields(d.fields);
    if (p.tAdmision) {
      const dt = new Date(p.tAdmision);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      if (y === 2026 && m === '08') {
        countAug++;
        countAugAdmitidos++;
        const dStr = `${y}-${m}-${day}`;
        pacsByDay[dStr] = (pacsByDay[dStr] || 0) + 1;
        if (p.tAnamnesis || p.tAlta || p.medico || p.estado === 'Atendido' || p.cat1) {
          countAugAtendidos++;
        }
      }
    }
  });

  console.log(`Pacientes Admitidos en Agosto 2026: ${countAugAdmitidos}`);
  console.log(`Pacientes Atendidos en Agosto 2026: ${countAugAtendidos}`);
  console.log("Pacientes por día de agosto:", pacsByDay);
}

run().catch(console.error);
