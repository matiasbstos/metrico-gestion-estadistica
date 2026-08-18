function determineLastCompletedShift(maxDate) {
  const y = maxDate.getFullYear();
  const m = maxDate.getMonth();
  const d = maxDate.getDate();
  const dayOfWeek = maxDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 5 = Viernes, 6 = Sábado
  const hours = maxDate.getHours();
  const minutes = maxDate.getMinutes();
  const timeDecimal = hours + minutes / 60;

  const formatDateStr = (dateObj) => {
    const yr = dateObj.getFullYear();
    const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
    const da = String(dateObj.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  const getShiftObject = (startDateObj, endDateObj, hIni, hFin, preset) => ({
    fechaInicio: formatDateStr(startDateObj),
    fechaFin: formatDateStr(endDateObj),
    horaInicio: hIni,
    horaFin: hFin,
    preset: preset
  });

  // Si maxDate es Domingo (0)
  if (dayOfWeek === 0) {
    if (timeDecimal >= 20.0) {
      // Pasó las 20:00 del Domingo: El turno Finde Día del Domingo (08:00 a 20:00) está 100% COMPLETO.
      return getShiftObject(maxDate, maxDate, '08:00', '20:00', 'finde_dia');
    } else if (timeDecimal >= 8.0) {
      // Entre 08:00 y 20:00 del Domingo: El turno Finde Día está en curso. El último turno completo fue Finde Noche del Sábado (Sábado 20:00 a Domingo 08:00).
      const prevDate = new Date(y, m, d - 1);
      return getShiftObject(prevDate, maxDate, '20:00', '08:00', 'finde_noche');
    } else {
      // Antes de las 08:00 del Domingo (madrugada): El turno Finde Noche del Sábado sigue en curso. El último turno completo fue Finde Día del Sábado (Sábado 08:00 a 20:00).
      const prevDate = new Date(y, m, d - 1);
      return getShiftObject(prevDate, prevDate, '08:00', '20:00', 'finde_dia');
    }
  }

  // Si maxDate es Sábado (6)
  if (dayOfWeek === 6) {
    if (timeDecimal >= 20.0) {
      // Pasó las 20:00 del Sábado: El turno Finde Día del Sábado (08:00 a 20:00) está 100% COMPLETO.
      return getShiftObject(maxDate, maxDate, '08:00', '20:00', 'finde_dia');
    } else if (timeDecimal >= 9.0) {
      // Entre 09:00 y 20:00 del Sábado: El turno Finde Día está en curso. El último turno completo fue el Turno Largo del Viernes (Viernes 16:00 a Sábado 09:00 AM).
      const prevDate = new Date(y, m, d - 1);
      return getShiftObject(prevDate, maxDate, '16:00', '09:00', 'largo');
    } else {
      // Antes de las 09:00 del Sábado (madrugada): El turno Largo del Viernes sigue en curso. El último turno completo fue el Turno Largo del Jueves (Jueves 16:00 a Viernes 09:00 AM).
      const thursdayDate = new Date(y, m, d - 2);
      const fridayDate = new Date(y, m, d - 1);
      return getShiftObject(thursdayDate, fridayDate, '16:00', '09:00', 'largo');
    }
  }

  // Si maxDate es Lunes (1)
  if (dayOfWeek === 1) {
    if (timeDecimal >= 8.0) {
      // Pasó las 08:00 del Lunes: El turno Finde Noche del Domingo (Domingo 20:00 a Lunes 08:00 AM) está 100% COMPLETO.
      const prevDate = new Date(y, m, d - 1);
      return getShiftObject(prevDate, maxDate, '20:00', '08:00', 'finde_noche');
    } else {
      // Antes de las 08:00 del Lunes (madrugada): El turno Finde Noche del Domingo sigue en curso. El último turno completo fue Finde Día del Domingo (Domingo 08:00 a 20:00).
      const prevDate = new Date(y, m, d - 1);
      return getShiftObject(prevDate, prevDate, '08:00', '20:00', 'finde_dia');
    }
  }

  // Si maxDate es Martes a Viernes (2, 3, 4, 5)
  if (timeDecimal >= 9.0) {
    // Pasó las 09:00 AM: El turno Largo de la noche anterior (Día D-1 16:00 a Día D 09:00 AM) está 100% COMPLETO.
    const prevDate = new Date(y, m, d - 1);
    return getShiftObject(prevDate, maxDate, '16:00', '09:00', 'largo');
  } else {
    // Antes de las 09:00 AM (madrugada): El turno Largo de la noche anterior sigue en curso. El último completo fue el del día D-2 al día D-1.
    const prev2Date = new Date(y, m, d - 2);
    const prevDate = new Date(y, m, d - 1);
    return getShiftObject(prev2Date, prevDate, '16:00', '09:00', 'largo');
  }
}

// Tests
const testCases = [
  { name: 'Domingo 16/08 23:57 (Current case)', date: new Date(2026, 7, 16, 23, 57) },
  { name: 'Lunes 17/08 08:15 AM', date: new Date(2026, 7, 17, 8, 15) },
  { name: 'Lunes 17/08 05:00 AM', date: new Date(2026, 7, 17, 5, 0) },
  { name: 'Sábado 15/08 21:00 PM', date: new Date(2026, 7, 15, 21, 0) },
  { name: 'Sábado 15/08 14:00 PM', date: new Date(2026, 7, 15, 14, 0) },
  { name: 'Jueves 13/08 22:00 PM', date: new Date(2026, 7, 13, 22, 0) },
  { name: 'Jueves 13/08 10:00 AM', date: new Date(2026, 7, 13, 10, 0) },
  { name: 'Jueves 13/08 06:00 AM', date: new Date(2026, 7, 13, 6, 0) },
];

testCases.forEach(tc => {
  const res = determineLastCompletedShift(tc.date);
  console.log(`[${tc.name}] =>`, JSON.stringify(res));
});
