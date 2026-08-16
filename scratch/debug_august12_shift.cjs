const fetch = require('node-fetch');

async function debugAug12Shift() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Fetch all patients for August 12-13, 2026
  const startMs = new Date(2026, 7, 12, 0, 0, 0).getTime();
  const endMs = new Date(2026, 7, 13, 23, 59, 59).getTime();

  const queryPacs = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'tAdmision' },
                op: 'GREATER_THAN_OR_EQUAL',
                value: { integerValue: startMs }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'tAdmision' },
                op: 'LESS_THAN_OR_EQUAL',
                value: { integerValue: endMs }
              }
            }
          ]
        }
      }
    }
  };

  const resPacs = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryPacs)
  });

  const rawPacs = await resPacs.json();
  const pacientes = rawPacs.map(item => {
    const f = item.document?.fields || {};
    const tAdm = Number(f.tAdmision?.integerValue || f.tAdmision?.stringValue || 0);
    const dObj = new Date(tAdm);
    return {
      id: item.document?.name.split('/').pop(),
      tAdmision: tAdm,
      dateIso: dObj.toISOString(),
      dateLocal: dObj.toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
      estado: f.estado?.stringValue || '',
      categoria: f.categoria?.stringValue || ''
    };
  });

  console.log(`Total patients on 12-13 Aug in DB: ${pacientes.length}`);

  // Test 1: Window 2026-08-12 16:00:00-04:00 to 2026-08-13 09:00:00-04:00
  // Note: 16:00-04:00 is 20:00 UTC. 09:00-04:00 is 13:00 UTC (+1 day)
  const shiftStartMs = new Date("2026-08-12T16:00:00-04:00").getTime();
  const shiftEndMs = new Date("2026-08-13T09:00:00-04:00").getTime();

  const windowPacs = pacientes.filter(p => p.tAdmision >= shiftStartMs && p.tAdmision <= shiftEndMs);
  console.log(`\n--- Shift Window (2026-08-12 16:00 to 2026-08-13 09:00 America/Santiago) ---`);
  console.log(`shiftStartMs: ${shiftStartMs} (${new Date(shiftStartMs).toISOString()})`);
  console.log(`shiftEndMs: ${shiftEndMs} (${new Date(shiftEndMs).toISOString()})`);
  console.log(`Matching patients: ${windowPacs.length}`);

  // Test 2: Filter by local date string matching "12/08/2026"
  const aug12DayPacs = pacientes.filter(p => {
    const d = new Date(p.tAdmision);
    // Chilean date
    const dayStr = d.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' });
    return dayStr.includes('12-08-2026') || dayStr.includes('12/08/2026');
  });
  console.log(`Patients admitted during civil day 12/08/2026 (00:00 to 23:59 America/Santiago): ${aug12DayPacs.length}`);

  // Test 3: Check how useMetricoAnalytics filters date range "2026-08-12" to "2026-08-13" with tipoCorte 'turno' and 16:00 - 09:00
  // In useMetricoAnalytics.js:
  // startMs = new Date("2026-08-12T16:00:00-04:00").getTime()
  // endMs = new Date("2026-08-13T09:00:00-04:00").getTime()
  // Let's print hour distribution of patients in windowPacs
  const hourCounts = {};
  windowPacs.forEach(p => {
    const d = new Date(p.tAdmision);
    const hourLocal = d.toLocaleTimeString('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit' });
    const hNum = parseInt(hourLocal.split(':')[0]);
    hourCounts[hNum] = (hourCounts[hNum] || 0) + 1;
  });
  console.log("\nHour distribution of shift window patients (America/Santiago):", hourCounts);

  // Let's check patients between 16:00 Aug 12 and 08:00 Aug 13 vs 16:00 Aug 12 and 09:00 Aug 13 vs 17:00 Aug 12 and 08:00 Aug 13!
  const shift17to08 = pacientes.filter(p => p.tAdmision >= new Date("2026-08-12T17:00:00-04:00").getTime() && p.tAdmision <= new Date("2026-08-13T08:00:00-04:00").getTime());
  console.log(`Shift 17:00 Aug 12 to 08:00 Aug 13 (America/Santiago): ${shift17to08.length}`);
}

debugAug12Shift();
