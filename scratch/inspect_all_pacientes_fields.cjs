const https = require('https');

const appId = 'urgencias-dashboard';

function getAllPacientesDocs() {
  return new Promise((resolve, reject) => {
    let allDocs = [];
    function fetchPage(pageToken) {
      let url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/pacientes_urgencia?pageSize=300`;
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

async function run() {
  try {
    const docs = await getAllPacientesDocs();
    console.log(`\n=== INSPECCIÓN TOTAL FIRESTORE: ${docs.length} PACIENTES ===`);

    const fieldsCount = {};
    const destMap = {};
    const JulyPacientes = [];

    docs.forEach(doc => {
      const f = doc.fields || {};
      Object.keys(f).forEach(k => {
        fieldsCount[k] = (fieldsCount[k] || 0) + 1;
      });

      const tAdm = f.tAdmision ? Number(f.tAdmision.integerValue || f.tAdmision.doubleValue || 0) : 0;
      const dateObj = new Date(tAdm);
      const yyyymm = tAdm > 0 ? dateObj.toISOString().substring(0, 7) : 'SinFecha';

      const dest = f.destinoAlta ? f.destinoAlta.stringValue : (f.destino ? f.destino.stringValue : '');
      const tipoAlta = f.tipoAlta ? f.tipoAlta.stringValue : '';
      const motivoAlta = f.motivoAlta ? f.motivoAlta.stringValue : '';
      const observacion = f.observacion ? f.observacion.stringValue : (f.obs ? f.obs.stringValue : '');

      const fullString = `${dest} ${tipoAlta} ${motivoAlta} ${observacion}`.toLowerCase();
      
      if (dest) {
        destMap[dest] = (destMap[dest] || 0) + 1;
      }

      if (yyyymm === '2026-07') {
        JulyPacientes.push({
          id: doc.name.split('/').pop(),
          tAdm,
          fechaIso: dateObj.toISOString(),
          dest,
          tipoAlta,
          motivoAlta,
          observacion,
          diag: f.diagnosticoPrincipal ? f.diagnosticoPrincipal.stringValue : ''
        });
      }
    });

    console.log("\nCampos presentes en pacientes_urgencia:", fieldsCount);
    console.log("\nTodos los Destinos de Alta en DB:", destMap);
    console.log(`\nTotal Pacientes en Julio 2026: ${JulyPacientes.length}`);
    console.log("Listado completo de Pacientes en Julio 2026:", JulyPacientes);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
