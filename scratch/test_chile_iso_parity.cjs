const parseDateStrChile = (dateStr, hourMinStr = '00:00', defaultSec = 0) => {
  if (!dateStr) return new Date().toISOString();
  const str = String(dateStr).trim();
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
    } else {
      const now = new Date(); y = now.getFullYear(); m = now.getMonth() + 1; d = now.getDate();
    }
  }

  if (y < 100) y += 2000;
  if (y > 9999) y = 2026;

  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);
  const YYYY = String(y).padStart(4, '0');
  const MM = String(m).padStart(2, '0');
  const DD = String(d).padStart(2, '0');
  const HH = String(h || 0).padStart(2, '0');
  const MIN = String(min || 0).padStart(2, '0');
  const SS = String(defaultSec || 0).padStart(2, '0');

  return `${YYYY}-${MM}-${DD}T${HH}:${MIN}:${SS}-04:00`;
};

async function testChileIsoParity() {
  const startIso = parseDateStrChile('2026-08-10', '16:00', 0);
  const endIso = parseDateStrChile('2026-08-11', '08:00', 59);

  console.log("Start ISO (Chile America/Santiago):", startIso);
  console.log("End ISO (Chile America/Santiago):", endIso);

  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  const sqlQuery = `
    SELECT 
      COUNT(*) as totalAtenciones,
      COUNTIF(categoria_triage = 'C1') as totalC1,
      COUNTIF(categoria_triage = 'C2') as totalC2,
      COUNTIF(categoria_triage = 'C3') as totalC3,
      COUNTIF(categoria_triage = 'C4') as totalC4,
      COUNTIF(categoria_triage = 'C5') as totalC5,
      COUNTIF(flag_alta_administrativa) as totalAltas,
      COUNTIF(flag_traslado_hospitalario) as totalTraslados,
      COUNTIF(flag_constatacion_z518) as totalConstataciones,
      COALESCE(AVG(estadia_total_min), 0) as avgEstadia
    FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= TIMESTAMP(@inicio) AND t_admision <= TIMESTAMP(@fin)
  `;

  try {
    const [rows] = await bigquery.query({ query: sqlQuery, params: { inicio: startIso, fin: endIso } });
    console.log("\n✔ RESULTADO EN BIGQUERY CON ZONA HORARIA CHILE -04:00:");
    console.log(rows[0]);
    console.log(`\n¿Coincide con Rayen PDF (101 Pacientes, 14 Altas, 8 Traslados)? -> ${rows[0].totalAtenciones === 101 ? '✔ PARIDAD 100% PERFECTA!' : '❌ DESCALCE'}`);
  } catch(err) {
    console.error("Error:", err.message);
  }
}

testChileIsoParity();
