const https = require('https');

const appId = 'urgencias-dashboard';

// Lista oficial de Feriados / Festivos en Chile 2026 (y 2025)
const CHILE_HOLIDAYS = new Set([
  // 2026
  '2026-01-01', // Año Nuevo
  '2026-04-03', // Viernes Santo
  '2026-04-04', // Sábado Santo
  '2026-05-01', // Día Nacional del Trabajo
  '2026-05-21', // Día de las Glorias Navales
  '2026-06-07', // Elecciones Primarias / Asalto Morro de Arica
  '2026-06-21', // Día Nacional de los Pueblos Indígenas
  '2026-06-29', // San Pedro y San Pablo
  '2026-07-16', // Día de la Virgen del Carmen
  '2026-08-15', // Asunción de la Virgen
  '2026-09-18', // Fiestas Patrias
  '2026-09-19', // Día de las Glorias del Ejército
  '2026-10-12', // Encuentro de Dos Mundos
  '2026-10-31', // Día de las Iglesias Evangélicas
  '2026-11-01', // Día de Todos los Santos
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
  // 2025
  '2025-01-01', '2025-04-18', '2025-04-19', '2025-05-01', '2025-05-21',
  '2025-06-20', '2025-06-29', '2025-07-16', '2025-08-15', '2025-09-18',
  '2025-09-19', '2025-10-12', '2025-10-31', '2025-11-01', '2025-12-08', '2025-12-25'
]);

function isHoliday(dateStr) {
  return CHILE_HOLIDAYS.has(dateStr);
}

function getAllPacientesDocs() {
  return new Promise((resolve, reject) => {
    let allDocs = [];
    function fetchPage(pageToken) {
      let url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/pacientes_urgencia?pageSize=1000`;
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

function parseTurno(timestamp) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return null;

  const hours = d.getHours();
  const dayOfWeek = d.getDay(); // 0 = Dom, 6 = Sab
  const isWeekendNatural = (dayOfWeek === 0 || dayOfWeek === 6);

  const yRaw = d.getFullYear();
  const mRaw = String(d.getMonth() + 1).padStart(2, '0');
  const dRaw = String(d.getDate()).padStart(2, '0');
  const dateStrRaw = `${yRaw}-${mRaw}-${dRaw}`;

  const isFestivo = isHoliday(dateStrRaw);
  const is24hOperatingDay = isWeekendNatural || isFestivo;

  let logicalDate = new Date(timestamp);
  let tipo = 'Turno de Semana';
  let horario = '17:00 a 08:00 hrs';
  let isWknd = is24hOperatingDay;

  if (is24hOperatingDay) {
    if (hours >= 8 && hours < 20) {
      tipo = isFestivo ? 'Festivo Día (08:00-20:00)' : 'Fin de Semana Día (08:00-20:00)';
      horario = '08:00 a 20:00 hrs';
    } else {
      tipo = isFestivo ? 'Festivo Noche (20:00-08:00)' : 'Fin de Semana Noche (20:00-08:00)';
      horario = '20:00 a 08:00 hrs';
      if (hours < 8) logicalDate.setDate(logicalDate.getDate() - 1);
    }
  } else {
    // Día hábil de semana
    tipo = 'Turno Hábil Semana (17:00-08:00)';
    horario = '17:00 a 08:00 hrs';
    isWknd = false;
    if (hours < 16) {
      // Madrugada antes de las 16:00
      logicalDate.setDate(logicalDate.getDate() - 1);
      // Ojo: si el día anterior fue festivo o fin de semana, verificar qué turno era
      const yPrev = logicalDate.getFullYear();
      const mPrev = String(logicalDate.getMonth() + 1).padStart(2, '0');
      const dPrev = String(logicalDate.getDate()).padStart(2, '0');
      const prevIso = `${yPrev}-${mPrev}-${dPrev}`;
      const prevDayOfWeek = logicalDate.getDay();
      const prevIs24h = (prevDayOfWeek === 0 || prevDayOfWeek === 6) || isHoliday(prevIso);
      if (prevIs24h) {
        tipo = isHoliday(prevIso) ? 'Festivo Noche (20:00-08:00)' : 'Fin de Semana Noche (20:00-08:00)';
        horario = '20:00 a 08:00 hrs';
        isWknd = true;
      }
    }
  }

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  const fechaTurno = `${day}/${m}/${y}`;
  const fechaIso = `${y}-${m}-${day}`;

  return {
    fechaTurno,
    fechaIso,
    horario,
    tipo,
    isWknd
  };
}

async function run() {
  console.log("Cargando pacientes desde Firestore...");
  const docs = await getAllPacientesDocs();
  console.log(`Total docs cargados: ${docs.length}`);

  // Deduplicar pacientes
  const pacMap = new Map();
  docs.forEach(doc => {
    const f = doc.fields || {};
    const corr = f.correlativo ? (f.correlativo.stringValue || f.correlativo.integerValue) : doc.name.split('/').pop();
    const tAdm = f.tAdmision ? Number(f.tAdmision.integerValue || f.tAdmision.doubleValue || 0) : 0;
    const destAlta = f.destinoAlta ? f.destinoAlta.stringValue : '';
    const estado = f.estado ? f.estado.stringValue : '';
    const isAlta = estado === 'Cancelada' || destAlta.toLowerCase().includes('alta') || destAlta.toLowerCase().includes('retiro');

    if (!tAdm) return;
    const dateObj = new Date(tAdm);
    if (dateObj.getFullYear() !== 2026) return; // Solo 2026

    const key = `${corr}_${tAdm}`;
    pacMap.set(key, { corr, tAdm, isAlta });
  });

  console.log(`Total pacientes 2026 deduplicados: ${pacMap.size}`);

  const shiftsMap = new Map();

  pacMap.forEach(p => {
    const turno = parseTurno(p.tAdm);
    if (!turno) return;

    const key = `${turno.fechaIso}_${turno.horario}_${turno.tipo}`;
    if (!shiftsMap.has(key)) {
      shiftsMap.set(key, {
        fechaIso: turno.fechaIso,
        fechaTurno: turno.fechaTurno,
        horario: turno.horario,
        tipo: turno.tipo,
        isWknd: turno.isWknd,
        count: 0,
        altas: 0
      });
    }

    const s = shiftsMap.get(key);
    s.count++;
    if (p.isAlta) s.altas++;
  });

  const allShifts = Array.from(shiftsMap.values());

  console.log("\n=== TOP 10 TURNOS HÁBILES (DÍAS DE SEMANA) ===");
  const habiles = allShifts.filter(s => !s.isWknd).sort((a, b) => b.count - a.count);
  habiles.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.count} pacientes (${s.altas} altas) [${s.tipo}]`);
  });

  console.log("\n=== TOP 10 TURNOS FIN DE SEMANA / FESTIVOS ===");
  const findes = allShifts.filter(s => s.isWknd).sort((a, b) => b.count - a.count);
  findes.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.count} pacientes (${s.altas} altas) [${s.tipo}]`);
  });

  console.log("\n=== TOP 10 ALTAS DÍA HÁBIL ===");
  const altasHabiles = allShifts.filter(s => !s.isWknd).sort((a, b) => b.altas - a.altas);
  altasHabiles.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.altas} altas (Total pac: ${s.count})`);
  });

  console.log("\n=== TOP 10 ALTAS FIN DE SEMANA / FESTIVO ===");
  const altasFindes = allShifts.filter(s => s.isWknd).sort((a, b) => b.altas - a.altas);
  altasFindes.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.altas} altas (Total pac: ${s.count})`);
  });

  // Verificar específicamente el 30/04/2026
  console.log("\n=== DETALLE ESPECÍFICO DEL 30/04/2026 Y 01/05/2026 ===");
  allShifts.filter(s => s.fechaIso === '2026-04-30' || s.fechaIso === '2026-05-01').forEach(s => {
    console.log(`${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.count} pacientes, ${s.altas} altas [${s.tipo}]`);
  });
}

run().catch(console.error);
