const fetch = require('node-fetch');

// Test auditarUltimoTurnoCompleto on August dataset
const { auditarUltimoTurnoCompleto } = require('./src/utils/helpers.js');

async function testFullAudit() {
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

  const resAudit = auditarUltimoTurnoCompleto([], rawPacs);
  console.log("Resultado de Auditoría de Turno Completo:");
  console.log(JSON.stringify(resAudit, null, 2));
}

testFullAudit();
