const https = require('https');

const appId = 'urgencias-dashboard';

function getDocs(collectionName) {
  return new Promise((resolve, reject) => {
    let allDocs = [];
    function fetchPage(pageToken) {
      let url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/${collectionName}?pageSize=300`;
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

function parseFirestoreDoc(doc) {
  const fields = doc.fields || {};
  const obj = {};
  for (const k in fields) {
    const v = fields[k];
    if (v.stringValue !== undefined) obj[k] = v.stringValue;
    else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) obj[k] = Number(v.doubleValue);
    else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) obj[k] = v.timestampValue;
    else if (v.nullValue !== undefined) obj[k] = null;
  }
  return obj;
}

async function main() {
  console.log("Descargando turnos...");
  const rawTurnos = await getDocs('turnos');
  const turnos = rawTurnos.map(parseFirestoreDoc);
  console.log(`Total turnos: ${turnos.length}`);

  console.log("Descargando pacientes_urgencia...");
  const rawPacs = await getDocs('pacientes_urgencia');
  const pacs = rawPacs.map(parseFirestoreDoc);
  console.log(`Total pacientes: ${pacs.length}`);

  // Filtrar 2026 (01/01/2026 - 16/08/2026)
  const pacs2026 = pacs.filter(p => {
    const d = p.fecha || (p.tAdmision ? p.tAdmision.substring(0, 10) : '');
    return d >= '2026-01-01' && d <= '2026-08-16';
  });

  const catCounts = {};
  const c1Pacs = [];
  const c2Pacs = [];
  const altasAdmin = [];
  const estadoCounts = {};
  const sincatPacs = [];

  pacs2026.forEach(p => {
    const cat = (p.categoria || 'sincat').toLowerCase().trim();
    catCounts[cat] = (catCounts[cat] || 0) + 1;

    const est = (p.estado || 'sin_estado').trim();
    estadoCounts[est] = (estadoCounts[est] || 0) + 1;

    if (cat === 'c1' || cat.includes('c1')) {
      c1Pacs.push(p);
    }
    if (cat === 'c2') {
      c2Pacs.push(p);
    }
    if (cat === 'sincat' || !p.categoria) {
      sincatPacs.push(p);
    }
    if (p.estado === 'Cancelada' || (p.destinoAlta && p.destinoAlta.toLowerCase().includes('alta admin')) || (p.destino && p.destino.toLowerCase().includes('sin atención'))) {
      altasAdmin.push(p);
    }
  });

  console.log(`\n=== ANÁLISIS DE PACIENTES 2026 (01/01/2026 a 16/08/2026) ===`);
  console.log(`Total Pacientes en Rango: ${pacs2026.length}`);
  console.log(`Distribución por Categoría de Pacientes:`, catCounts);
  console.log(`Distribución por Estado:`, estadoCounts);
  console.log(`Pacientes C1 encontrados (${c1Pacs.length}):`, c1Pacs.map(p => ({
    correlativo: p.correlativo,
    fecha: p.fecha || p.tAdmision,
    nombre: p.nombrePaciente,
    diagnostico: p.diagnosticoPrincipal,
    categoria: p.categoria,
    estado: p.estado,
    destino: p.destinoAlta || p.destino
  })));

  // Revisar Turnos 2026
  let turnosTotalPac = 0;
  let turnosAltasAdmin = 0;
  const turnosCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };

  const turnos2026 = turnos.filter(t => {
    const f = t.fechaInicio ? t.fechaInicio.substring(0, 10) : '';
    return f >= '2026-01-01' && f <= '2026-08-16';
  });

  turnos2026.forEach(t => {
    turnosTotalPac += Number(t.totalPacientes || 0);
    turnosAltasAdmin += Number(t.altasAdmin || 0);
    turnosCats.c1 += Number(t.c1 || 0);
    turnosCats.c2 += Number(t.c2 || 0);
    turnosCats.c3 += Number(t.c3 || 0);
    turnosCats.c3_z518 += Number(t.c3_z518 || 0);
    turnosCats.c4 += Number(t.c4 || 0);
    turnosCats.c5 += Number(t.c5 || 0);
    turnosCats.sincat += Number(t.sincat || 0);
  });

  console.log(`\n=== ANÁLISIS DE TURNOS 2026 (01/01/2026 a 16/08/2026) ===`);
  console.log(`Total Turnos: ${turnos2026.length}`);
  console.log(`Total Pacientes en Turnos (Admitidos): ${turnosTotalPac}`);
  console.log(`Altas Administrativas en Turnos: ${turnosAltasAdmin}`);
  console.log(`Atendidos Efectivos en Turnos (Admitidos - Altas Admin): ${turnosTotalPac - turnosAltasAdmin}`);
  console.log(`Categorías en Turnos:`, turnosCats);
  const sumCatsTurnos = turnosCats.c1 + turnosCats.c2 + turnosCats.c3 + turnosCats.c3_z518 + turnosCats.c4 + turnosCats.c5;
  console.log(`Suma C1+C2+C3+C3_z518+C4+C5 en Turnos: ${sumCatsTurnos}`);
  console.log(`Diferencia Atendidos (${turnosTotalPac - turnosAltasAdmin}) vs Suma Categorías (${sumCatsTurnos}): ${(turnosTotalPac - turnosAltasAdmin) - sumCatsTurnos}`);
  console.log(`Sincat en Turnos: ${turnosCats.sincat}`);
}

main().catch(console.error);
