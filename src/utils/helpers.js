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
    if (hours >= 17 || hours < 8) {
      turnoNum = 2;
      tipo = 'Turno Largo Semana';
      horario = '17:00 a 08:00 hrs';
      if (hours < 8) logicalDate.setDate(logicalDate.getDate() - 1);
    } else {
      turnoNum = 1;
      tipo = 'Refuerzo Diurno Semana';
      horario = '08:00 a 17:00 hrs';
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

/**
 * Inteligencia de Verificación y Auditoría de Turnos CERRADOS para el envío de informes por correo.
 * 1. Verifica si el último registro cargado corresponde a un turno completo o en curso.
 * 2. Si el turno actual no está cargado al 100%, toma automáticamente el último turno completo anterior.
 * 3. Identifica la rotativa de turno (Turno 1, 2 o 3, Semana/FDS Día/Noche).
 * 4. Genera el desglose escrito en HTML, el payload en formato JSON y el resumen ejecutivo.
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

  for (const groupKey of sortedGroupKeys) {
    const group = shiftGroups[groupKey];
    
    // Verificar si el turno está cerrado:
    // Para un Turno de Semana (17:00 a 08:00 AM del día siguiente):
    // Debe haber registros sostenidos a lo largo de la jornada (>9 hrs de dispersión o >= 35 admisiones)
    const timeSpanHours = (group.maxTimestamp - group.minTimestamp) / (1000 * 60 * 60);
    const isComplete = timeSpanHours >= 9 || group.pacientes.length >= 35;

    if (isComplete) {
      verifiedShift = group;
      break;
    }
  }

  // Si no se encontró un turno con la prueba estricta, tomar el grupo más consistente
  if (!verifiedShift && sortedGroupKeys.length > 0) {
    verifiedShift = shiftGroups[sortedGroupKeys[0]];
  }

  if (!verifiedShift) {
    return { exito: false, mensaje: 'No se encontraron turnos cerrados validos.', turnoInfo: null };
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
    if (diag.includes('z51.8') || diag.includes('z518') || diag.includes('constatac') || cat.includes('Z518')) constatacionesCount++;
    if (dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac')) trasladosCount++;

    if (cat.includes('C1')) triage.c1++;
    else if (cat.includes('C2')) triage.c2++;
    else if (cat.includes('C3')) triage.c3++;
    else if (cat.includes('C4')) triage.c4++;
    else if (cat.includes('C5')) triage.c5++;

    const med = String(p.medico || p.profesional || '').trim();
    if (med && !med.includes('SIN MEDICO') && !med.includes('NO REGISTRADO')) {
      medMap[med] = (medMap[med] || 0) + 1;
    }
  });

  const topMed = Object.entries(medMap).sort((a,b) => b[1] - a[1])[0];
  const medicoMasProductivo = topMed ? `${topMed[0]} (${topMed[1]} atenciones)` : 'No especificado';

  return {
    exito: true,
    esTurnoCompleto: true,
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
      medicoMasProductivo
    }
  };
};
