const parseLocalDatetime = (dateStr, hourMinStr = '00:00') => {
  if (!dateStr) return NaN;
  const str = String(dateStr).trim();
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);
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
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    } else return NaN;
  }
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

async function verifyTimeFilterExact() {
  console.log("=== VERIFICACIÓN EXACTA DEL FILTRO DE TIEMPO ===");
  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  // Caso 1: Rango seleccionado en la foto: 10/08/2026 16:00 a 11/08/2026 20:00
  const range1 = getWindowRange('2026-08-10', '2026-08-11', '16:00', '20:00');

  // Caso 2: Turno Largo Noche 10/08: 10/08 16:00 a 11/08 08:00
  const range2 = getWindowRange('2026-08-10', '2026-08-11', '16:00', '08:00');

  // Caso 3: Turno Día 11/08: 11/08 08:00 a 11/08 20:00
  const range3 = getWindowRange('2026-08-11', '2026-08-11', '08:00', '20:00');

  const testRanges = [
    { name: "Rango Foto (10/08 16:00 a 11/08 20:00 - 28 Horas continuas)", range: range1 },
    { name: "Turno Largo Noche (10/08 16:00 a 11/08 08:00 - 16 Horas)", range: range2 },
    { name: "Turno Día 11/08 (11/08 08:00 a 11/08 20:00 - 12 Horas)", range: range3 }
  ];

  for (const tr of testRanges) {
    const sql = `
      SELECT 
        COUNT(*) as total_admitidos,
        COUNTIF(t_alta IS NOT NULL OR estado_atencion = 'FINALIZADA') as total_atendidos,
        COUNTIF(flag_alta_administrativa) as total_altas_admin,
        COUNTIF(flag_traslado_hospitalario) as total_traslados,
        COUNTIF(flag_fractura) as total_fracturas,
        COUNTIF(flag_constatacion_z518) as total_constataciones,
        ROUND(COALESCE(AVG(estadia_total_min), 0)) as prom_estadia_min
      FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
      WHERE t_admision >= SAFE.TIMESTAMP_MILLIS(@startMs)
        AND t_admision <= SAFE.TIMESTAMP_MILLIS(@endMs)
    `;

    const [rows] = await bigquery.query({ query: sql, params: { startMs: tr.range.start, endMs: tr.range.end } });
    const r = rows[0];
    console.log(`\n📌 ${tr.name}:`);
    console.log(`   Admitidos: ${r.total_admitidos}`);
    console.log(`   Atendidos: ${r.total_atendidos}`);
    console.log(`   Altas Admin: ${r.total_altas_admin}`);
    console.log(`   Traslados: ${r.total_traslados}`);
    console.log(`   Constataciones: ${r.total_constataciones}`);
    console.log(`   Promedio Estadía: ${r.prom_estadia_min} min`);
  }
}

verifyTimeFilterExact();
