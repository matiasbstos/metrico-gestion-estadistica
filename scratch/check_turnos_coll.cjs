const fetch = require('node-fetch');

async function checkTurnosCollection() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const query = {
    structuredQuery: {
      from: [{ collectionId: 'turnos', allDescendants: false }]
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  const data = await res.json();
  console.log(`Documentos en la colección turnos: ${data.length}`);
  
  data.slice(0, 10).forEach((item, i) => {
    const fields = item.document?.fields || {};
    const name = item.document?.name || '';
    console.log(`\nDoc ${i+1}: ${name.split('/').pop()}`);
    console.log(`fechaInicio: ${fields.fechaInicio?.stringValue}, totalPacientes: ${fields.totalPacientes?.integerValue || fields.totalPacientes?.stringValue}`);
  });
}

checkTurnosCollection();
