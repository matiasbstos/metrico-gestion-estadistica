const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function runAudit() {
  console.log("================================================================");
  console.log("AUDITORIA DE DATOS DASHBOARD (01/08/2026 00:00 al 11/08/2026 23:59)");
  console.log("================================================================\n");

  // 1. GLOBAL ANUAL YTD 2026 (01/01/2026 al 11/08/2026 23:59:59)
  const queryYTD = `
    SELECT 
      COUNT(*) as admitidos_ytd,
      COUNTIF(flag_atencion_medica_efectiva) as atendidos_ytd,
      COUNTIF(flag_alta_administrativa) as altas_admin_ytd,
      COUNTIF(flag_traslado_hospitalario) as traslados_ytd,
      COUNTIF(flag_constatacion_z518) as constataciones_ytd,
      AVG(estadia_minutos) as estadia_prom_ytd
    FROM \`metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= '2026-01-01T00:00:00-04:00' 
      AND t_admision <= '2026-08-11T23:59:59-04:00'
  `;

  // 2. PERIODO SELECCIONADO (01/08/2026 al 11/08/2026)
  const queryPeriodo = `
    SELECT 
      COUNT(*) as admitidos,
      COUNTIF(flag_atencion_medica_efectiva) as atendidos,
      COUNTIF(flag_alta_administrativa) as altas_admin,
      COUNTIF(flag_traslado_hospitalario) as traslados,
      COUNTIF(flag_constatacion_z518) as constataciones,
      AVG(estadia_minutos) as estadia_prom,
      AVG(edad) as edad_prom,
      COUNTIF(LOWER(prevision) LIKE '%fonasa%') * 100.0 / COUNT(*) as pct_fonasa,
      COUNTIF(triage = 'C1' OR categorizacion = 'C1') as c1,
      COUNTIF(triage = 'C2' OR categorizacion = 'C2') as c2,
      COUNTIF((triage = 'C3' OR categorizacion = 'C3') AND NOT flag_constatacion_z518) as c3,
      COUNTIF(flag_constatacion_z518) as c3_l,
      COUNTIF(triage = 'C4' OR categorizacion = 'C4') as c4,
      COUNTIF(triage = 'C5' OR categorizacion = 'C5') as c5
    FROM \`metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= '2026-08-01T00:00:00-04:00' 
      AND t_admision <= '2026-08-11T23:59:59-04:00'
  `;

  // 3. MES ANTERIOR MISMO RANGO (01/07/2026 al 11/07/2026)
  const queryMesAntRango = `
    SELECT 
      COUNT(*) as admitidos,
      COUNTIF(flag_atencion_medica_efectiva) as atendidos,
      COUNTIF(flag_alta_administrativa) as altas_admin,
      COUNTIF(flag_traslado_hospitalario) as traslados,
      COUNTIF(flag_constatacion_z518) as constataciones,
      AVG(estadia_minutos) as estadia_prom,
      COUNTIF(triage = 'C1' OR categorizacion = 'C1') as c1,
      COUNTIF(triage = 'C2' OR categorizacion = 'C2') as c2,
      COUNTIF((triage = 'C3' OR categorizacion = 'C3') AND NOT flag_constatacion_z518) as c3,
      COUNTIF(flag_constatacion_z518) as c3_l,
      COUNTIF(triage = 'C4' OR categorizacion = 'C4') as c4,
      COUNTIF(triage = 'C5' OR categorizacion = 'C5') as c5
    FROM \`metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= '2026-07-01T00:00:00-04:00' 
      AND t_admision <= '2026-07-11T23:59:59-04:00'
  `;

  // 4. AÑO ANTERIOR MISMO RANGO (01/08/2025 al 11/08/2025)
  const queryAnoAntRango = `
    SELECT 
      COUNT(*) as admitidos,
      COUNTIF(flag_atencion_medica_efectiva) as atendidos,
      COUNTIF(flag_alta_administrativa) as altas_admin,
      COUNTIF(flag_traslado_hospitalario) as traslados,
      COUNTIF(flag_constatacion_z518) as constataciones,
      AVG(estadia_minutos) as estadia_prom,
      COUNTIF(triage = 'C1' OR categorizacion = 'C1') as c1,
      COUNTIF(triage = 'C2' OR categorizacion = 'C2') as c2,
      COUNTIF((triage = 'C3' OR categorizacion = 'C3') AND NOT flag_constatacion_z518) as c3,
      COUNTIF(flag_constatacion_z518) as c3_l,
      COUNTIF(triage = 'C4' OR categorizacion = 'C4') as c4,
      COUNTIF(triage = 'C5' OR categorizacion = 'C5') as c5
    FROM \`metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= '2025-08-01T00:00:00-04:00' 
      AND t_admision <= '2025-08-11T23:59:59-04:00'
  `;

  try {
    const [ytd] = await bigquery.query({ query: queryYTD });
    const [periodo] = await bigquery.query({ query: queryPeriodo });
    const [mesAnt] = await bigquery.query({ query: queryMesAntRango });
    const [anoAnt] = await bigquery.query({ query: queryAnoAntRango });

    console.log("--- 1. GLOBAL ANUAL (YTD 2026) ---");
    console.log("SQL Results:", ytd[0]);
    console.log("UI Values:   Admitidos: 24640 | Atendidos: 22514 | Altas Admin: 2126 | Traslados: 896 | Constataciones: 276 | Estadía: 133 min");

    console.log("\n--- 2. PERIODO SELECCIONADO (01/08/2026 - 11/08/2026) ---");
    console.log("SQL Results:", periodo[0]);
    console.log("UI Values:   Admitidos: 1151 | Atendidos: 1070 | Altas Admin: 81 | Traslados: 43 | Constataciones: 1 | Edad: 33.6 | % FONASA: 93.1%");

    console.log("\n--- 3. COMPARATIVA MES ANTERIOR (01/07 - 11/07) ---");
    console.log("SQL Results:", mesAnt[0]);
    if (periodo[0] && mesAnt[0]) {
      const p = periodo[0];
      const m = mesAnt[0];
      console.log(`Var Admitidos: ${(((p.admitidos - m.admitidos)/m.admitidos)*100).toFixed(1)}% (UI: +4.4%)`);
      console.log(`Var Atendidos: ${(((p.atendidos - m.atendidos)/m.atendidos)*100).toFixed(1)}% (UI: +7.8%)`);
      console.log(`Var Estadía:   ${(((p.estadia_prom - m.estadia_prom)/m.estadia_prom)*100).toFixed(1)}% (UI: -19.1%)`);
      console.log(`Var Altas Adm: ${(((p.altas_admin - m.altas_admin)/m.altas_admin)*100).toFixed(1)}% (UI: -25.7%)`);
      console.log(`Var Traslados: ${(((p.traslados - m.traslados)/m.traslados)*100).toFixed(1)}% (UI: +48.5%)`);
      console.log(`Var Constat:   ${(((p.constataciones - m.constataciones)/m.constataciones)*100).toFixed(1)}% (UI: 0.0%)`);
    }

    console.log("\n--- 4. COMPARATIVA AÑO ANTERIOR (01/08/2025 - 11/08/2025) ---");
    console.log("SQL Results:", anoAnt[0]);
    if (periodo[0] && anoAnt[0]) {
      const p = periodo[0];
      const a = anoAnt[0];
      console.log(`Var Admitidos: ${(((p.admitidos - a.admitidos)/a.admitidos)*100).toFixed(1)}% (UI: -6.2%)`);
      console.log(`Var Atendidos: ${(((p.atendidos - a.atendidos)/a.atendidos)*100).toFixed(1)}% (UI: -4.4%)`);
      console.log(`Var Estadía:   ${(((p.estadia_prom - a.estadia_prom)/a.estadia_prom)*100).toFixed(1)}% (UI: -14.3%)`);
      console.log(`Var Altas Adm: ${(((p.altas_admin - a.altas_admin)/a.altas_admin)*100).toFixed(1)}% (UI: -25.0%)`);
      console.log(`Var Traslados: ${(((p.traslados - a.traslados)/a.traslados)*100).toFixed(1)}% (UI: +2.4%)`);
      console.log(`Var Constat:   ${(((p.constataciones - a.constataciones)/a.constataciones)*100).toFixed(1)}% (UI: -93.3%)`);
    }

    console.log("\n--- 5. TRIAGE PERIOD SELECCIONADO ---");
    console.log("UI:  C1: 1 | C2: 8 | C3: 101 | C3(L): 1 | C4: 430 | C5: 584");
    console.log("SQL: C1:", periodo[0].c1, "| C2:", periodo[0].c2, "| C3:", periodo[0].c3, "| C3(L):", periodo[0].c3_l, "| C4:", periodo[0].c4, "| C5:", periodo[0].c5);

  } catch(err) {
    console.error("Error executing query:", err);
  }
}

runAudit();
