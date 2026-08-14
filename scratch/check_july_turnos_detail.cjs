const https = require('https');

const appId = 'urgencias-dashboard';
const url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/turnos?pageSize=300`;

https.get(url, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const docs = json.documents || [];
      console.log(`Total turnos en batch: ${docs.length}`);

      const julyTurnos = [];
      docs.forEach(doc => {
        const f = doc.fields || {};
        const fechaInicio = f.fechaInicio ? f.fechaInicio.stringValue : '';
        if (fechaInicio.startsWith('2026-07')) {
          julyTurnos.push({
            id: doc.name.split('/').pop(),
            fechaInicio,
            horario: f.horario ? f.horario.stringValue : '',
            totalPacientes: f.totalPacientes ? (f.totalPacientes.integerValue || f.totalPacientes.doubleValue) : 0,
            altasAdmin: f.altasAdmin ? (f.altasAdmin.integerValue || f.altasAdmin.doubleValue) : 0
          });
        }
      });

      console.log(`\nTurnos en Julio 2026 registrados en Firestore (${julyTurnos.length} turnos):`);
      julyTurnos.sort((a,b) => a.fechaInicio.localeCompare(b.fechaInicio));
      julyTurnos.forEach(t => {
        console.log(`Fecha: ${t.fechaInicio} | Horario: ${t.horario} | Total Pacientes: ${t.totalPacientes} | ID: ${t.id}`);
      });
    } catch (e) {
      console.error("Error parseando JSON:", e);
    }
  });
}).on('error', e => console.error("Error HTTP:", e));
