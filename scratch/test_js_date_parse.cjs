const parseLocalDatetime = (dateStr, hourMinStr = '00:00') => {
  if (!dateStr) return NaN;
  const str = String(dateStr).trim();
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);

  let y, m, d;

  // Format YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [y, m, d] = parts;
  }
  // Format MM/DD/YYYY (US standard from browser date picker) or DD/MM/YYYY
  else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    // If parts[0] > 12, it must be DD/MM/YYYY
    if (parts[0] > 12) {
      [d, m, y] = parts;
    } else {
      // Month first (MM/DD/YYYY), matching browser native format
      [m, d, y] = parts;
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

console.log("=== PROBANDO PARSE LOCAL DATETIME REPARADO ===");
console.log("2026-08-11 ->", new Date(parseLocalDatetime('2026-08-11', '00:00')).toLocaleString('es-CL'));
console.log("08/11/2026 ->", new Date(parseLocalDatetime('08/11/2026', '00:00')).toLocaleString('es-CL'));
console.log("11/08/2026 (day > 12, 15/08/2026) ->", new Date(parseLocalDatetime('15/08/2026', '00:00')).toLocaleString('es-CL'));
