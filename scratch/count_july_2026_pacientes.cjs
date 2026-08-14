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
    console.log(`Total documentos en pacientes_urgencia: ${docs.length}`);

    const monthCounts = {};
    const JulyDestinos = {};
    let julyTotal = 0;

    docs.forEach(doc => {
      const f = doc.fields || {};
      const tAdm = f.tAdmision ? Number(f.tAdmision.integerValue || f.tAdmision.doubleValue || 0) : 0;
      if (tAdm > 0) {
        const d = new Date(tAdm);
        const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[yyyymm] = (monthCounts[yyyymm] || 0) + 1;

        if (yyyymm === '2026-07') {
          julyTotal++;
          const dest = f.destinoAlta ? f.destinoAlta.stringValue : (f.destino ? f.destino.stringValue : (f.lugarDerivacion ? f.lugarDerivacion.stringValue : 'SinDestino'));
          JulyDestinos[dest] = (JulyDestinos[dest] || 0) + 1;
        }
      }
    });

    console.log("\nDistribución Completa de Pacientes por Mes (tAdmision):");
    Object.keys(monthCounts).sort().forEach(m => {
      console.log(`  ${m}: ${monthCounts[m]} pacientes`);
    });

    console.log(`\nDestinos de Alta en Julio 2026 (${julyTotal} pacientes totales):`, JulyDestinos);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
