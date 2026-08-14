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

console.log("=== PROBANDO PARSER BULLETPROOF ===");
const t1 = getWindowRange('2026-08-07', '2026-08-08', '16:00', '08:00');
console.log("Case 1 (2026-08-07 16:00 to 2026-08-08 08:00):");
console.log(" Start:", new Date(t1.start).toLocaleString('es-CL'));
console.log(" End  :", new Date(t1.end).toLocaleString('es-CL'));

const t2 = getWindowRange('07/08/2026', '08/08/2026', '16:00', '08:00');
console.log("\nCase 2 (07/08/2026 16:00 to 08/08/2026 08:00):");
console.log(" Start:", new Date(t2.start).toLocaleString('es-CL'));
console.log(" End  :", new Date(t2.end).toLocaleString('es-CL'));
