const https = require('https');

const appId = 'urgencias-dashboard';

function getAllTurnosDocs() {
  return new Promise((resolve, reject) => {
    let allDocs = [];
    function fetchPage(pageToken) {
      let url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/turnos?pageSize=300`;
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

// Lista oficial de Feriados en Chile 2026
const CHILE_HOLIDAYS_2026 = new Set([
  '2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01', '2026-05-21',
  '2026-06-07', '2026-06-21', '2026-06-29', '2026-07-16', '2026-08-15',
  '2026-09-18', '2026-09-19', '2026-10-12', '2026-10-31', '2026-11-01',
  '2026-12-08', '2026-12-25'
]);

async function run() {
  const docs = await getAllTurnosDocs();
  console.log(`Total turnos en Firestore: ${docs.length}`);

  const turnos = [];
  docs.forEach(doc => {
    const f = doc.fields || {};
    const id = doc.name.split('/').pop();
    const fechaInicio = f.fechaInicio ? f.fechaInicio.stringValue : '';
    const fechaFin = f.fechaFin ? f.fechaFin.stringValue : '';
    const horaInicio = f.horaInicio ? f.horaInicio.stringValue : '';
    const horaFin = f.horaFin ? f.horaFin.stringValue : '';
    const horario = f.horario ? f.horario.stringValue : '';
    const totalPacientes = f.totalPacientes ? Number(f.totalPacientes.integerValue || f.totalPacientes.doubleValue || 0) : 0;
    const altasAdmin = f.altasAdmin ? Number(f.altasAdmin.integerValue || f.altasAdmin.doubleValue || 0) : 0;
    const atendidos = f.atendidos ? Number(f.atendidos.integerValue || f.atendidos.doubleValue || 0) : (totalPacientes - altasAdmin);

    if (!fechaInicio) return;
    if (!fechaInicio.startsWith('2026')) return; // Solo 2026

    const horLower = (horario || '').toLowerCase();
    // Descartar registros agregados de 24 horas continuas
    if (horLower.includes('24 hrs') || horLower.includes('día completo') || horLower.includes('dia completo')) {
      return;
    }

    const parts = fechaInicio.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 6 = Sábado
    const isHoliday = CHILE_HOLIDAYS_2026.has(fechaInicio);
    const isWknd = (dayOfWeek === 0 || dayOfWeek === 6) || isHoliday || horLower.includes('fin de semana') || horLower.includes('festivo') || horLower.includes('08:00 - 20:00') || horLower.includes('08:00 a 20:00');

    const dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;

    turnos.push({
      id,
      fechaInicio,
      dateStr,
      horario,
      horaInicio,
      horaFin,
      totalPacientes,
      altasAdmin,
      atendidos,
      dayOfWeek,
      isHoliday,
      isWknd
    });
  });

  console.log(`\nTurnos individuales válidos de 2026: ${turnos.length}`);

  console.log("\n=== TOP 10 TURNOS HÁBILES (LUNES A VIERNES NO FESTIVOS) ===");
  const habiles = turnos.filter(t => !t.isWknd).sort((a, b) => b.totalPacientes - a.totalPacientes);
  habiles.slice(0, 10).forEach((t, idx) => {
    console.log(`#${idx + 1}: Fecha ${t.dateStr} (${t.fechaInicio}) [${t.horario || `${t.horaInicio}-${t.horaFin}`}] -> ${t.totalPacientes} pac. (${t.altasAdmin} altas) | ID: ${t.id}`);
  });

  console.log("\n=== TOP 10 TURNOS FIN DE SEMANA / FESTIVOS (08:00-20:00 ó 20:00-08:00) ===");
  const findes = turnos.filter(t => t.isWknd).sort((a, b) => b.totalPacientes - a.totalPacientes);
  findes.slice(0, 10).forEach((t, idx) => {
    console.log(`#${idx + 1}: Fecha ${t.dateStr} (${t.fechaInicio}) [${t.horario || `${t.horaInicio}-${t.horaFin}`}] -> ${t.totalPacientes} pac. (${t.altasAdmin} altas) | ID: ${t.id}`);
  });

  console.log("\n=== TOP 10 ALTAS DÍA HÁBIL ===");
  const altasHabiles = turnos.filter(t => !t.isWknd).sort((a, b) => b.altasAdmin - a.altasAdmin);
  altasHabiles.slice(0, 10).forEach((t, idx) => {
    console.log(`#${idx + 1}: Fecha ${t.dateStr} (${t.fechaInicio}) [${t.horario}] -> ${t.altasAdmin} altas (Total pac: ${t.totalPacientes}) | ID: ${t.id}`);
  });

  console.log("\n=== TOP 10 ALTAS FIN DE SEMANA / FESTIVO ===");
  const altasFindes = turnos.filter(t => t.isWknd).sort((a, b) => b.altasAdmin - a.altasAdmin);
  altasFindes.slice(0, 10).forEach((t, idx) => {
    console.log(`#${idx + 1}: Fecha ${t.dateStr} (${t.fechaInicio}) [${t.horario}] -> ${t.altasAdmin} altas (Total pac: ${t.totalPacientes}) | ID: ${t.id}`);
  });

  console.log("\n=== REVISIÓN ESPECÍFICA DEL 30-04-2026 Y 01-05-2026 ===");
  turnos.filter(t => t.fechaInicio === '2026-04-30' || t.fechaInicio === '2026-05-01').forEach(t => {
    console.log(`Fecha: ${t.fechaInicio} [${t.horario}] -> ${t.totalPacientes} pac. (${t.altasAdmin} altas) | ID: ${t.id} | isWknd: ${t.isWknd}`);
  });
}

run().catch(console.error);
