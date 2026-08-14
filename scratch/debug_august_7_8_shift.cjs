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

async function debugAugust78Shift() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Aug 7 00:00 to Aug 8 23:59 UTC
  const startMs = new Date('2026-08-06T20:00:00.000Z').getTime();

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
  const rawPacs = data.map(item => {
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

  // Test getWindowRange with '2026-08-07' and '2026-08-08', '16:00', '08:00'
  const range = getWindowRange('2026-08-07', '2026-08-08', '16:00', '08:00');
  console.log("Range Start:", new Date(range.start).toLocaleString('es-CL'));
  console.log("Range End:  ", new Date(range.end).toLocaleString('es-CL'));

  const pacsInExactRange = rawPacs.filter(p => p.tAdmision >= range.start && p.tAdmision <= range.end);
  console.log(`Pacientes exactos entre ${new Date(range.start).toLocaleString('es-CL')} y ${new Date(range.end).toLocaleString('es-CL')}: ${pacsInExactRange.length}`);

  // Print hourly breakdown for Aug 7 and Aug 8
  const hourCounts = {};
  rawPacs.forEach(p => {
    const d = new Date(p.tAdmision);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const hourStr = String(d.getHours()).padStart(2,'0');
    const key = `${dayStr} ${hourStr}:00`;
    hourCounts[key] = (hourCounts[key] || 0) + 1;
  });

  console.log("\nDesglose por horas en Agosto 7 y 8:");
  Object.keys(hourCounts).sort().forEach(k => {
    if (k.includes('2026-08-07') || k.includes('2026-08-08')) {
      console.log(`  ${k} -> ${hourCounts[k]} admisiones`);
    }
  });
}

debugAugust78Shift();
