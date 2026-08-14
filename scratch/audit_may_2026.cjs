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
    const turnosDocs = await getCollectionDocs('turnos');
    console.log(`Total turnos en DB: ${turnosDocs.length}`);

    let turnosMay = 0;
    let totalAdmitidosMay = 0;
    let totalAltasMay = 0;
    let totalAtendidosMay = 0;

    const turnosMayList = [];

    turnosDocs.forEach(doc => {
      const f = doc.fields || {};
      const fechaInicio = f.fechaInicio ? f.fechaInicio.stringValue : '';
      if (fechaInicio.startsWith('2026-05')) {
        turnosMay++;
        const tot = f.totalPacientes ? Number(f.totalPacientes.integerValue || f.totalPacientes.doubleValue || 0) : 0;
        const altas = f.altasAdmin ? Number(f.altasAdmin.integerValue || f.altasAdmin.doubleValue || 0) : 0;
        const atend = Math.max(0, tot - altas);

        totalAdmitidosMay += tot;
        totalAltasMay += altas;
        totalAtendidosMay += atend;

        turnosMayList.push({
          fechaInicio,
          horario: f.horario ? f.horario.stringValue : '',
          totalPacientes: tot,
          altasAdmin: altas
        });
      }
    });

    console.log(`\n=== AUDITORÍA CONTROL MÉTRICO (MAYO 2026) ===`);
    console.log(`Turnos en Mayo 2026: ${turnosMay} turnos`);
    console.log(`Total Admitidos en MÉTRICO: ${totalAdmitidosMay} pac.`);
    console.log(`Total Altas Admin en MÉTRICO: ${totalAltasMay} altas`);
    console.log(`Total Atendidos Médicos en MÉTRICO: ${totalAtendidosMay} pac.`);

    console.log(`\n=== VALORES OFICIALES REPORTADOS (IMAGEN SAR ELSA ROMO) ===`);
    console.log(`Completados: 3676`);
    console.log(`Alta sin Atención Médica: 93`);
    console.log(`Egreso Administrativo: 341`);
    console.log(`Altas Admin Totales (93 + 341): 434 altas`);
    console.log(`Total Pacientes Admitidos Oficial: 4110 pac.`);

    console.log(`\n=== VERIFICACIÓN DE EXACTITUD ===`);
    console.log(`Diferencia Admitidos: ${totalAdmitidosMay - 4110} pac.`);
    console.log(`Diferencia Altas Admin: ${totalAltasMay - 434} altas.`);
    console.log(`Diferencia Atendidos: ${totalAtendidosMay - 3676} pac.`);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
