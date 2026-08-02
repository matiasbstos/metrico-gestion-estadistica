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

export const formatLocalDate = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Deduplica una lista de registros de pacientes/traslados asegurando que:
 * 1. Coincidencias en correlativo + franja horaria / turno se identifiquen como duplicados y se conserve una sola instancia.
 * 2. Si un paciente reingresa el mismo día en franjas horarias o turnos diferentes, se conserven sus atenciones legítimas.
 */
export const deduplicarPacientes = (pacientes) => {
  if (!pacientes || !Array.isArray(pacientes) || pacientes.length === 0) return [];

  const seenKeys = new Set();
  const result = [];

  pacientes.forEach(p => {
    if (!p) return;

    // 1. Extraer y normalizar correlativo / ID de atención
    const rawCorr = p.correlativo || p.idPaciente || p.id || '';
    const cleanCorr = String(rawCorr).trim().replace(/,/g, '').replace(/\.00$/, '');

    // 2. Extraer franja horaria / turno de atención
    let timeSlotKey = '';
    if (p.tAdmision) {
      const det = obtenerTurnoDetallado(p.tAdmision);
      timeSlotKey = det.textoCompleto;
    } else {
      const fecha = String(p.fechaAdmision || p.fecha || '').trim();
      const hora = String(p.horaAdmision || p.hora || '').trim();
      timeSlotKey = `${fecha}_${hora}`;
    }

    // 3. Clave de desduplicación (Correlativo + Franja Horaria/Turno)
    let dedupKey = '';
    if (cleanCorr && cleanCorr !== '-' && cleanCorr !== '0' && cleanCorr !== 'null' && cleanCorr !== 'undefined') {
      dedupKey = `${cleanCorr}_${timeSlotKey}`;
    } else {
      const rutOrName = String(p.rut || p.nombrePaciente || p.nombre || '').trim().toUpperCase();
      const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').trim().toUpperCase();
      if (rutOrName || diag) {
        dedupKey = `ALT_${rutOrName}_${diag}_${timeSlotKey}`;
      }
    }

    if (dedupKey) {
      if (seenKeys.has(dedupKey)) {
        return; // Registro duplicado en la misma franja horaria -> Omitir
      }
      seenKeys.add(dedupKey);
    }

    result.push(p);
  });

  return result;
};
