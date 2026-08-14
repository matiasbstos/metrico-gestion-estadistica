const getRanges = (startStr, endStr) => {
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);

  const currentStart = new Date(sy, sm - 1, sd, 0, 0, 0);
  const currentEnd = new Date(ey, em - 1, ed, 23, 59, 59);

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

console.log("Testing getRanges('2022-08-09', '2026-08-09'):");
console.log(getRanges('2022-08-09', '2026-08-09'));

console.log("\nTesting what happens if startStr is formatted as '08/09/2022' or '09/08/2022':");
try {
  console.log(getRanges('08/09/2022', '08/09/2026'));
} catch(e) {
  console.error("Error:", e.message);
}
