const fetch = require('node-fetch');

async function verifyDateRangeBaseline() {
  console.log("=== VERIFICACIÓN DE RANGO DE FECHAS DESDE EL 02/12/2024 ===");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Start date: 02/12/2024 (2 de Diciembre de 2024)
  const startMs = new Date(2024, 11, 2, 0, 0, 0).getTime(); // Month 11 is December

  const query = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia', allDescendants: false }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'tAdmision' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { integerValue: startMs }
        }
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    const data = await res.json();
    const rawPacs = data.map(item => {
      const fields = item.document?.fields || {};
      const obj = {};
      for (const [k, v] of Object.entries(fields)) {
        if (v.stringValue !== undefined) obj[k] = v.stringValue;
        else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
        else if (v.doubleValue !== undefined) obj[k] = Number(v.doubleValue);
        else if (v.timestampValue !== undefined) obj[k] = new Date(v.timestampValue).getTime();
      }
      return obj;
    }).filter(p => p.tAdmision);

    console.log(`\n✔ Total Pacientes desde el 02/12/2024 en Firestore: ${rawPacs.length}`);
    if (rawPacs.length > 0) {
      const timestamps = rawPacs.map(p => p.tAdmision).sort((a,b) => a - b);
      const minDate = new Date(timestamps[0]).toISOString();
      const maxDate = new Date(timestamps[timestamps.length - 1]).toISOString();
      console.log(`✔ Fecha Más Antigua Registrada: ${minDate}`);
      console.log(`✔ Fecha Más Reciente Registrada: ${maxDate}`);
    }
  } catch (e) {
    console.error("Error verificando rango de fechas:", e.message);
  }
}

verifyDateRangeBaseline();
