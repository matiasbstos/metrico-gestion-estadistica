const https = require('https');

const appId = 'urgencias-dashboard';

function getDocs(collectionName) {
  return new Promise((resolve, reject) => {
    let allDocs = [];
    function fetchPage(pageToken) {
      let url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/${collectionName}?pageSize=300`;
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

function parseFirestoreDoc(doc) {
  const fields = doc.fields || {};
  const obj = { id: doc.name.split('/').pop() };
  for (const k in fields) {
    const v = fields[k];
    if (v.stringValue !== undefined) obj[k] = v.stringValue;
    else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) obj[k] = Number(v.doubleValue);
    else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) obj[k] = v.timestampValue;
    else if (v.nullValue !== undefined) obj[k] = null;
  }
  return obj;
}

async function run() {
  console.log('Fetching all turnos...');
  const rawTurnos = await getDocs('turnos');
  const turnos = rawTurnos.map(parseFirestoreDoc);
  console.log(`Total turnos fetched: ${turnos.length}`);

  const augustTurnos = turnos.filter(t => t.fechaInicio && t.fechaInicio.startsWith('2026-08'));
  console.log(`August 2026 turnos count: ${augustTurnos.length}`);
  
  let totPacTurnos = 0;
  let totAltasTurnos = 0;
  const daysSeen = {};

  augustTurnos.forEach(t => {
    totPacTurnos += Number(t.totalPacientes || 0);
    totAltasTurnos += Number(t.altasAdmin || 0);
    daysSeen[t.fechaInicio] = (daysSeen[t.fechaInicio] || 0) + Number(t.totalPacientes || 0);
    console.log(`Turno: ${t.fechaInicio} | ${t.horario} | Total: ${t.totalPacientes} | Altas: ${t.altasAdmin}`);
  });

  console.log(`\nTurnos sum for August: Total Pacientes = ${totPacTurnos}, Total Altas = ${totAltasTurnos}`);
  console.log('Days in turnos:', Object.keys(daysSeen).sort());
}

run().catch(console.error);
