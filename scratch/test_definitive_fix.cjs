const fetch = require('node-fetch');

async function testDefinitiveFix() {
  console.log("Testing 30-day recent query for audit...");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Query last 30 days from now
  const thirtyDaysAgoMs = new Date(2026, 7, 8).getTime() - (30 * 24 * 60 * 60 * 1000);

  const query = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia', allDescendants: false }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'tAdmision' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { integerValue: thirtyDaysAgoMs }
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
  console.log(`Query de últimos 30 días devolvió ${data.length} pacientes.`);
}

testDefinitiveFix();
