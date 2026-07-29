export const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;

export const formatTime = (minutes) => {
  if (isNaN(minutes) || minutes < 0 || minutes === null) return '-';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60); const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
};

export const truncateStr = (str, n) => {
  if (!str) return '';
  const safeStr = String(str);
  return safeStr.length > n ? safeStr.substr(0, n - 1) + '...' : safeStr;
};

/**
 * Determina el Turno Asociado (Turno 1, 2 o 3), el tipo de turno y su horario de atención.
 * - Turno 1 (Largo / Diurno): 08:00 a 17:00 / 20:00 hrs
 * - Turno 2 (Noche / Nocturno): 17:00 a 08:00 hrs del día siguiente
 * - Turno 3 (Fin de Semana / Relevo Noche 24h): 20:00 a 08:00 hrs
 */
export const obtenerTurnoDetallado = (timestamp) => {
  if (!timestamp) return { turnoNum: '-', tipo: '-', horario: '-', fechaTurno: '-', textoCompleto: '-' };

  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return { turnoNum: '-', tipo: '-', horario: '-', fechaTurno: '-', textoCompleto: '-' };

  const hours = d.getHours();
  const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

  let logicalDate = new Date(timestamp);
  let turnoNum = 1;
  let tipo = 'Largo Diurno';
  let horario = '08:00 a 17:00 hrs';

  if (isWeekend) {
    if (hours >= 8 && hours < 20) {
      turnoNum = 1;
      tipo = 'Fin de Semana Día';
      horario = '08:00 a 20:00 hrs';
    } else {
      turnoNum = 3;
      tipo = 'Fin de Semana Noche';
      horario = '20:00 a 08:00 hrs';
      if (hours < 8) logicalDate.setDate(logicalDate.getDate() - 1);
    }
  } else {
    if (hours >= 8 && hours < 17) {
      turnoNum = 1;
      tipo = 'Turno Largo Diurno';
      horario = '08:00 a 17:00 hrs';
    } else {
      turnoNum = 2;
      tipo = 'Turno Nocturno / Largo';
      horario = '17:00 a 08:00 hrs';
      if (hours < 8) logicalDate.setDate(logicalDate.getDate() - 1);
    }
  }

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  const fechaTurno = `${day}/${m}/${y}`;

  const textoCompleto = `${fechaTurno} - Turno ${turnoNum} (${tipo} ${horario})`;

  return {
    turnoNum,
    tipo,
    horario,
    fechaTurno,
    textoCompleto
  };
};
