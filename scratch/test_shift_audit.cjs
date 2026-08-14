const fetch = require('node-fetch');

async function testAudit() {
  console.log("Fetching August 2026 patients from Firestore...");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const query = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia', allDescendants: false }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'tAdmision' },
                op: 'GREATER_THAN_OR_EQUAL',
                value: { integerValue: new Date(2026, 7, 1, 0, 0, 0).getTime() }
              }
            }
          ]
        }
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  const data = await res.json();
  const rawPacs = data.map(item => {
    const fields = item.document?.fields || {};
    return {
      tAdmision: Number(fields.tAdmision?.integerValue || fields.tAdmision?.stringValue || 0),
      diagnosticoPrincipal: fields.diagnosticoPrincipal?.stringValue || fields.codigoDiagnostico?.stringValue || '',
      destinoAlta: fields.destinoAlta?.stringValue || fields.destino?.stringValue || '',
      estado: fields.estado?.stringValue || '',
      categoria: fields.categoria?.stringValue || fields.triage?.stringValue || '',
      medico: fields.medico?.stringValue || fields.profesional?.stringValue || ''
    };
  }).filter(p => p.tAdmision > 0);

  console.log(`Leídos ${rawPacs.length} pacientes de agosto 2026 en total.`);

  // Group by day to see min/max timestamps for each day
  const daysMap = {};
  rawPacs.forEach(p => {
    const d = new Date(p.tAdmision);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!daysMap[dateStr]) daysMap[dateStr] = { count: 0, minTime: d, maxTime: d };
    daysMap[dateStr].count++;
    if (d < daysMap[dateStr].minTime) daysMap[dateStr].minTime = d;
    if (d > daysMap[dateStr].maxTime) daysMap[dateStr].maxTime = d;
  });

  console.log("\n--- RESUMEN DE PACIENTES CARGADOS POR DÍA ---");
  Object.keys(daysMap).sort().forEach(day => {
    const item = daysMap[day];
    console.log(`Día ${day}: ${item.count} pacientes. Primer paciente: ${item.minTime.toLocaleTimeString('es-CL')}, Último paciente: ${item.maxTime.toLocaleTimeString('es-CL')}`);
  });
}

testAudit();
