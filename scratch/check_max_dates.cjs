const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function checkFechas() {
  try {
    const query = `
      SELECT 
        EXTRACT(DATE FROM t_admision AT TIME ZONE 'America/Santiago') as fecha,
        COUNT(*) as total
      FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
      GROUP BY fecha
      ORDER BY fecha DESC
      LIMIT 20
    `;
    const [rows] = await bigquery.query({ query });
    console.log("=== ÚLTIMAS 20 FECHAS EN VISTA MAESTRA BIGQUERY ===");
    console.table(rows.map(r => ({ fecha: r.fecha.value || r.fecha, total: r.total })));
  } catch(e) {
    console.error("Error BigQuery:", e.message);
  }
}

checkFechas();
