const fetch = require('node-fetch');

const parseLocalDatetime = (dateStr, hourMinStr = '00:00') => {
  if (!dateStr) return NaN;
  const str = String(dateStr).trim();
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);

  let y, m, d;

  // Option A: YYYY-MM-DD or YYYY/MM/DD (ISO standard format from HTML5 input type="date")
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [y, m, d] = parts;
  }
  // Option B: DD-MM-YYYY or DD/MM/YYYY (Strict Chilean / Spanish standard format)
  else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [d, m, y] = parts; // Always Day first, Month second, Year third!
  } else {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
    } else {
      return NaN;
    }
  }

  const resultDate = new Date(y, m - 1, d, h || 0, min || 0, 0);
  return resultDate.getTime();
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

async function testChileanDateParser() {
  console.log("=== PROBANDO PARSER DE FECHAS ESTÁNDAR CHILENO (DD/MM/YYYY) ===");
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

  // Test Case in User's Screenshot: 03/08/2026 16:00 to 04/08/2026 20:00 (or 08:00)
  // 03/08/2026 = 3 de Agosto de 2026
  // 04/08/2026 = 4 de Agosto de 2026
  const range1 = getWindowRange('2026-08-03', '2026-08-04', '16:00', '08:00'); // 3 Aug 16:00 to 4 Aug 08:00
  console.log("\nPrueba 1: Turno Largo del 3 de Agosto (03/08 16:00 a 04/08 08:00):");
  console.log(" Start:", new Date(range1.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(range1.end).toLocaleString('es-CL'));
  const pacs1 = rawPacs.filter(p => p.tAdmision >= range1.start && p.tAdmision <= range1.end);
  console.log(` -> Pacientes exactos en el Turno Largo del 3 de Agosto: ${pacs1.length}`);

  // Test Case: 07/08/2026 16:00 to 08/08/2026 08:00 (Turno Largo del 7 de Agosto)
  const range2 = getWindowRange('07/08/2026', '08/08/2026', '16:00', '08:00');
  console.log("\nPrueba 2: Turno Largo del 7 de Agosto con formato DD/MM/YYYY ('07/08/2026' a '08/08/2026'):");
  console.log(" Start:", new Date(range2.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(range2.end).toLocaleString('es-CL'));
  const pacs2 = rawPacs.filter(p => p.tAdmision >= range2.start && p.tAdmision <= range2.end);
  console.log(` -> Pacientes exactos en el Turno Largo del 7 de Agosto: ${pacs2.length}`);

  // Test Case: 10/08/2026 16:00 to 11/08/2026 08:00 (Turno Largo del 10 de Agosto)
  const range3 = getWindowRange('10/08/2026', '11/08/2026', '16:00', '08:00');
  console.log("\nPrueba 3: Turno Largo del 10 de Agosto con formato DD/MM/YYYY ('10/08/2026' a '11/08/2026'):");
  console.log(" Start:", new Date(range3.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(range3.end).toLocaleString('es-CL'));
  const pacs3 = rawPacs.filter(p => p.tAdmision >= range3.start && p.tAdmision <= range3.end);
  console.log(` -> Pacientes exactos en el Turno Largo del 10 de Agosto: ${pacs3.length}`);

  // Test Case: 11/08/2026 00:00 to 11/08/2026 23:59 (Día completo 11 de Agosto)
  const range4 = getWindowRange('11/08/2026', '11/08/2026', '00:00', '23:59');
  console.log("\nPrueba 4: Día Civil Completo 11 de Agosto ('11/08/2026' 00:00 a 23:59):");
  console.log(" Start:", new Date(range4.start).toLocaleString('es-CL'));
  console.log(" End  :", new Date(range4.end).toLocaleString('es-CL'));
  const pacs4 = rawPacs.filter(p => p.tAdmision >= range4.start && p.tAdmision <= range4.end);
  console.log(` -> Pacientes exactos el 11 de Agosto: ${pacs4.length}`);
}

testChileanDateParser();
