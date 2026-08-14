const https = require('https');

const appId = 'urgencias-dashboard';

function getCollectionDocs(collectionName) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/${collectionName}?pageSize=1000`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.documents || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const [pacientes, turnos] = await Promise.all([
      getCollectionDocs('pacientes_urgencia'),
      getCollectionDocs('turnos')
    ]);

    console.log(`\n=== FIRESTORE DATA INSPECTION ===`);
    console.log(`Total Documentos en pacientes_urgencia: ${pacientes.length}`);
    console.log(`Total Documentos en turnos: ${turnos.length}`);

    // Inspect pacientes_urgencia dates
    const pacDates = {};
    let maxPacTime = 0;
    let maxPacStr = '';

    pacientes.forEach(doc => {
      const f = doc.fields || {};
      const tAdm = f.tAdmision ? Number(f.tAdmision.integerValue || f.tAdmision.doubleValue || 0) : 0;
      if (tAdm > maxPacTime) {
        maxPacTime = tAdm;
        maxPacStr = new Date(tAdm).toISOString();
      }
      const yyyymm = tAdm > 0 ? new Date(tAdm).toISOString().substring(0, 7) : 'SinFecha';
      pacDates[yyyymm] = (pacDates[yyyymm] || 0) + 1;
    });

    console.log("\nPacientes por mes (tAdmision):", pacDates);
    console.log(`Último paciente registrado en DB: ${maxPacStr} (timestamp: ${maxPacTime})`);

    // Inspect turnos dates
    const turnosDates = {};
    let maxTurnoDate = '';

    turnos.forEach(doc => {
      const f = doc.fields || {};
      const fechaInicio = f.fechaInicio ? f.fechaInicio.stringValue : '';
      if (fechaInicio > maxTurnoDate) maxTurnoDate = fechaInicio;
      const yyyymm = fechaInicio ? fechaInicio.substring(0, 7) : 'SinFecha';
      turnosDates[yyyymm] = (turnosDates[yyyymm] || 0) + 1;
    });

    console.log("\nTurnos por mes (fechaInicio):", turnosDates);
    console.log(`Último turno registrado en DB: ${maxTurnoDate}`);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
