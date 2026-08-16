const parseLocalDatetime = (dateStr, hourMinStr = '00:00') => {
  if (!dateStr) return NaN;
  const str = String(dateStr).trim();
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);

  let y, m, d;

  // Formato ISO: YYYY-MM-DD o YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [y, m, d] = parts;
  }
  // Formato con 4 dígitos al final: DD-MM-YYYY / MM-DD-YYYY
  else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    const p1 = parts[0];
    const p2 = parts[1];
    y = parts[2];

    if (p1 <= 12 && p2 > 12) {
      m = p1;
      d = p2;
    } else {
      d = p1;
      m = p2;
    }
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

const range1 = getWindowRange('2026-08-12', '2026-08-13', '16:00', '09:00');
console.log("Range for 2026-08-12 16:00 -> 2026-08-13 09:00:");
console.log("Start:", new Date(range1.start).toISOString(), "End:", new Date(range1.end).toISOString());

const range2 = getWindowRange('08/12/2026', '08/13/2026', '16:00', '09:00');
console.log("Range for 08/12/2026 16:00 -> 08/13/2026 09:00:");
console.log("Start:", new Date(range2.start).toISOString(), "End:", new Date(range2.end).toISOString());
