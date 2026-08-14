const parseLocalDatetime = (dateStr, hourMinStr) => {
  if (!dateStr) return NaN;
  let y, m, d;
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number);
    if (parts[0] > 1000) { [y, m, d] = parts; }
    else { [d, m, y] = parts; }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(Number);
    if (parts[2] > 1000) { [d, m, y] = parts; }
    else { [y, m, d] = parts; }
  }
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, h || 0, min || 0, 0).getTime();
};

const getWindowRange = (startDayStr, endDayStr, startHourStr = '00:00', endHourStr = '23:59') => {
  if (!startDayStr || !endDayStr) return null;
  const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
  let tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
  if (isNaN(tStart) || isNaN(tEnd)) return null;

  if (startHourStr && endHourStr && startHourStr > endHourStr) {
    // If end hour is smaller than start hour (e.g. 16:00 to 08:00), end time must be next morning of endDayStr
    const endPlusOne = new Date(tEnd);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    tEnd = endPlusOne.getTime();
  }

  return { start: tStart, end: tEnd };
};

console.log("Testing getWindowRange('2026-08-10', '2026-08-11', '16:00', '08:00'):");
const range = getWindowRange('2026-08-10', '2026-08-11', '16:00', '08:00');
console.log("Range Start:", new Date(range.start).toLocaleString('es-CL'));
console.log("Range End:", new Date(range.end).toLocaleString('es-CL'));
