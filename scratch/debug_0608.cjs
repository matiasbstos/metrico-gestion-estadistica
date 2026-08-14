const fetch = require('node-fetch');

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

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  const fechaTurno = `${day}/${m}/${y}`;

  return { turnoNum, tipo, horario, fechaTurno };
};

async function debug0608() {
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
                value: { integerValue: new Date(2026, 7, 5, 0, 0, 0).getTime() }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'tAdmision' },
                op: 'LESS_THAN_OR_EQUAL',
                value: { integerValue: new Date(2026, 7, 7, 23, 59, 59).getTime() }
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
  const rawPacs = data.map(item => {
    const fields = item.document?.fields || {};
    return {
      tAdmision: Number(fields.tAdmision?.integerValue || fields.tAdmision?.stringValue || 0),
      diagnosticoPrincipal: fields.diagnosticoPrincipal?.stringValue || fields.codigoDiagnostico?.stringValue || '',
      destinoAlta: fields.destinoAlta?.stringValue || fields.destino?.stringValue || '',
      estado: fields.estado?.stringValue || '',
      categoria: fields.categoria?.stringValue || fields.triage?.stringValue || '',
      medico: fields.medico?.stringValue || fields.profesional?.stringValue || ''
    };
  }).filter(p => p.tAdmision > 0);

  console.log(`Total pacientes leídos entre Aug 5 y Aug 7: ${rawPacs.length}`);

  // Group by logical shift
  const shiftGroups = {};
  rawPacs.forEach(p => {
    const det = obtenerTurnoDetallado(p.tAdmision);
    const key = `${det.fechaTurno}_T${det.turnoNum}`;
    if (!shiftGroups[key]) {
      shiftGroups[key] = {
        key,
        fechaTurno: det.fechaTurno,
        turnoNum: det.turnoNum,
        tipo: det.tipo,
        pacientes: [],
        minT: Infinity,
        maxT: 0
      };
    }
    shiftGroups[key].pacientes.push(p);
    if (p.tAdmision < shiftGroups[key].minT) shiftGroups[key].minT = p.tAdmision;
    if (p.tAdmision > shiftGroups[key].maxT) shiftGroups[key].maxT = p.tAdmision;
  });

  Object.keys(shiftGroups).sort().forEach(k => {
    const g = shiftGroups[k];
    const minD = new Date(g.minT);
    const maxD = new Date(g.maxT);
    const diffHours = (g.maxT - g.minT) / (1000 * 60 * 60);
    console.log(`\n--- SHIFT KEY: ${k} (${g.tipo}) ---`);
    console.log(`Total Pacientes: ${g.pacientes.length}`);
    console.log(`Primer registro: ${minD.toLocaleString('es-CL')} (Hora: ${minD.getHours()})`);
    console.log(`Último registro: ${maxD.toLocaleString('es-CL')} (Hora: ${maxD.getHours()})`);
    console.log(`Dispersión horaria (timeSpanHours): ${diffHours.toFixed(2)} hrs`);

    const isNightShift = g.tipo.includes('Noche') || g.tipo.includes('Largo');
    const maxHours = maxD.getHours();
    let isComplete = false;
    if (isNightShift) {
      isComplete = diffHours >= 11 && (maxHours >= 6 && maxHours <= 10);
    } else {
      isComplete = diffHours >= 10 && maxHours >= 19;
    }
    console.log(`¿Pasa prueba estricta de completitud (isComplete)? => ${isComplete ? 'SÍ (COMPLETO)' : 'NO (INCOMPLETO)'}`);
  });
}

debug0608();
