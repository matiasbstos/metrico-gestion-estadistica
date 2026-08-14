const parseDateStr = (dateStr, defaultHour = 0, defaultMin = 0, defaultSec = 0) => {
  if (!dateStr) return new Date();
  const str = String(dateStr).trim();
  let y, m, d;

  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [y, m, d] = parts;
  } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [d, m, y] = parts;
  } else {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
    } else {
      const now = new Date();
      y = now.getFullYear();
      m = now.getMonth() + 1;
      d = now.getDate();
    }
  }

  if (y < 100) y += 2000;
  if (y > 9999) y = 2026;

  return new Date(y, m - 1, d, defaultHour, defaultMin, defaultSec);
};

const getRanges = (startStr, endStr) => {
  const currentStart = parseDateStr(startStr, 0, 0, 0);
  const currentEnd = parseDateStr(endStr, 23, 59, 59);

  const sy = currentStart.getFullYear();
  const sm = currentStart.getMonth() + 1;
  const sd = currentStart.getDate();

  const ey = currentEnd.getFullYear();
  const em = currentEnd.getMonth() + 1;
  const ed = currentEnd.getDate();

  const pmStart = new Date(sy, sm - 2, sd, 0, 0, 0);
  const pmEnd = new Date(ey, em - 2, ed, 23, 59, 59);

  const pyStart = new Date(sy - 1, sm - 1, sd, 0, 0, 0);
  const pyEnd = new Date(ey - 1, em - 1, ed, 23, 59, 59);

  const ytdStart = new Date(ey, 0, 1, 0, 0, 0);

  return {
    current: { start: currentStart.toISOString(), end: currentEnd.toISOString() },
    prevMonth: { start: pmStart.toISOString(), end: pmEnd.toISOString() },
    prevYear: { start: pyStart.toISOString(), end: pyEnd.toISOString() },
    ytd: { start: ytdStart.toISOString(), end: currentEnd.toISOString() }
  };
};

console.log("=== PROBANDO CORRECCIÓN CLOUD FUNCTION GETRANGES ===");
console.log("Prueba 1 ('2022-08-09' a '2026-08-09'):");
console.log(getRanges('2022-08-09', '2026-08-09'));

console.log("\nPrueba 2 ('09/08/2022' a '09/08/2026'):");
console.log(getRanges('09/08/2022', '09/08/2026'));
