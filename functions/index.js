const functions = require('firebase-functions');
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

exports.obtenerKpisDashboard = functions.https.onCall(async (dataReq, context) => {
  // Soporte para firmas de Firebase onCall v1 y v2
  const data = dataReq.data || dataReq || {};
  const { fechaInicio, fechaFin } = data;

  if (!fechaInicio || !fechaFin) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan los parámetros fechaInicio o fechaFin.');
  }

  // Parse YYYY-MM-DD a Dates
  const getRanges = (startStr, endStr) => {
    const [sy, sm, sd] = startStr.split('-').map(Number);
    const [ey, em, ed] = endStr.split('-').map(Number);

    const currentStart = new Date(sy, sm - 1, sd, 0, 0, 0);
    const currentEnd = new Date(ey, em - 1, ed, 23, 59, 59);

    const pmStart = new Date(sy, sm - 2, sd, 0, 0, 0);
    const pmEnd = new Date(ey, em - 2, ed, 23, 59, 59);

    const pyStart = new Date(sy - 1, sm - 1, sd, 0, 0, 0);
    const pyEnd = new Date(ey - 1, em - 1, ed, 23, 59, 59);

    // YTD parte desde el 1 de enero del año de fin seleccionado
    const ytdStart = new Date(ey, 0, 1, 0, 0, 0);

    return {
      current: { start: currentStart.toISOString(), end: currentEnd.toISOString() },
      prevMonth: { start: pmStart.toISOString(), end: pmEnd.toISOString() },
      prevYear: { start: pyStart.toISOString(), end: pyEnd.toISOString() },
      ytd: { start: ytdStart.toISOString(), end: currentEnd.toISOString() }
    };
  };

  const ranges = getRanges(fechaInicio, fechaFin);

  const runPeriodQuery = async (startIso, endIso) => {
    const sqlQuery = `
      SELECT 
        COUNT(document_id) as totalAtenciones,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.categoria')) = 'c1' THEN 1 ELSE 0 END) as totalC1,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.categoria')) = 'c2' THEN 1 ELSE 0 END) as totalC2,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.categoria')) = 'c3' THEN 1 ELSE 0 END) as totalC3,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.categoria')) = 'c3_z518' THEN 1 ELSE 0 END) as totalC3Z518,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.categoria')) = 'c4' THEN 1 ELSE 0 END) as totalC4,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.categoria')) = 'c5' THEN 1 ELSE 0 END) as totalC5,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.estado')) = 'cancelada' THEN 1 ELSE 0 END) as totalAltas,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.destinoAlta')) LIKE '%hospital%' 
                      OR LOWER(JSON_EXTRACT_SCALAR(data, '$.destinoAlta')) LIKE '%emergencia%' 
                      OR LOWER(JSON_EXTRACT_SCALAR(data, '$.destinoAlta')) LIKE '%derivac%' 
                      OR LOWER(JSON_EXTRACT_SCALAR(data, '$.destino')) LIKE '%hospital%' 
                      OR LOWER(JSON_EXTRACT_SCALAR(data, '$.destino')) LIKE '%emergencia%' 
                      OR LOWER(JSON_EXTRACT_SCALAR(data, '$.destino')) LIKE '%derivac%' THEN 1 ELSE 0 END) as totalTraslados,
        SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.categoria')) = 'c3_z518' 
                      OR UPPER(JSON_EXTRACT_SCALAR(data, '$.codigoDiagnostico')) LIKE '%Z51.8%' 
                      OR UPPER(JSON_EXTRACT_SCALAR(data, '$.codigoDiagnostico')) LIKE '%Z518%' 
                      OR UPPER(JSON_EXTRACT_SCALAR(data, '$.diagnostico')) LIKE '%Z51.8%' 
                      OR UPPER(JSON_EXTRACT_SCALAR(data, '$.diagnostico')) LIKE '%Z518%' 
                      OR UPPER(JSON_EXTRACT_SCALAR(data, '$.diagnosticoPrincipal')) LIKE '%CONSTATAC%' 
                      OR UPPER(JSON_EXTRACT_SCALAR(data, '$.diagnostico')) LIKE '%CONSTATAC%' THEN 1 ELSE 0 END) as totalConstataciones,
        AVG(CASE WHEN JSON_EXTRACT_SCALAR(data, '$.tAdmision') IS NOT NULL AND JSON_EXTRACT_SCALAR(data, '$.tAlta') IS NOT NULL 
                 THEN (CAST(JSON_EXTRACT_SCALAR(data, '$.tAlta') AS INT64) - CAST(JSON_EXTRACT_SCALAR(data, '$.tAdmision') AS INT64)) / 60000.0 
                 ELSE NULL END) as avgEstadia
      FROM \`metrico-dashboard-2026.metrico_analytics.pacientes_urgencia_raw_latest\`
      WHERE TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data, '$.tAdmision') AS INT64)) BETWEEN TIMESTAMP(@inicio) AND TIMESTAMP(@fin)
    `;

    const options = {
      query: sqlQuery,
      params: { inicio: startIso, fin: endIso }
    };

    const [rows] = await bigquery.query(options);
    return rows[0];
  };

  const runRecordsQuery = async (startIso, endIso) => {
    const sqlQuery = `
      WITH daily_counts AS (
        SELECT 
          EXTRACT(DATE FROM TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data, '$.tAdmision') AS INT64)) AT TIME ZONE 'America/Santiago') as date_val,
          COUNT(document_id) as total_pacs,
          SUM(CASE WHEN LOWER(JSON_EXTRACT_SCALAR(data, '$.estado')) = 'cancelada' THEN 1 ELSE 0 END) as total_altas
        FROM \`metrico-dashboard-2026.metrico_analytics.pacientes_urgencia_raw_latest\`
        WHERE TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data, '$.tAdmision') AS INT64)) BETWEEN TIMESTAMP(@inicio) AND TIMESTAMP(@fin)
        GROUP BY date_val
      ),
      wknd_pacs AS (
        SELECT date_val, total_pacs FROM daily_counts WHERE EXTRACT(DAYOFWEEK FROM date_val) IN (1, 7) ORDER BY total_pacs DESC, date_val DESC LIMIT 1
      ),
      wkdy_pacs AS (
        SELECT date_val, total_pacs FROM daily_counts WHERE EXTRACT(DAYOFWEEK FROM date_val) NOT IN (1, 7) ORDER BY total_pacs DESC, date_val DESC LIMIT 1
      ),
      wknd_altas AS (
        SELECT date_val, total_altas FROM daily_counts WHERE EXTRACT(DAYOFWEEK FROM date_val) IN (1, 7) ORDER BY total_altas DESC, date_val DESC LIMIT 1
      ),
      wkdy_altas AS (
        SELECT date_val, total_altas FROM daily_counts WHERE EXTRACT(DAYOFWEEK FROM date_val) NOT IN (1, 7) ORDER BY total_altas DESC, date_val DESC LIMIT 1
      )
      SELECT 
        (SELECT total_pacs FROM wknd_pacs) as max_pac_wknd,
        (SELECT FORMAT_DATE('%d/%m/%Y', date_val) FROM wknd_pacs) as max_pac_wknd_date,
        (SELECT total_pacs FROM wkdy_pacs) as max_pac_wkdy,
        (SELECT FORMAT_DATE('%d/%m/%Y', date_val) FROM wkdy_pacs) as max_pac_wkdy_date,
        (SELECT total_altas FROM wknd_altas) as max_altas_wknd,
        (SELECT FORMAT_DATE('%d/%m/%Y', date_val) FROM wknd_altas) as max_altas_wknd_date,
        (SELECT total_altas FROM wkdy_altas) as max_altas_wkdy,
        (SELECT FORMAT_DATE('%d/%m/%Y', date_val) FROM wkdy_altas) as max_altas_wkdy_date
    `;

    const options = {
      query: sqlQuery,
      params: { inicio: startIso, fin: endIso }
    };

    const [rows] = await bigquery.query(options);
    return rows[0];
  };

  try {
    const [current, prevMonth, prevYear, ytd, records] = await Promise.all([
      runPeriodQuery(ranges.current.start, ranges.current.end),
      runPeriodQuery(ranges.prevMonth.start, ranges.prevMonth.end),
      runPeriodQuery(ranges.prevYear.start, ranges.prevYear.end),
      runPeriodQuery(ranges.ytd.start, ranges.ytd.end),
      runRecordsQuery(ranges.ytd.start, ranges.ytd.end)
    ]);

    return { current, prevMonth, prevYear, ytd, records };
  } catch (error) {
    console.error("Error en consulta BigQuery:", error);
    throw new functions.https.HttpsError('internal', 'Error procesando métricas en BigQuery: ' + error.message);
  }
});

exports.obtenerProyeccionVolumen = functions.https.onCall(async (dataReq, context) => {
  const data = dataReq.data || dataReq || {};
  const horizon = Number(data.horizon) || 7;
  const confidenceLevel = Number(data.confidenceLevel) || 0.95;

  const sqlQuery = `
    SELECT 
      FORMAT_DATE('%Y-%m-%d', DATE(forecast_timestamp, 'America/Santiago')) as fecha_predicha,
      CAST(ROUND(forecast_value) AS INT64) as atenciones_estimadas,
      CAST(ROUND(prediction_interval_lower_bound) AS INT64) as limite_inferior,
      CAST(ROUND(prediction_interval_upper_bound) AS INT64) as limite_superior
    FROM ML.FORECAST(
      MODEL \`metrico-dashboard-2026.metrico_analytics.prediccion_volumen_diario\`,
      STRUCT(@horizon AS horizon, @confidenceLevel AS confidence_level)
    )
    ORDER BY forecast_timestamp ASC
  `;

  try {
    const options = {
      query: sqlQuery,
      params: { horizon, confidenceLevel }
    };

    const [rows] = await bigquery.query(options);

    return rows.map(r => ({
      fecha_predicha: String(r.fecha_predicha),
      atenciones_estimadas: Number(r.atenciones_estimadas || 0),
      limite_inferior: Number(r.limite_inferior || 0),
      limite_superior: Number(r.limite_superior || 0)
    }));
  } catch (error) {
    console.error("Error en obtenerProyeccionVolumen:", error);
    throw new functions.https.HttpsError('internal', 'Error consultando modelo ARIMA_PLUS: ' + error.message);
  }
});
