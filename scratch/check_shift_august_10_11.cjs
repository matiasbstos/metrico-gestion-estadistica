const fetch = require('node-fetch');

async function checkShiftAugust1011() {
  console.log("=== VERIFICANDO PACIENTES DEL DE 10/08 16:00 AL 11/08 08:00 ===");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Start: 2026-08-10 16:00:00 Chile
  // End: 2026-08-11 08:00:00 Chile
  // GMT-4 (Chile standard summer/winter depending on DST, 16:00 local is 20:00 UTC)
  const startMs = new Date('2026-08-10T16:00:00-04:00').getTime();
  const endMs = new Date('2026-08-11T08:00:00-04:00').getTime();

  console.log(`Start MS: ${startMs} (${new Date(startMs).toISOString()})`);
  console.log(`End MS: ${endMs} (${new Date(endMs).toISOString()})`);

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

    console.log(`Total Pacientes desde 10/08 16:00: ${rawPacs.length}`);

    const inRange = rawPacs.filter(p => p.tAdmision >= startMs && p.tAdmision <= endMs);
    console.log(`✔ Pacientes exactos en el rango 10/08 16:00 a 11/08 08:00: ${inRange.length}`);

    if (inRange.length > 0) {
      console.log("\nPrimeros 5 pacientes en el turno:");
      inRange.slice(0, 5).forEach(p => {
        console.log(` - Correlativo: ${p.correlativo}, Fecha Adm: ${new Date(p.tAdmision).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}, Categoria: ${p.categoria}`);
      });
    }

    // Also check total patients on August 10 and August 11 overall
    const aug10Start = new Date('2026-08-10T00:00:00-04:00').getTime();
    const aug11End = new Date('2026-08-11T23:59:59-04:00').getTime();
    const aug1011All = rawPacs.filter(p => p.tAdmision >= aug10Start && p.tAdmision <= aug11End);
    console.log(`\nPacientes totales entre 10/08 00:00 y 11/08 23:59: ${aug1011All.length}`);

  } catch (e) {
    console.error("Error:", e.message);
  }
}

checkShiftAugust1011();
