async function inspectRayen101Patients() {
  console.log("=== INSPECCIONANDO LOS PACIENTES DEL TURNO 10/08 16:00 A 11/08 08:00 EN BIGQUERY ===");
  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  // 1. Rango estricto [16:00:00 a 08:00:59]
  const sqlStrict = `
    SELECT 
      correlativo_raw,
      t_admision,
      FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', t_admision, 'America/Santiago') as admision_chile
    FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= TIMESTAMP('2026-08-10 16:00:00', 'America/Santiago')
      AND t_admision <= TIMESTAMP('2026-08-11 08:00:59', 'America/Santiago')
    ORDER BY t_admision ASC
  `;

  // 2. Rango con tolerancia asistencial de 1 hora antes/después (15:00 a 09:00)
  const sqlExtended = `
    SELECT 
      correlativo_raw,
      t_admision,
      FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', t_admision, 'America/Santiago') as admision_chile
    FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= TIMESTAMP('2026-08-10 15:00:00', 'America/Santiago')
      AND t_admision <= TIMESTAMP('2026-08-11 09:00:00', 'America/Santiago')
    ORDER BY t_admision ASC
  `;

  // 3. Rango por fecha_turno = '2026-08-10' y turno_num = 2 (Turno Largo Noche Oficial)
  const sqlTurnoNum = `
    SELECT 
      COUNT(*) as total_turno_noche
    FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
    WHERE fecha_turno = '2026-08-10' AND turno_num = 2
  `;

  try {
    const [rowsStrict] = await bigquery.query({ query: sqlStrict });
    const [rowsExtended] = await bigquery.query({ query: sqlExtended });
    const [rowsTurno] = await bigquery.query({ query: sqlTurnoNum });

    console.log(`\n1. Con filtro UTC estricto (16:00 a 08:00): ${rowsStrict.length} pacientes`);
    console.log(`2. Con fecha_turno = '2026-08-10' AND turno_num = 2 (Turno Noche Oficial): ${rowsTurno[0].total_turno_noche} pacientes`);
    console.log(`3. Con rango ampliado (15:00 a 09:00): ${rowsExtended.length} pacientes`);

    console.log("\n--- Pacientes entre 15:00 y 16:15 el 10/08 ---");
    rowsExtended.filter(r => r.admision_chile >= '2026-08-10 15:00:00' && r.admision_chile <= '2026-08-10 16:15:00').forEach(r => {
      console.log(`   Corr: ${r.correlativo_raw} | Admisión Chile: ${r.admision_chile}`);
    });

    console.log("\n--- Pacientes entre 07:45 y 09:00 el 11/08 ---");
    rowsExtended.filter(r => r.admision_chile >= '2026-08-11 07:45:00' && r.admision_chile <= '2026-08-11 09:00:00').forEach(r => {
      console.log(`   Corr: ${r.correlativo_raw} | Admisión Chile: ${r.admision_chile}`);
    });

  } catch(err) {
    console.error("Error running inspection:", err.message);
  }
}

inspectRayen101Patients();
