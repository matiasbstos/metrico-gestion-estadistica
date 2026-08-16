const fetch = require('node-fetch');

const obtenerTurnoDetallado = (timestamp) => {
  if (!timestamp) return { fechaTurno: 'Desconocido', turnoNum: 1, equipo: 'Equipo 1', rotativa: 'No Especificada', textoCompleto: 'Sin Fecha' };
  
  const d = new Date(timestamp);
  let logicalDate = new Date(timestamp);
  
  const hours = d.getHours();
  const mins = d.getMinutes();
  const totalMins = hours * 60 + mins;
  
  const dayOfWeek = d.getDay();
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  
  let turnoNum = 1;
  let equipo = 'Equipo 1';
  let tipo = 'SEMANA_LARGO';
  let horario = '17:00 - 08:00 (Semana Largo)';

  if (isWeekend) {
    if (totalMins >= 480 && totalMins < 1200) {
      turnoNum = 1;
      equipo = 'Equipo 2';
      tipo = 'FINDE_DIA';
      horario = '08:00 - 20:00 (Fin de semana Día)';
    } else {
      turnoNum = 2;
      equipo = 'Equipo 3';
      tipo = 'FINDE_NOCHE';
      horario = '20:00 - 08:00 (Fin de semana Noche)';
      if (totalMins < 480) logicalDate.setDate(logicalDate.getDate() - 1);
    }
  } else {
    turnoNum = 2;
    equipo = 'Equipo 1';
    tipo = 'SEMANA_LARGO';
    horario = '17:00 - 08:00 (Semana Largo)';
    if (totalMins < 540) logicalDate.setDate(logicalDate.getDate() - 1);
  }

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  const fechaTurno = `${day}/${m}/${y}`;

  return {
    fechaTurno,
    turnoNum,
    equipo,
    tipo,
    horario,
    textoCompleto: `${fechaTurno} - Turno ${turnoNum} (${equipo} • ${horario})`
  };
};

const deduplicarPacientes = (pacientes) => {
  if (!pacientes || !Array.isArray(pacientes) || pacientes.length === 0) return [];
  const map = new Map();
  const sorted = [...pacientes].sort((a, b) => (b.tAdmision || 0) - (a.tAdmision || 0));

  sorted.forEach(p => {
    if (!p) return;
    const correlativo = String(p.correlativo || p.correlativo_raw || p.id || '').replace(/\.0$/, '').trim();
    const tMs = p.tAdmision || p.timestamp || 0;
    
    let key;
    if (correlativo && tMs > 0) {
      const det = obtenerTurnoDetallado(tMs);
      key = `${correlativo}_${det.fechaTurno}_T${det.turnoNum}`;
    } else {
      key = p.id || p.docId || `${tMs}_${Math.random()}`;
    }

    if (!map.has(key)) map.set(key, p);
  });

  return Array.from(map.values());
};

async function testDeduplication() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const startMs = new Date(2026, 7, 12, 0, 0, 0).getTime();
  const endMs = new Date(2026, 7, 13, 23, 59, 59).getTime();

  const resPacs = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'pacientes_urgencia' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'tAdmision' }, op: 'GREATER_THAN_OR_EQUAL', value: { integerValue: startMs } } },
              { fieldFilter: { field: { fieldPath: 'tAdmision' }, op: 'LESS_THAN_OR_EQUAL', value: { integerValue: endMs } } }
            ]
          }
        }
      }
    })
  });

  const rawPacs = await resPacs.json();
  const pacientes = rawPacs.map(item => {
    const f = item.document?.fields || {};
    return {
      id: item.document?.name.split('/').pop(),
      tAdmision: Number(f.tAdmision?.integerValue || f.tAdmision?.stringValue || 0),
      correlativo: f.correlativo?.integerValue || f.correlativo?.stringValue || f.correlativo_raw?.stringValue || '',
      rut: f.rutPaciente?.stringValue || f.rut?.stringValue || '',
      nombre: f.nombrePaciente?.stringValue || f.nombre?.stringValue || '',
      estado: f.estado?.stringValue || '',
      categoria: f.categoria?.stringValue || ''
    };
  });

  const sStart = new Date("2026-08-12T16:00:00-04:00").getTime();
  const sEnd = new Date("2026-08-13T09:00:00-04:00").getTime();

  const rawShift = pacientes.filter(p => p.tAdmision >= sStart && p.tAdmision <= sEnd);
  const dedupShift = deduplicarPacientes(rawShift);

  console.log(`Raw shift count: ${rawShift.length}`);
  console.log(`Deduplicated shift count: ${dedupShift.length}`);
  console.log(`Altas in deduplicated shift: ${dedupShift.filter(p => p.estado === 'Cancelada').length}`);
}

testDeduplication();
