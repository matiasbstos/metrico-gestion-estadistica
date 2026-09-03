const https = require('https');

const projectId = 'metrico-dashboard-2026';
const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

// Feriados oficiales en Chile 2026
const CHILE_HOLIDAYS_2026 = new Set([
  '2026-01-01', // Año Nuevo
  '2026-04-03', // Viernes Santo
  '2026-04-04', // Sábado Santo
  '2026-05-01', // Día del Trabajo (Viernes)
  '2026-05-21', // Día de las Glorias Navales (Jueves)
  '2026-06-07', // Primarias
  '2026-06-21', // Pueblos Indígenas (Domingo)
  '2026-06-29', // San Pedro y San Pablo (Lunes)
  '2026-07-16', // Virgen del Carmen (Jueves)
  '2026-08-15', // Asunción de la Virgen (Sábado)
  '2026-09-18', '2026-09-19', '2026-10-12', '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25'
]);

function fetchMonth(startMs, endMs) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'pacientes_urgencia', allDescendants: false }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'tAdmision' },
                  op: 'GREATER_THAN_OR_EQUAL',
                  value: { integerValue: startMs }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'tAdmision' },
                  op: 'LESS_THAN_OR_EQUAL',
                  value: { integerValue: endMs }
                }
              }
            ]
          }
        },
        limit: 10000
      }
    });

    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            console.error("Query error:", json.error);
            resolve([]);
            return;
          }
          const docs = json.map(item => item.document).filter(Boolean);
          resolve(docs);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function parseTurnoExacto(timestamp) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return null;

  const hours = d.getHours();
  const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado
  const isWeekendNatural = (dayOfWeek === 0 || dayOfWeek === 6);

  const yRaw = d.getFullYear();
  const mRaw = String(d.getMonth() + 1).padStart(2, '0');
  const dRaw = String(d.getDate()).padStart(2, '0');
  const dateStrRaw = `${yRaw}-${mRaw}-${dRaw}`;

  const isFestivo = CHILE_HOLIDAYS_2026.has(dateStrRaw);
  const is24hOperatingDay = isWeekendNatural || isFestivo;

  let logicalDate = new Date(timestamp);
  let tipo = 'Turno Hábil Semana';
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
    // Día hábil de semana (Lunes a Viernes no festivo)
    tipo = 'Turno Hábil Semana (17:00-08:00)';
    horario = '17:00 a 08:00 hrs';
    isWknd = false;
    if (hours < 16) {
      // Madrugada antes de las 16:00 pertenece al turno que empezó ayer
      logicalDate.setDate(logicalDate.getDate() - 1);
      
      const yPrev = logicalDate.getFullYear();
      const mPrev = String(logicalDate.getMonth() + 1).padStart(2, '0');
      const dPrev = String(logicalDate.getDate()).padStart(2, '0');
      const prevIso = `${yPrev}-${mPrev}-${dPrev}`;
      const prevDayOfWeek = logicalDate.getDay();
      const prevIs24h = (prevDayOfWeek === 0 || prevDayOfWeek === 6) || CHILE_HOLIDAYS_2026.has(prevIso);
      if (prevIs24h) {
        tipo = CHILE_HOLIDAYS_2026.has(prevIso) ? 'Festivo Noche (20:00-08:00)' : 'Fin de Semana Noche (20:00-08:00)';
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
  console.log("Consultando pacientes 2026 mes a mes...");
  const months = [
    { name: 'Ene', start: new Date(2026, 0, 1).getTime(), end: new Date(2026, 0, 31, 23, 59, 59).getTime() },
    { name: 'Feb', start: new Date(2026, 1, 1).getTime(), end: new Date(2026, 1, 28, 23, 59, 59).getTime() },
    { name: 'Mar', start: new Date(2026, 2, 1).getTime(), end: new Date(2026, 2, 31, 23, 59, 59).getTime() },
    { name: 'Abr', start: new Date(2026, 3, 1).getTime(), end: new Date(2026, 3, 30, 23, 59, 59).getTime() },
    { name: 'May', start: new Date(2026, 4, 1).getTime(), end: new Date(2026, 4, 31, 23, 59, 59).getTime() },
    { name: 'Jun', start: new Date(2026, 5, 1).getTime(), end: new Date(2026, 5, 30, 23, 59, 59).getTime() },
    { name: 'Jul', start: new Date(2026, 6, 1).getTime(), end: new Date(2026, 6, 31, 23, 59, 59).getTime() },
    { name: 'Ago', start: new Date(2026, 7, 1).getTime(), end: new Date(2026, 7, 31, 23, 59, 59).getTime() }
  ];

  let allPacs = [];
  for (const m of months) {
    const docs = await fetchMonth(m.start, m.end);
    console.log(`Mes ${m.name}: ${docs.length} registros`);
    docs.forEach(doc => {
      const f = doc.fields || {};
      const id = doc.name.split('/').pop();
      const corr = f.correlativo ? (f.correlativo.stringValue || f.correlativo.integerValue) : id;
      const tAdm = f.tAdmision ? Number(f.tAdmision.integerValue || f.tAdmision.doubleValue || 0) : 0;
      const destAlta = f.destinoAlta ? f.destinoAlta.stringValue : '';
      const estado = f.estado ? f.estado.stringValue : '';
      const isAlta = estado === 'Cancelada' || destAlta.toLowerCase().includes('alta') || destAlta.toLowerCase().includes('retiro');

      if (tAdm > 0) {
        allPacs.push({ corr, tAdm, isAlta });
      }
    });
  }

  console.log(`Total pacientes descargados: ${allPacs.length}`);

  // Deduplicar
  const pacMap = new Map();
  allPacs.forEach(p => {
    const key = `${p.corr}_${p.tAdm}`;
    pacMap.set(key, p);
  });
  console.log(`Total pacientes 2026 deduplicados: ${pacMap.size}`);

  // Agrupar por turnos lógicos exactos
  const shiftsMap = new Map();
  pacMap.forEach(p => {
    const turno = parseTurnoExacto(p.tAdm);
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

  console.log("\n==========================================================");
  console.log("=== TOP 10 TURNOS HÁBILES (LUNES A VIERNES 17:00-08:00) ===");
  console.log("==========================================================");
  const habiles = allShifts.filter(s => !s.isWknd).sort((a, b) => b.count - a.count);
  habiles.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: Fecha ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.count} pac. (${s.altas} altas) [${s.tipo}]`);
  });

  console.log("\n==========================================================");
  console.log("=== TOP 10 TURNOS FIN DE SEMANA / FESTIVOS (DÍA O NOCHE) ===");
  console.log("==========================================================");
  const findes = allShifts.filter(s => s.isWknd).sort((a, b) => b.count - a.count);
  findes.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: Fecha ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.count} pac. (${s.altas} altas) [${s.tipo}]`);
  });

  console.log("\n==========================================================");
  console.log("=== TOP 10 ALTAS DÍA HÁBIL ===");
  console.log("==========================================================");
  const altasHabiles = allShifts.filter(s => !s.isWknd).sort((a, b) => b.altas - a.altas);
  altasHabiles.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: Fecha ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.altas} altas (Total pac: ${s.count})`);
  });

  console.log("\n==========================================================");
  console.log("=== TOP 10 ALTAS FIN DE SEMANA / FESTIVO ===");
  console.log("==========================================================");
  const altasFindes = allShifts.filter(s => s.isWknd).sort((a, b) => b.altas - a.altas);
  altasFindes.slice(0, 10).forEach((s, idx) => {
    console.log(`#${idx + 1}: Fecha ${s.fechaTurno} (${s.fechaIso}) [${s.horario}] -> ${s.altas} altas (Total pac: ${s.count})`);
  });
}

run().catch(console.error);
