const fetch = require('node-fetch');

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

async function verifyTableauPushdownParity() {
  console.log("=== PRUEBA DE PARIDAD SQL PUSHDOWN CON VISTA MAESTRA BIGQUERY ===");
  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  const testCases = [
    { name: "Turno Largo 03/08 (16:00 a 04/08 08:00)", startDay: "2026-08-03", endDay: "2026-08-04", startH: "16:00", endH: "08:00" },
    { name: "Turno Largo 07/08 (16:00 a 08/08 08:00)", startDay: "2026-08-07", endDay: "2026-08-08", startH: "16:00", endH: "08:00" },
    { name: "Turno Largo 10/08 (16:00 a 11/08 08:00)", startDay: "2026-08-10", endDay: "2026-08-11", startH: "16:00", endH: "08:00" },
    { name: "Día Civil Completo 11/08 (00:00 a 23:59)", startDay: "2026-08-11", endDay: "2026-08-11", startH: "00:00", endH: "23:59" },
  ];

  for (const tc of testCases) {
    const range = getWindowRange(tc.startDay, tc.endDay, tc.startH, tc.endH);
    const sql = `
      SELECT 
        COUNT(*) as total_admitidos,
        COUNTIF(t_alta IS NOT NULL OR estado = 'Finalizada') as total_atendidos,
        COUNTIF(flag_alta_administrativa) as total_altas_admin,
        COUNTIF(flag_traslado_hospitalario) as total_traslados,
        COUNTIF(flag_fractura) as total_fracturas,
        COUNTIF(flag_constatacion_lesion) as total_constataciones
      FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
      WHERE t_admision >= SAFE.TIMESTAMP_MILLIS(@startMs)
        AND t_admision <= SAFE.TIMESTAMP_MILLIS(@endMs)
    `;

    const [rows] = await bigquery.query({ query: sql, params: { startMs: range.start, endMs: range.end } });
    const res = rows[0];
    console.log(`\n📌 ${tc.name}:`);
    console.log(`   Admitidos: ${res.total_admitidos} | Atendidos: ${res.total_atendidos} | Altas Admin: ${res.total_altas_admin} | Traslados: ${res.total_traslados} | Fracturas: ${res.total_fracturas} | Constataciones: ${res.total_constataciones}`);
  }
}

verifyTableauPushdownParity();
