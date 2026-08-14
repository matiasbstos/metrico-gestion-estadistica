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

async function testHourlyCurve() {
  const startIso = parseDateStrChile('2026-08-10', '16:00', 0);
  const endIso = parseDateStrChile('2026-08-11', '08:00', 59);

  const { BigQuery } = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  const sqlHourly = `
    SELECT 
      EXTRACT(HOUR FROM t_admision AT TIME ZONE 'America/Santiago') as hora,
      COUNT(*) as cantidad
    FROM \`metrico-dashboard-2026.metrico_analytics.v_pacientes_urgencia_master\`
    WHERE t_admision >= TIMESTAMP(@inicio) AND t_admision <= TIMESTAMP(@fin)
    GROUP BY hora
    ORDER BY hora ASC
  `;

  try {
    const [rows] = await bigquery.query({ query: sqlHourly, params: { inicio: startIso, fin: endIso } });
    console.log("\n✔ CURVA POR HORA DESDE VISTA MAESTRA (10/08 16:00 a 11/08 08:00):");
    console.table(rows.map(r => ({ hora: `${r.hora}:00`, cantidad: r.cantidad })));

    const sum = rows.reduce((acc, r) => acc + Number(r.cantidad), 0);
    console.log(`\nSuma total de atenciones en la curva: ${sum} pacientes -> ${sum === 101 ? '✔ COINCIDE 100% CON REPORTE Y CABECERA (101)' : '❌ DESCALCE'}`);
  } catch(err) {
    console.error("Error:", err.message);
  }
}

testHourlyCurve();
