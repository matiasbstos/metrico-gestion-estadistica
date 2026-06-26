export const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;

export const formatTime = (minutes) => {
  if (isNaN(minutes) || minutes < 0 || minutes === null) return '-';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60); const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
};

export const truncateStr = (str, n) => {
  if (!str) return '';
  const safeStr = String(str);
  return safeStr.length > n ? safeStr.substr(0, n - 1) + '...' : safeStr;
};
