const fetch = require('node-fetch');

async function inspectAugustTurnos() {
  const projectId = 'metrico-dashboard-2026';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data/turnos`;

  const res = await fetch(url + '?pageSize=300');
  const data = await res.json();
  
  const docs = data.documents || [];
  console.log(`Total turnos in Firestore collection: ${docs.length}`);

  docs.forEach(doc => {
    const fields = doc.fields || {};
    const fecha = fields.fechaInicio?.stringValue;
    if (fecha && fecha.startsWith('2026-08')) {
      console.log(`DocID: ${doc.name.split('/').pop()} | Fecha: ${fecha} | Horario: ${fields.horario?.stringValue} | TotalPac: ${fields.totalPacientes?.integerValue || fields.totalPacientes?.stringValue} | Altas: ${fields.altasAdmin?.integerValue || fields.altasAdmin?.stringValue}`);
    }
  });
}

inspectAugustTurnos();
