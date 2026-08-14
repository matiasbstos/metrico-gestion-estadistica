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

async function verifyRayenPdfParity() {
  console.log("==========================================================================");
  console.log(" AUDITORÍA DE PARIDAD: REPORTE OFICIAL RAYEN (PDF) VS VISTA MAESTRA BIGQUERY");
  console.log(" Rango: 10-08-2026 16:00  a  11-08-2026 08:00 (Turno Largo Noche)");
  console.log("==========================================================================\n");

  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  const range = getWindowRange('2026-08-10', '2026-08-11', '16:00', '08:00');

  // 1. Total y Estados
  const sqlTotal = `
    SELECT 
      COUNT(*) as total_admitidos,
      COUNTIF(flag_atencion_medica_efectiva) as completados_atendidos,
      COUNTIF(flag_alta_administrativa) as total_altas_admin
    FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= SAFE.TIMESTAMP_MILLIS(@startMs)
      AND t_admision <= SAFE.TIMESTAMP_MILLIS(@endMs)
  `;

  const [resTotal] = await bigquery.query({ query: sqlTotal, params: { startMs: range.start, endMs: range.end } });
  console.log("📌 TOTAL ADMITIDOS EN BIGQUERY SSOT:");
  console.log(`   Rayen PDF: 101 Pacientes  |  BigQuery: ${resTotal[0].total_admitidos} Pacientes  -> ${resTotal[0].total_admitidos === 101 ? '✔ PARIDAD 100% PERFECTA' : '❌ DESCALCE'}`);

  // 2. Desglose por Establecimiento de Inscripción
  const sqlEstablecimientos = `
    SELECT 
      COALESCE(establecimiento, 'SIN INFORMACIÓN / OTROS') as centro_inscripcion,
      COUNT(*) as cantidad
    FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= SAFE.TIMESTAMP_MILLIS(@startMs)
      AND t_admision <= SAFE.TIMESTAMP_MILLIS(@endMs)
    GROUP BY centro_inscripcion
    ORDER BY cantidad DESC
  `;

  try {
    const [resEst] = await bigquery.query({ query: sqlEstablecimientos, params: { startMs: range.start, endMs: range.end } });
    console.log("\n📌 CONSOLIDADO POR ESTABLECIMIENTO DE INSCRIPCIÓN (RAYEN VS BIGQUERY):");
    console.table(resEst);
  } catch(err) {
    console.log("Note on query:", err.message);
  }
}

verifyRayenPdfParity();
