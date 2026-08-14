const https = require('https');

const appId = 'urgencias-dashboard';

function getJulyPacientesDocs() {
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
    const docs = await getJulyPacientesDocs();
    console.log(`Total documentos en pacientes_urgencia: ${docs.length}`);

    const julyPacientes = [];
    const allDestinos = new Set();
    const allTipos = new Set();
    const allMotivos = new Set();

    docs.forEach(doc => {
      const f = doc.fields || {};
      const tAdm = f.tAdmision ? Number(f.tAdmision.integerValue || f.tAdmision.doubleValue || 0) : 0;
      const dateObj = new Date(tAdm);
      const yyyymm = tAdm > 0 ? dateObj.toISOString().substring(0, 7) : '';

      const dest = f.destinoAlta ? f.destinoAlta.stringValue : (f.destino ? f.destino.stringValue : '');
      const tipo = f.tipoAlta ? f.tipoAlta.stringValue : '';
      const motivo = f.motivoAlta ? f.motivoAlta.stringValue : '';
      const cat = f.categoria ? f.categoria.stringValue : '';
      const diag = f.diagnosticoPrincipal ? f.diagnosticoPrincipal.stringValue : (f.codigoDiagnostico ? f.codigoDiagnostico.stringValue : '');

      if (dest) allDestinos.add(dest);
      if (tipo) allTipos.add(tipo);
      if (motivo) allMotivos.add(motivo);

      if (yyyymm === '2026-07') {
        julyPacientes.push({
          id: doc.name.split('/').pop(),
          fecha: dateObj.toISOString(),
          cat,
          dest,
          tipo,
          motivo,
          diag
        });
      }
    });

    console.log("\nTodos los Destinos de Alta en DB:", Array.from(allDestinos));
    console.log("Todos los Tipos de Alta en DB:", Array.from(allTipos));
    console.log("Todos los Motivos de Alta en DB:", Array.from(allMotivos));
    console.log(`\nPacientes en Julio 2026: ${julyPacientes.length}`);
    console.log("Listado completo de Pacientes en Julio 2026:");
    julyPacientes.forEach((p, idx) => {
      console.log(`${idx+1}. Fecha: ${p.fecha} | Triage: ${p.cat} | Destino: "${p.dest}" | Tipo: "${p.tipo}" | Diag: ${p.diag}`);
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
