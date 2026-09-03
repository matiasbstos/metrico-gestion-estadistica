const CHILE_HOLIDAYS_OFFICIAL = new Set([
  // 2026
  '2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01', '2026-05-21',
  '2026-06-07', '2026-06-21', '2026-06-29', '2026-07-16', '2026-08-15',
  '2026-09-18', '2026-09-19', '2026-10-12', '2026-10-31', '2026-11-01',
  '2026-12-08', '2026-12-25',
  // 2025
  '2025-01-01', '2025-04-18', '2025-04-19', '2025-05-01', '2025-05-21',
  '2025-06-20', '2025-06-29', '2025-07-16', '2025-08-15', '2025-09-18',
  '2025-09-19', '2025-10-12', '2025-10-31', '2025-11-01', '2025-12-08', '2025-12-25'
]);

function obtenerTurnoDetallado(timestamp, pautasDB = null) {
  if (!timestamp) return { turnoNum: '-', equipo: '-', tipo: '-', horario: '-', fechaTurno: '-', textoCompleto: '-' };

  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return { turnoNum: '-', equipo: '-', tipo: '-', horario: '-', fechaTurno: '-', textoCompleto: '-' };

  const hours = d.getHours();
  const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado
  const isWeekendNatural = (dayOfWeek === 0 || dayOfWeek === 6);

  const yRaw = d.getFullYear();
  const mRaw = String(d.getMonth() + 1).padStart(2, '0');
  const dRaw = String(d.getDate()).padStart(2, '0');
  const dateStrRaw = `${yRaw}-${mRaw}-${dRaw}`;
  const monthIdRaw = `${yRaw}-${mRaw}`;

  const isFestivoToday = CHILE_HOLIDAYS_OFFICIAL.has(dateStrRaw) || Boolean(pautasDB?.[monthIdRaw]?.[dateStrRaw]?.festivo);
  const is24hToday = isWeekendNatural || isFestivoToday;

  // Evaluar día de ayer
  const dPrev = new Date(timestamp);
  dPrev.setDate(dPrev.getDate() - 1);
  const yPrev = dPrev.getFullYear();
  const mPrev = String(dPrev.getMonth() + 1).padStart(2, '0');
  const dPrevDay = String(dPrev.getDate()).padStart(2, '0');
  const prevIso = `${yPrev}-${mPrev}-${dPrevDay}`;
  const prevDayOfWeek = dPrev.getDay();
  const isFestivoPrev = CHILE_HOLIDAYS_OFFICIAL.has(prevIso) || Boolean(pautasDB?.[prevIso.substring(0, 7)]?.[prevIso]?.festivo);
  const is24hPrev = (prevDayOfWeek === 0 || prevDayOfWeek === 6) || isFestivoPrev;

  let logicalDate = new Date(timestamp);
  let turnoNum = 1;
  let tipo = 'Turno de Semana';
  let horario = '17:00 a 08:00 hrs';

  if (hours < 8) {
    // Madrugada 00:00 a 07:59 pertenece a la guardia que inició el día anterior
    logicalDate.setDate(logicalDate.getDate() - 1);
    if (is24hPrev) {
      turnoNum = 3;
      tipo = isFestivoPrev ? 'Festivo Nocturno' : 'Fin de Semana Noche';
      horario = '20:00 a 08:00 hrs';
    } else {
      turnoNum = 2;
      tipo = 'Turno Largo Semana';
      horario = '17:00 a 08:00 hrs';
    }
  } else if (hours >= 8 && hours < 20) {
    // Franja Diurna 08:00 a 19:59
    if (is24hToday) {
      turnoNum = 1;
      tipo = isFestivoToday ? 'Festivo Diurno' : 'Fin de Semana Día';
      horario = '08:00 a 20:00 hrs';
    } else {
      turnoNum = 2;
      tipo = 'Turno Largo Semana';
      horario = '17:00 a 08:00 hrs';
    }
  } else {
    // Franja Nocturna 20:00 a 23:59
    if (is24hToday) {
      turnoNum = 3;
      tipo = isFestivoToday ? 'Festivo Nocturno' : 'Fin de Semana Noche';
      horario = '20:00 a 08:00 hrs';
    } else {
      turnoNum = 2;
      tipo = 'Turno Largo Semana';
      horario = '17:00 a 08:00 hrs';
    }
  }

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  const fechaTurno = `${day}/${m}/${y}`;
  const fechaIso = `${y}-${m}-${day}`;

  return {
    turnoNum,
    tipo,
    horario,
    fechaTurno,
    fechaIso
  };
}

// Pruebas unitarias de casos críticos
console.log("1. Jueves 30/04/2026 18:00 ->", obtenerTurnoDetallado(new Date('2026-04-30T18:00:00')));
console.log("2. Viernes 01/05/2026 03:00 AM (Festivo) ->", obtenerTurnoDetallado(new Date('2026-05-01T03:00:00')));
console.log("3. Viernes 01/05/2026 10:00 AM (Festivo Día) ->", obtenerTurnoDetallado(new Date('2026-05-01T10:00:00')));
console.log("4. Viernes 01/05/2026 21:00 PM (Festivo Noche) ->", obtenerTurnoDetallado(new Date('2026-05-01T21:00:00')));
console.log("5. Sábado 02/05/2026 04:00 AM (Post-Festivo Noche) ->", obtenerTurnoDetallado(new Date('2026-05-02T04:00:00')));
console.log("6. Sábado 02/05/2026 12:00 PM (Finde Día) ->", obtenerTurnoDetallado(new Date('2026-05-02T12:00:00')));
console.log("7. Domingo 03/05/2026 22:00 PM (Finde Noche) ->", obtenerTurnoDetallado(new Date('2026-05-03T22:00:00')));
console.log("8. Lunes 04/05/2026 05:00 AM (Madrugada post-Finde) ->", obtenerTurnoDetallado(new Date('2026-05-04T05:00:00')));
console.log("9. Lunes 04/05/2026 19:00 PM (Turno Hábil Lunes) ->", obtenerTurnoDetallado(new Date('2026-05-04T19:00:00')));
