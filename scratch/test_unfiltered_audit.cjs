const fetch = require('node-fetch');

// Test strict audit logic when given both narrow and wide patient datasets
const deduplicarPacientes = (pacientes) => {
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

const obtenerTurnoDetallado = (timestampMs) => {
  if (!timestampMs) return { turnoNum: 1, equipo: 'Equipo 1', tipo: 'Turno Día', horario: '08:00 a 20:00', fechaTurno: '', textoCompleto: '' };
  
  const d = new Date(timestampMs);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const totalMins = hours * 60 + minutes;
  const dayOfWeek = d.getDay();

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let turnoNum = 1;
  let tipo = 'Turno Día';
  let horario = '08:00 a 20:00 hrs';

  let logicalDate = new Date(timestampMs);

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

  const dayOfYear = Math.floor((logicalDate - new Date(logicalDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const equipoNum = ((dayOfYear + turnoNum) % 3) + 1;
  const equipo = `Equipo ${equipoNum}`;

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  const fechaTurno = `${day}/${m}/${y}`;

  const textoCompleto = `${fechaTurno} - Turno ${turnoNum} (${equipo} • ${tipo} ${horario})`;

  return { turnoNum, equipo, tipo, horario, fechaTurno, textoCompleto };
};

const auditarUltimoTurnoCompleto = (turnosDB = [], pacientesDB = []) => {
  if (!pacientesDB || pacientesDB.length === 0) {
    return { exito: false, esTurnoCompleto: false, mensaje: 'Sin datos para auditar turnos.', turnoInfo: null };
  }

  const listPacs = deduplicarPacientes(pacientesDB).filter(p => p && p.tAdmision).sort((a, b) => b.tAdmision - a.tAdmision);
  if (listPacs.length === 0) {
    return { exito: false, esTurnoCompleto: false, mensaje: 'Sin admisiones validas.', turnoInfo: null };
  }

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

  const sortedGroupKeys = Object.keys(shiftGroups).sort((a, b) => shiftGroups[b].maxTimestamp - shiftGroups[a].maxTimestamp);

  let verifiedShift = null;
  let isVerifiedShiftComplete = true;

  for (const groupKey of sortedGroupKeys) {
    const group = shiftGroups[groupKey];
    
    const timeSpanHours = (group.maxTimestamp - group.minTimestamp) / (1000 * 60 * 60);
    const maxDate = new Date(group.maxTimestamp);
    const minDate = new Date(group.minTimestamp);
    const maxHours = maxDate.getHours();

    const isNightShift = group.tipo.includes('Noche') || group.tipo.includes('Largo');
    const isDifferentDay = maxDate.getDate() !== minDate.getDate() || maxDate.getMonth() !== minDate.getMonth();
    
    let isComplete = false;
    if (isNightShift) {
      // Un turno noche completo DEBE extenderse al día siguiente Y tener admisiones después de las 05:30 AM
      isComplete = isDifferentDay && timeSpanHours >= 9 && (maxHours >= 5 && maxHours <= 10);
    } else {
      // Turno día completo (08:00 a 20:00)
      isComplete = timeSpanHours >= 9 && maxHours >= 19;
    }

    if (isComplete) {
      verifiedShift = group;
      isVerifiedShiftComplete = true;
      break;
    }
  }

  if (!verifiedShift && sortedGroupKeys.length > 0) {
    const allGroups = Object.values(shiftGroups);
    allGroups.sort((a, b) => b.maxTimestamp - a.maxTimestamp);
    verifiedShift = allGroups[0];
    isVerifiedShiftComplete = false;
  }

  if (!verifiedShift) {
    return { exito: false, esTurnoCompleto: false, mensaje: 'No se encontraron turnos cerrados validos.', turnoInfo: null };
  }

  return {
    exito: true,
    esTurnoCompleto: isVerifiedShiftComplete,
    turnoInfo: {
      fechaTurno: verifiedShift.fechaTurno,
      textoCompleto: verifiedShift.textoCompleto,
      totalAdmitidos: verifiedShift.pacientes.length,
      esCompleto: isVerifiedShiftComplete
    }
  };
};

async function test() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const query = {
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
                value: { integerValue: new Date(2026, 7, 1, 0, 0, 0).getTime() }
              }
            }
          ]
        }
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  const data = await res.json();
  const allPacs = data.map(item => {
    const fields = item.document?.fields || {};
    return {
      tAdmision: Number(fields.tAdmision?.integerValue || fields.tAdmision?.stringValue || 0),
      id: item.document?.name
    };
  }).filter(p => p.tAdmision > 0);

  console.log("=== PRUEBA 1: CON TODOS LOS PACIENTES DE AGOSTO (1 al 6 de Agosto) ===");
  const resFull = auditarUltimoTurnoCompleto([], allPacs);
  console.log("Turno Seleccionado:", resFull.turnoInfo.textoCompleto);
  console.log("¿Es Turno Completo 100%?:", resFull.esTurnoCompleto);

  console.log("\n=== PRUEBA 2: SI EL FILTRO DE UI SOLO TUVIERA EL 6 DE AGOSTO ===");
  const pacsOnlyAug6 = allPacs.filter(p => new Date(p.tAdmision).getDate() === 6);
  const resAug6 = auditarUltimoTurnoCompleto([], pacsOnlyAug6);
  console.log("Turno Seleccionado:", resAug6.turnoInfo.textoCompleto);
  console.log("¿Es Turno Completo 100%?:", resAug6.esTurnoCompleto);
}

test();
