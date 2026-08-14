const fetch = require('node-fetch');

async function debugAugust1011Pacs() {
  console.log("=== DESGLOSE DETALLADO DE PACIENTES 10/08 Y 11/08 ===");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Start of Aug 10 to End of Aug 11 UTC
  const startMs = new Date('2026-08-09T20:00:00.000Z').getTime(); // Aug 9 16:00 Chile
  const endMs = new Date('2026-08-12T04:00:00.000Z').getTime();   // Aug 12 00:00 Chile

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

    console.log(`Total Pacientes en Firestore en la ventana ampliada: ${rawPacs.length}`);

    // Deduplicar como lo hace helpers.js
    const map = new Map();
    const sorted = [...rawPacs].sort((a, b) => (b.tAdmision || 0) - (a.tAdmision || 0));
    sorted.forEach(p => {
      const correlativo = String(p.correlativo || p.id || '').replace(/\.0$/, '').trim();
      const tMs = p.tAdmision || 0;
      let key = correlativo ? `${correlativo}_${Math.floor(tMs / 86400000)}` : p.id;
      if (!map.has(key)) map.set(key, p);
    });
    const pacs = Array.from(map.values());

    console.log(`Pacientes desduplicados: ${pacs.length}`);

    // Test range: 10/08 16:00 to 11/08 08:00 local time
    const rStart = new Date(2026, 7, 10, 16, 0, 0).getTime(); // 10 Aug 16:00 local
    const rEnd = new Date(2026, 7, 11, 8, 0, 0).getTime();   // 11 Aug 08:00 local

    console.log(`Range Local Start: ${new Date(rStart).toLocaleString('es-CL')} (${rStart})`);
    console.log(`Range Local End:   ${new Date(rEnd).toLocaleString('es-CL')} (${rEnd})`);

    const inRange = pacs.filter(p => p.tAdmision >= rStart && p.tAdmision <= rEnd);
    console.log(`\n✔ Total pacientes entre 10/08 16:00 y 11/08 08:00: ${inRange.length}`);

    // Test range if overnight shift preset from 10/08 16:00 to 12/08 08:00 (if 11/08 is end day)
    const rEndShift = new Date(2026, 7, 12, 8, 0, 0).getTime(); // 12 Aug 08:00 local
    const inRange2Days = pacs.filter(p => p.tAdmision >= rStart && p.tAdmision <= rEndShift);
    console.log(`✔ Total pacientes si el turno nocturno abarca hasta el 12/08 08:00 (2 turnos noche): ${inRange2Days.length}`);

    // Print breakdown by date and hour for August 10 and 11
    console.log("\nDesglose por horas en Agosto 10 y 11:");
    const hourCounts = {};
    pacs.forEach(p => {
      const d = new Date(p.tAdmision);
      const dayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const hourStr = String(d.getHours()).padStart(2,'0');
      const key = `${dayStr} ${hourStr}:00`;
      hourCounts[key] = (hourCounts[key] || 0) + 1;
    });

    Object.keys(hourCounts).sort().forEach(k => {
      console.log(`  ${k} -> ${hourCounts[k]} admisiones`);
    });

  } catch (e) {
    console.error("Error:", e);
  }
}

debugAugust1011Pacs();
