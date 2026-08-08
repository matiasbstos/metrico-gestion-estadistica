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
 * Determina el Turno Asociado (Turno 1, 2 o 3), el equipo asignado y su horario oficial de urgencia.
 * - Turno de Semana: 17:00 a 08:00 hrs del día siguiente.
 * - Fin de Semana (Día): 08:00 a 20:00 hrs.
 * - Fin de Semana (Noche): 20:00 a 08:00 hrs del día siguiente.
 */
export const obtenerTurnoDetallado = (timestamp) => {
  if (!timestamp) return { turnoNum: '-', equipo: '-', tipo: '-', horario: '-', fechaTurno: '-', textoCompleto: '-' };

  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return { turnoNum: '-', equipo: '-', tipo: '-', horario: '-', fechaTurno: '-', textoCompleto: '-' };

  const hours = d.getHours();
  const mins = d.getMinutes();
  const totalMins = hours * 60 + mins;
  const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

  let logicalDate = new Date(timestamp);
  let turnoNum = 1;
  let tipo = 'Turno de Semana';
  let horario = '17:00 a 08:00 hrs';

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
    // Día de semana (Lunes a Viernes)
    if (totalMins >= 960 || totalMins < 540) {
      turnoNum = 2;
      tipo = 'Turno Largo Semana';
      horario = '17:00 a 08:00 hrs';
      if (totalMins < 540) logicalDate.setDate(logicalDate.getDate() - 1);
    } else {
      turnoNum = 1;
      tipo = 'Refuerzo Diurno Semana';
      horario = '09:00 a 16:00 hrs';
    }
  }

  // Rotativa asignada de Equipo (Equipo 1, Equipo 2, Equipo 3)
  const dayOfYear = Math.floor((logicalDate - new Date(logicalDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const equipoNum = ((dayOfYear + turnoNum) % 3) + 1;
  const equipo = `Equipo ${equipoNum}`;

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  const fechaTurno = `${day}/${m}/${y}`;

  const textoCompleto = `${fechaTurno} - Turno ${turnoNum} (${equipo} • ${tipo} ${horario})`;

  return {
    turnoNum,
    equipo,
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

  const map = new Map();
  const result = [];

  pacientes.forEach(p => {
    if (!p) return;
    const idUnico = p.id || p.docId || p.correlativo || p.rutPaciente || p.ficha || p.nombrePaciente;
    const tMs = p.tAdmision || p.timestamp || 0;
    const key = `${idUnico}_${Math.floor(tMs / 1800000)}`;

    if (map.has(key)) return;
    map.set(key, true);
    result.push(p);
  });

  return result;
};

/**
 * Inteligencia de Verificación y Auditoría de Turnos CERRADOS para el envío de informes por correo.
 * 1. Agrupa los datos por turno.
 * 2. Verifica que el turno tenga dispersión temporal completa (en turno noche debe extenderse hasta la mañana siguiente >06:00 AM).
 * 3. Si el turno más reciente está cortado a medianoche, retrocede automáticamente al turno completo anterior.
 */
export const auditarUltimoTurnoCompleto = (turnosDB = [], pacientesDB = []) => {
  if (!pacientesDB || pacientesDB.length === 0) {
    return { exito: false, mensaje: 'Sin datos para auditar turnos.', turnoInfo: null };
  }

  // Deduplicar y ordenar pacientes por timestamp descendente
  const listPacs = deduplicarPacientes(pacientesDB).filter(p => p && p.tAdmision).sort((a, b) => b.tAdmision - a.tAdmision);
  if (listPacs.length === 0) {
    return { exito: false, mensaje: 'Sin admisiones validas.', turnoInfo: null };
  }

  // Agrupar pacientes por (fechaTurno + turnoNum)
  const shiftGroups = {};
  listPacs.forEach(p => {
    const det = obtenerTurnoDetallado(p.tAdmision);
    const key = `${det.fechaTurno}_T${det.turnoNum}`;
    if (!shiftGroups[key]) {
      shiftGroups[key] = {
        key,
        fechaTurno: det.fechaTurno,
        turnoNum: det.turnoNum,
        equipo: det.equipo,
        tipo: det.tipo,
        horario: det.horario,
        textoCompleto: det.textoCompleto,
        pacientes: [],
        maxTimestamp: 0,
        minTimestamp: Infinity
      };
    }
    shiftGroups[key].pacientes.push(p);
    if (p.tAdmision > shiftGroups[key].maxTimestamp) shiftGroups[key].maxTimestamp = p.tAdmision;
    if (p.tAdmision < shiftGroups[key].minTimestamp) shiftGroups[key].minTimestamp = p.tAdmision;
  });

  // Evaluar cada turno del más reciente al más antiguo hasta encontrar uno 100% CERRADO Y COMPLETO
  const sortedGroupKeys = Object.keys(shiftGroups).sort((a, b) => shiftGroups[b].maxTimestamp - shiftGroups[a].maxTimestamp);

  let verifiedShift = null;
  let isVerifiedShiftComplete = true;

  for (const groupKey of sortedGroupKeys) {
    const group = shiftGroups[groupKey];
    
    // Verificación estricta de turno cerrado:
    // La diferencia de horas entre el primer y último registro debe ser >= 11 horas
    // Y para turnos de noche, el último registro debe ser posterior a las 06:00 AM del día siguiente
    const timeSpanHours = (group.maxTimestamp - group.minTimestamp) / (1000 * 60 * 60);
    const maxDate = new Date(group.maxTimestamp);
    const maxHours = maxDate.getHours();

    const isNightShift = group.tipo.includes('Noche') || group.tipo.includes('Largo');
    
    let isComplete = false;
    if (isNightShift) {
      // Un turno noche completo DEBE tener admisiones registradas al día siguiente entre las 06:00 AM y 09:30 AM
      isComplete = timeSpanHours >= 11 && (maxHours >= 6 && maxHours <= 10);
    } else {
      // Turno día completo (08:00 a 20:00)
      isComplete = timeSpanHours >= 10 && maxHours >= 19;
    }

    if (isComplete) {
      verifiedShift = group;
      isVerifiedShiftComplete = true;
      break;
    }
  }

  // Si ningún turno cumple la prueba estricta (por corte de carga de datos), tomar el grupo más reciente
  if (!verifiedShift && sortedGroupKeys.length > 0) {
    const allGroups = Object.values(shiftGroups);
    allGroups.sort((a, b) => b.maxTimestamp - a.maxTimestamp);
    verifiedShift = allGroups[0];
    isVerifiedShiftComplete = false;
  }

  if (!verifiedShift) {
    return { exito: false, esTurnoCompleto: false, mensaje: 'No se encontraron turnos cerrados validos.', turnoInfo: null };
  }

  const pacsTurno = verifiedShift.pacientes;
  const totalAdmitidos = pacsTurno.length;
  const altasAdmin = pacsTurno.filter(p => p.estado === 'Cancelada').length;
  const atendidos = totalAdmitidos - altasAdmin;

  let fracturasCount = 0;
  let constatacionesCount = 0;
  let trasladosCount = 0;

  const triage = { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 };
  const medMap = {};

  pacsTurno.forEach(p => {
    const diag = String(p.diagnosticoPrincipal || p.codigoDiagnostico || p.diagnostico || '').toLowerCase();
    const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
    const cat = String(p.categoria || p.triage || '').toUpperCase();

    if (diag.includes('fractura') || diag.includes('fx')) fracturasCount++;
    if (diag.includes('z51.8') || diag.includes('z518') || diag.includes('constatacion') || diag.includes('lesiones')) constatacionesCount++;
    if (dest.includes('hospital') || dest.includes('ueh') || dest.includes('derivado') || dest.includes('traslado')) trasladosCount++;

    if (cat.includes('C1')) triage.c1++;
    else if (cat.includes('C2')) triage.c2++;
    else if (cat.includes('C3')) triage.c3++;
    else if (cat.includes('C4')) triage.c4++;
    else if (cat.includes('C5')) triage.c5++;

    const medName = String(p.medico || p.profesional || '').trim();
    if (medName && medName !== '-' && medName.length > 3) {
      medMap[medName] = (medMap[medName] || 0) + 1;
    }
  });

  const topMed = Object.entries(medMap).sort((a,b) => b[1] - a[1])[0];
  const medicoMasProductivo = topMed ? `${topMed[0]} (${topMed[1]} atenciones)` : 'No especificado';

  return {
    exito: true,
    esTurnoCompleto: isVerifiedShiftComplete,
    turnoInfo: {
      fechaTurno: verifiedShift.fechaTurno,
      turnoNum: verifiedShift.turnoNum,
      equipo: verifiedShift.equipo,
      tipo: verifiedShift.tipo,
      horario: verifiedShift.horario,
      rotativa: `${verifiedShift.tipo} (${verifiedShift.horario})`,
      textoCompleto: verifiedShift.textoCompleto,
      totalAdmitidos,
      atendidos,
      altasAdmin,
      fracturasCount,
      constatacionesCount,
      trasladosCount,
      triage,
      medicoMasProductivo,
      esCompleto: isVerifiedShiftComplete
    }
  };
};
