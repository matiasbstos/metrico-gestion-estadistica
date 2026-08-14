const { BigQuery } = require('@google-cloud/bigquery');
const fetch = require('node-fetch');

async function analyzeRainBehavior() {
  try {
    const bigquery = new BigQuery({ projectId: 'metrico-dashboard-2026' });

    // 1. Consultar historial de atenciones diarias en BigQuery (últimos 30 días)
    const sql = `
      WITH daily AS (
        SELECT 
          DATE(SAFE.PARSE_TIMESTAMP('%Y-%m-%dT%H:%M:%E*S', JSON_VALUE(data, '$.tAdmision'))) AS fecha,
          COUNT(1) AS atenciones
        FROM \`metrico_analytics.pacientes_urgencia_raw_latest\`
        WHERE JSON_VALUE(data, '$.tAdmision') IS NOT NULL
        GROUP BY fecha
      )
      SELECT CAST(fecha AS STRING) AS fecha, atenciones
      FROM daily
      WHERE fecha >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      ORDER BY fecha ASC
    `;

    const [rows] = await bigquery.query({ query: sql });
    console.log(`BigQuery historial días obtenidos: ${rows.length}`);

    // 2. Consultar clima pasado en Melipilla (últimos 30 días)
    const airUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-33.68&longitude=-71.21&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=30&forecast_days=7&timezone=America%2FSantiago';
    const res = await fetch(airUrl);
    const wJson = await res.json();

    const weatherMap = {};
    if (wJson && wJson.daily) {
      wJson.daily.time.forEach((t, i) => {
        weatherMap[t] = {
          tMax: wJson.daily.temperature_2m_max[i],
          tMin: wJson.daily.temperature_2m_min[i],
          precip: wJson.daily.precipitation_sum[i] || 0
        };
      });
    }

    // 3. Cruzar datos de Lluvia Pasada vs Pacientes
    const cruzado = rows.map(r => {
      const w = weatherMap[r.fecha] || {};
      return {
        fecha: r.fecha,
        atenciones: r.atenciones,
        precip: w.precip || 0,
        tMin: w.tMin,
        tMax: w.tMax
      };
    });

    // 4. Calcular métricas de comportamiento:
    // a) Días sin lluvia (precip == 0)
    // b) Días de lluvia (precip > 2mm)
    // c) Días post-lluvia (día siguiente a precip > 2mm)

    let sumSecos = 0, countSecos = 0;
    let sumLluvia = 0, countLluvia = 0;
    let sumPostLluvia = 0, countPostLluvia = 0;

    cruzado.forEach((item, idx) => {
      if (item.precip > 2) {
        sumLluvia += item.atenciones;
        countLluvia++;
        // Mirar el día siguiente
        if (idx + 1 < cruzado.length) {
          sumPostLluvia += cruzado[idx + 1].atenciones;
          countPostLluvia++;
        }
      } else {
        sumSecos += item.atenciones;
        countSecos++;
      }
    });

    const avgSeco = countSecos > 0 ? (sumSecos / countSecos).toFixed(1) : 0;
    const avgLluvia = countLluvia > 0 ? (sumLluvia / countLluvia).toFixed(1) : 0;
    const avgPostLluvia = countPostLluvia > 0 ? (sumPostLluvia / countPostLluvia).toFixed(1) : 0;

    console.log("=== ANÁLISIS COMPORTAMIENTO CLIMA PASADO VS PATRONES ATENCIÓN ===");
    console.log(`Promedio día seco normal: ${avgSeco} pac/día (${countSecos} días)`);
    console.log(`Promedio DURANTE día de lluvia (>2mm): ${avgLluvia} pac/día (${countLluvia} días)`);
    console.log(`Promedio DÍA DESPUÉS de lluvia (Reboste/Post-Lluvia): ${avgPostLluvia} pac/día (${countPostLluvia} días)`);

    console.log("\nMuestra cruzada (últimos 10 días):");
    console.table(cruzado.slice(-10));

  } catch (e) {
    console.error("Error en análisis cruzado:", e.message);
  }
}

analyzeRainBehavior();
