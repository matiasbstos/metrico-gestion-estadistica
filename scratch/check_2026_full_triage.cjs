const fetch = require('node-fetch');

async function runQuery(collectionId, filters = []) {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const structuredQuery = {
    from: [{ collectionId, allDescendants: false }]
  };

  if (filters.length > 0) {
    structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters
      }
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery })
  });

  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error("Error running query:", data);
    return [];
  }

  return data.filter(item => item.document).map(item => {
    const fields = item.document.fields || {};
    const obj = { _id: item.document.name.split('/').pop() };
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
  });
}

async function analyze2026() {
  console.log("Consultando turnos 2026...");
  const turnos = await runQuery('turnos');
  console.log(`Total turnos recibidos: ${turnos.length}`);

  console.log("Consultando pacientes 2026 (01/01/2026 a 16/08/2026)...");
  const start2026Ms = new Date('2026-01-01T00:00:00-04:00').getTime();
  const end2026Ms = new Date('2026-08-16T23:59:59-04:00').getTime();

  const pacs = await runQuery('pacientes_urgencia', [
    {
      fieldFilter: {
        field: { fieldPath: 'tAdmision' },
        op: 'GREATER_THAN_OR_EQUAL',
        value: { integerValue: start2026Ms }
      }
    },
    {
      fieldFilter: {
        field: { fieldPath: 'tAdmision' },
        op: 'LESS_THAN_OR_EQUAL',
        value: { integerValue: end2026Ms }
      }
    }
  ]);
  console.log(`Total pacientes recibidos en rango 2026: ${pacs.length}`);

  // Analizar categorías de pacientes individuales
  const catDistribution = {};
  const c1List = [];
  const c2List = [];
  const altasAdminList = [];
  let atendidosCount = 0;
  let noAtendidosCount = 0;

  pacs.forEach(p => {
    const cat = (p.categoria || 'sincat').toLowerCase().trim();
    catDistribution[cat] = (catDistribution[cat] || 0) + 1;

    const isAltaAdmin = p.estado === 'Cancelada' || 
      (p.destinoAlta && (p.destinoAlta.toLowerCase().includes('alta admin') || p.destinoAlta.toLowerCase().includes('sin atención'))) ||
      (p.destino && (p.destino.toLowerCase().includes('alta admin') || p.destino.toLowerCase().includes('sin atención')));

    if (isAltaAdmin) {
      noAtendidosCount++;
      altasAdminList.push(p);
    } else {
      atendidosCount++;
    }

    if (cat === 'c1' || cat.includes('c1')) {
      c1List.push({
        id: p._id,
        correlativo: p.correlativo,
        fecha: p.fecha || (p.tAdmision ? new Date(p.tAdmision).toISOString() : ''),
        nombre: p.nombrePaciente,
        edad: p.edad,
        sexo: p.sexo,
        categoria: p.categoria,
        diagnostico: p.diagnosticoPrincipal || p.codigoDiagnostico,
        destino: p.destinoAlta || p.destino,
        estado: p.estado,
        tAdmision: p.tAdmision ? new Date(p.tAdmision).toLocaleString('es-CL') : ''
      });
    }

    if (cat === 'c2') {
      c2List.push(p);
    }
  });

  console.log(`\n======================================================`);
  console.log(`RESULTADOS PACIENTES INDIVIDUALES (01/01/2026 - 16/08/2026)`);
  console.log(`======================================================`);
  console.log(`Total Pacientes Admitidos: ${pacs.length}`);
  console.log(`Pacientes Atendidos Efectivos: ${atendidosCount}`);
  console.log(`Altas Administrativas / Sin Atención: ${noAtendidosCount}`);
  console.log(`\nDistribución por Categoría de Pacientes:`);
  console.table(catDistribution);

  console.log(`\nPacientes C1 encontrados (${c1List.length}):`);
  console.log(JSON.stringify(c1List, null, 2));

  // Analizar Turnos en el mismo rango
  const turnos2026 = turnos.filter(t => {
    const f = t.fechaInicio ? t.fechaInicio.substring(0, 10) : '';
    return f >= '2026-01-01' && f <= '2026-08-16';
  });

  let totTurnoPac = 0;
  let totTurnoAltas = 0;
  const turnosCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };

  turnos2026.forEach(t => {
    totTurnoPac += Number(t.totalPacientes || 0);
    totTurnoAltas += Number(t.altasAdmin || 0);
    turnosCats.c1 += Number(t.c1 || 0);
    turnosCats.c2 += Number(t.c2 || 0);
    turnosCats.c3 += Number(t.c3 || 0);
    turnosCats.c3_z518 += Number(t.c3_z518 || 0);
    turnosCats.c4 += Number(t.c4 || 0);
    turnosCats.c5 += Number(t.c5 || 0);
    turnosCats.sincat += Number(t.sincat || 0);
  });

  console.log(`\n======================================================`);
  console.log(`RESULTADOS DESDE TURNOS AGREGADOS (01/01/2026 - 16/08/2026)`);
  console.log(`======================================================`);
  console.log(`Total Turnos en Rango: ${turnos2026.length}`);
  console.log(`Total Pacientes Admitidos en Turnos: ${totTurnoPac}`);
  console.log(`Altas Administrativas en Turnos: ${totTurnoAltas}`);
  console.log(`Atendidos en Turnos (Tot - Altas): ${totTurnoPac - totTurnoAltas}`);
  console.log(`Categorías en Turnos:`);
  console.table(turnosCats);

  const sumTriageTurnos = turnosCats.c1 + turnosCats.c2 + turnosCats.c3 + turnosCats.c3_z518 + turnosCats.c4 + turnosCats.c5;
  console.log(`Suma de Triajes C1+C2+C3+C3_z518+C4+C5 en Turnos: ${sumTriageTurnos}`);
  console.log(`Suma Total incluyendo sincat (${turnosCats.sincat}): ${sumTriageTurnos + turnosCats.sincat}`);
}

analyze2026().catch(console.error);
