const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const BASELINE = {
  periodo_cobertura: '02/12/2024 al 08/08/2026 (20 Meses Históricos Auditados)',
  total_admitidos: 64037,
  total_atendidos: 58190,
  total_altas_admin: 5847,
  total_fracturas: 1840,
  total_constataciones: 674,
  total_traslados: 2211
};

async function runShadowTesting() {
  console.log("\n==========================================================================================");
  console.log("🔍 SHADOW TESTING: INTEGRIDAD DE DATOS VISTA MAESTRA (v_pacientes_urgencia_master) VS BASELINE");
  console.log(`📅 Cobertura Histórica Auditada: Desde el 02/12/2024 hasta la fecha activa`);
  console.log("==========================================================================================\n");

  const sqlQuery = `
    SELECT 
      COUNT(*) AS total_admitidos,
      COUNTIF(flag_atencion_medica_efectiva) AS total_atendidos,
      COUNTIF(flag_alta_administrativa) AS total_altas_admin,
      COUNTIF(flag_fractura) AS total_fracturas,
      COUNTIF(flag_constatacion_z518) AS total_constataciones,
      COUNTIF(flag_traslado_hospitalario) AS total_traslados
    FROM \`metrico_analytics.v_pacientes_urgencia_master\`
  `;

  try {
    console.log("⏳ Consultando Vista Maestra metrico_analytics.v_pacientes_urgencia_master en BigQuery...");
    const [rows] = await bigquery.query({ query: sqlQuery });
    const bqData = rows[0] || {};

    const metrics = [
      { key: 'total_admitidos', name: 'Pacientes Admitidos (Total)', bq: Number(bqData.total_admitidos || 0), target: BASELINE.total_admitidos },
      { key: 'total_atendidos', name: 'Atenciones Médicas Efectivas', bq: Number(bqData.total_atendidos || 0), target: BASELINE.total_atendidos },
      { key: 'total_altas_admin', name: 'Altas Administrativas / Retiros', bq: Number(bqData.total_altas_admin || 0), target: BASELINE.total_altas_admin },
      { key: 'total_fracturas', name: 'Traumatología & Fracturas', bq: Number(bqData.total_fracturas || 0), target: BASELINE.total_fracturas },
      { key: 'total_constataciones', name: 'Constataciones de Lesiones (Z51.8)', bq: Number(bqData.total_constataciones || 0), target: BASELINE.total_constataciones },
      { key: 'total_traslados', name: 'Traslados Hospitalarios', bq: Number(bqData.total_traslados || 0), target: BASELINE.total_traslados }
    ];

    console.log("\n------------------------------------------------------------------------------------------");
    console.log("| INDICADOR CLINICO / OPERACIONAL     | BIGQUERY QUERY | BASELINE TARGET | ESTADO DE AUDITORIA |");
    console.log("------------------------------------------------------------------------------------------");

    let allMatched = true;

    metrics.forEach(m => {
      const isMatch = m.bq === m.target;
      if (!isMatch) allMatched = false;
      const statusIcon = isMatch ? "✅ Match" : "❌ Discrepancia";
      const bqStr = m.bq.toLocaleString().padStart(14);
      const targetStr = m.target.toLocaleString().padStart(15);
      const nameStr = m.name.padEnd(35);
      console.log(`| ${nameStr} | ${bqStr} | ${targetStr} | ${statusIcon.padEnd(19)} |`);
    });

    console.log("------------------------------------------------------------------------------------------\n");

    if (allMatched) {
      console.log("🎉 AUDITORÍA EXITOSA: 100% MATCH CON LA LÍNEA BASE EN LAS 6 MÉTRICAS ASISTENCIALES.");
      console.log("✅ La tubería de datos transporta íntegramente los 64.037 registros a BigQuery.");
    } else {
      console.log("⚠️ ATENCIÓN: Se detectaron diferencias en algunas métricas.");
    }

  } catch (err) {
    console.log("\n💡 Nota: Si estas en entorno local sin credenciales gcloud, la función Cloud Function 'verificarDatosMaster' ejecutará la validación en GCP.");
    console.log("Detalle de ejecución local:", err.message);
  }
}

runShadowTesting();
