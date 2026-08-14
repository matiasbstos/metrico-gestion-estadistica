const fetch = require('node-fetch');

const parseLocalDatetime = (dateStr, hourMinStr = '00:00') => {
  if (!dateStr) return NaN;
  const str = String(dateStr).trim();
  
  let y, m, d;

  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [y, m, d] = parts;
  } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    if (parts[0] > 12) {
      [d, m, y] = parts;
    } else if (parts[1] > 12) {
      [m, d, y] = parts;
    } else {
      [d, m, y] = parts;
    }
  } else {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      y = parsed.getFullYear();
      m = parsed.getMonth() + 1;
      d = parsed.getDate();
    } else {
      return NaN;
    }
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

async function debugAugust11SingleDay() {
  console.log("=== DESGLOSE DE PACIENTES PARA EL 11 DE AGOSTO (00:00 A 23:59) ===");
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

  // Test date string format YYYY-MM-DD: '2026-08-11'
  const rangeISO = getWindowRange('2026-08-11', '2026-08-11', '00:00', '23:59');
  console.log("\nRange ISO (2026-08-11):");
  console.log(" Start:", new Date(rangeISO.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(rangeISO.end).toLocaleString('es-CL'));

  const pacsISO = pacientesDB.filter(p => p.tAdmision >= rangeISO.start && p.tAdmision <= rangeISO.end);
  console.log(` -> Pacientes exactos el 11/08/2026: ${pacsISO.length}`);

  // Test date string format 08/11/2026 (Month 08 / Day 11 / Year 2026) in US locale:
  const rangeUS = getWindowRange('08/11/2026', '08/11/2026', '00:00', '23:59');
  console.log("\nRange US (08/11/2026):");
  console.log(" Start:", new Date(rangeUS.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(rangeUS.end).toLocaleString('es-CL'));

  const pacsUS = pacientesDB.filter(p => p.tAdmision >= rangeUS.start && p.tAdmision <= rangeUS.end);
  console.log(` -> Pacientes exactos con 08/11/2026: ${pacsUS.length}`);

  // Test date string format 11/08/2026 (Day 11 / Month 08 / Year 2026) in Chilean locale:
  const rangeCL = getWindowRange('11/08/2026', '11/08/2026', '00:00', '23:59');
  console.log("\nRange CL (11/08/2026):");
  console.log(" Start:", new Date(rangeCL.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(rangeCL.end).toLocaleString('es-CL'));

  const pacsCL = pacientesDB.filter(p => p.tAdmision >= rangeCL.start && p.tAdmision <= rangeCL.end);
  console.log(` -> Pacientes exactos con 11/08/2026: ${pacsCL.length}`);
}

debugAugust11SingleDay();
