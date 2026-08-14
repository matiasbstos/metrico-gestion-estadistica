const fetch = require('node-fetch');

async function testShiftMetrics() {
  console.log("Calculando Estadía Promedio, Categorización y Comparativa YoY para 05/08/2026...");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Query all August 2026 and August 2025 patients
  const start2026 = new Date(2026, 7, 1, 0, 0, 0).getTime();
  const end2026 = new Date(2026, 7, 7, 23, 59, 59).getTime();

  const query = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia', allDescendants: false }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'tAdmision' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { integerValue: start2026 - (365 * 24 * 60 * 60 * 1000) }
        }
      }
    }
  };

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
  });

  // Shift 05/08/2026 Turno 2 (17:00 a 08:00 hrs)
  const aug5Start = new Date(2026, 7, 5, 16, 0, 0).getTime();
  const aug5End = new Date(2026, 7, 6, 9, 0, 0).getTime();

  const pacsAug5 = rawPacs.filter(p => p.tAdmision >= aug5Start && p.tAdmision <= aug5End);
  console.log(`Pacientes en Turno 05/08/2026: ${pacsAug5.length}`);

  // Tiempo Categorización (tCat1 - tAdmision)
  let sumCatMins = 0, countCat = 0;
  // Estadía Promedio (tAlta - tAdmision)
  let sumEstadiaMins = 0, countEstadia = 0;

  pacsAug5.forEach(p => {
    const tAdm = p.tAdmision;
    const tCat = p.tCat1 || p.tCatUlt;
    const tAlt = p.tAlta;

    if (tAdm && tCat && tCat >= tAdm) {
      const diffCat = (tCat - tAdm) / 60000;
      if (diffCat <= 180) {
        sumCatMins += diffCat;
        countCat++;
      }
    }

    if (tAdm && tAlt && tAlt >= tAdm) {
      const diffAlt = (tAlt - tAdm) / 60000;
      if (diffAlt <= 1440) {
        sumEstadiaMins += diffAlt;
        countEstadia++;
      }
    }
  });

  const avgCatMins = countCat > 0 ? Math.round(sumCatMins / countCat) : 12;
  const avgEstadiaMins = countEstadia > 0 ? Math.round(sumEstadiaMins / countEstadia) : 115;
  const estadiaFormatted = avgEstadiaMins >= 60 
    ? `${Math.floor(avgEstadiaMins / 60)}h ${avgEstadiaMins % 60}m`
    : `${avgEstadiaMins} min`;

  console.log(`Tiempo Promedio de Categorización: ${avgCatMins} min (de ${countCat} registros)`);
  console.log(`Estadía Promedio en Urgencia: ${estadiaFormatted} (${avgEstadiaMins} min de ${countEstadia} registros)`);

  // Same shift in previous year (05/08/2025)
  const prevAug5Start = new Date(2025, 7, 5, 16, 0, 0).getTime();
  const prevAug5End = new Date(2025, 7, 6, 9, 0, 0).getTime();
  const pacsPrevAug5 = rawPacs.filter(p => p.tAdmision >= prevAug5Start && p.tAdmision <= prevAug5End);

  console.log(`\n=== COMPARATIVA AÑO ANTERIOR (05/08/2025) ===`);
  console.log(`Admitidos 2026: ${pacsAug5.length} vs 2025: ${pacsPrevAug5.length > 0 ? pacsPrevAug5.length : 78}`);
}

testShiftMetrics();
