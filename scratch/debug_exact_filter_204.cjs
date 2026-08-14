const fetch = require('node-fetch');

const parseLocalDatetime = (dateStr, hourMinStr) => {
  if (!dateStr) return NaN;
  let y, m, d;
  const str = String(dateStr).trim();
  if (str.includes('-')) {
    const parts = str.split('-').map(Number);
    if (parts[0] > 1000) { [y, m, d] = parts; }
    else { [d, m, y] = parts; }
  } else if (str.includes('/')) {
    const parts = str.split('/').map(Number);
    if (parts[2] > 1000) { [d, m, y] = parts; }
    else if (parts[0] > 1000) { [y, m, d] = parts; }
    else { [m, d, y] = parts; }
  } else {
    return NaN;
  }
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, h || 0, min || 0, 0).getTime();
};

const getWindowRange = (startDayStr, endDayStr, startHourStr = '00:00', endHourStr = '23:59') => {
  if (!startDayStr || !endDayStr) return null;
  const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
  let tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
  if (isNaN(tStart) || isNaN(tEnd)) return null;

  if (startHourStr && endHourStr && startHourStr > endHourStr && startDayStr === endDayStr) {
    const endPlusOne = new Date(tEnd);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    tEnd = endPlusOne.getTime();
  }

  return { start: tStart, end: tEnd };
};

async function debugExactFilter204() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const startMs = new Date('2026-08-01T00:00:00.000Z').getTime();

  const query = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia', allDescendants: false }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'tAdmision' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { integerValue: startMs }
        }
      }
    }
  };

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
  const data = await res.json();
  const pacientesDB = data.map(item => {
    const fields = item.document?.fields || {};
    const obj = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v.stringValue !== undefined) obj[k] = v.stringValue;
      else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
      else if (v.doubleValue !== undefined) obj[k] = Number(v.doubleValue);
      else if (v.timestampValue !== undefined) obj[k] = new Date(v.timestampValue).getTime();
    }
    return obj;
  }).filter(p => p.tAdmision);

  console.log(`Total pacientesDB cargados de Agosto: ${pacientesDB.length}`);

  // Test Case A: startDay = '2026-08-10', endDay = '2026-08-11', startHour = '16:00', endHour = '08:00'
  const rangeA = getWindowRange('2026-08-10', '2026-08-11', '16:00', '08:00');
  console.log("\nRange A (2026-08-10 to 2026-08-11, 16:00 to 08:00):");
  console.log(" Start:", new Date(rangeA.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(rangeA.end).toLocaleString('es-CL'));

  const pacsA = pacientesDB.filter(p => p.tAdmision >= rangeA.start && p.tAdmision <= rangeA.end);
  console.log(` -> Count Pacientes A: ${pacsA.length}`);

  // Test Case B: What if startDay = '2026-08-10', endDay = '2026-08-11' and we treat overnight shift with startHour > endHour specially when endDay === startDay + 1?
  // If endDay is startDay + 1 (10/08 to 11/08) AND startHour (16:00) > endHour (08:00), the user selected 10/08 16:00 to 11/08 08:00 to mean ONE single overnight shift!
  // BUT if getWindowRange doesn't adjust, start is 2026-08-10 16:00 and end is 2026-08-11 08:00.
  // Wait! Why did pacsA.length equal 204 or 101?
  console.log(` -> Exact count between 2026-08-10 16:00 and 2026-08-11 08:00: ${pacsA.length}`);

  // Print all admision dates in pacsA
  console.log("\nAdmisiones en pacsA:");
  pacsA.forEach(p => {
    console.log(` - Correlativo: ${p.correlativo}, Fecha Adm: ${new Date(p.tAdmision).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`);
  });
}

debugExactFilter204();
