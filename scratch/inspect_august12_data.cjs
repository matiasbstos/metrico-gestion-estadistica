const fetch = require('node-fetch');

async function inspectAug12() {
  const projectId = 'metrico-dashboard-2026';
  
  // Test root documents
  const rootUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  const queryTurnosRoot = {
    structuredQuery: {
      from: [{ collectionId: 'turnos' }]
    }
  };

  const resTurnos = await fetch(rootUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryTurnosRoot)
  });

  const dataTurnos = await resTurnos.json();
  console.log(`=== ROOT TURNOS EN FIRESTORE (${dataTurnos.length}) ===`);
  dataTurnos.forEach(item => {
    const fields = item.document?.fields || {};
    const fechaInicio = fields.fechaInicio?.stringValue || '';
    if (fechaInicio.startsWith('2026-08')) {
      console.log(`[${fechaInicio}] Horario: ${fields.horario?.stringValue} | Total: ${fields.totalPacientes?.integerValue || fields.totalPacientes?.stringValue} | Altas: ${fields.altasAdmin?.integerValue || fields.altasAdmin?.stringValue}`);
    }
  });

  // Query pacientes in August 2026
  const startMs = new Date("2026-08-12T16:00:00-04:00").getTime();
  const endMs = new Date("2026-08-13T09:00:00-04:00").getTime();

  const queryPacs = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'tAdmision' },
                op: 'GREATER_THAN_OR_EQUAL',
                value: { integerValue: startMs }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'tAdmision' },
                op: 'LESS_THAN_OR_EQUAL',
                value: { integerValue: endMs }
              }
            }
          ]
        }
      }
    }
  };

  const resPacs = await fetch(rootUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryPacs)
  });

  const dataPacs = await resPacs.json();
  console.log(`=== PACIENTES SHIFT 12/08 17:00 -> 13/08 08:00: total ${dataPacs.length} ===`);
}

inspectAug12();
