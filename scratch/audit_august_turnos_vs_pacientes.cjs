const fetch = require('node-fetch');

async function auditAugust() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Fetch all patients for August 2026
  const startAugust = new Date(2026, 7, 1, 0, 0, 0).getTime();
  const endAugust = new Date(2026, 7, 31, 23, 59, 59).getTime();

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
                value: { integerValue: startAugust }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: 'tAdmision' },
                op: 'LESS_THAN_OR_EQUAL',
                value: { integerValue: endAugust }
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
    return {
      tAdmision: Number(f.tAdmision?.integerValue || f.tAdmision?.stringValue || 0),
      estado: f.estado?.stringValue || '',
      categoria: f.categoria?.stringValue || ''
    };
  });

  console.log(`Total August 2026 patients in DB: ${pacientes.length}`);

  // Fetch turnos
  const urlTurnos = `https://firestore.googleapis.com/v1/${parent}/turnos?pageSize=300`;
  const resTurnos = await fetch(urlTurnos);
  const dataTurnos = await resTurnos.json();
  const docs = dataTurnos.documents || [];

  console.log(`\n=== AUDITING TURNOS DOCS IN FIRESTORE ===`);
  docs.forEach(doc => {
    const f = doc.fields || {};
    const fecha = f.fechaInicio?.stringValue;
    if (!fecha || !fecha.startsWith('2026-08')) return;

    const docId = doc.name.split('/').pop();
    const horario = f.horario?.stringValue || '';
    const storedTotal = Number(f.totalPacientes?.integerValue || f.totalPacientes?.stringValue || 0);
    const storedAltas = Number(f.altasAdmin?.integerValue || f.altasAdmin?.stringValue || 0);

    // Calculate real patient count for this shift
    let startMs, endMs;
    const nextDate = new Date(fecha + 'T12:00:00');
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    if (horario.includes('17:00')) {
      startMs = new Date(`${fecha}T16:00:00-04:00`).getTime();
      const isFriday = new Date(fecha + 'T12:00:00').getDay() === 5;
      const endHourStr = isFriday ? '08:00:00' : '09:00:00';
      endMs = new Date(`${nextDateStr}T${endHourStr}-04:00`).getTime();
    } else if (horario.includes('08:00 - 20:00')) {
      startMs = new Date(`${fecha}T07:00:00-04:00`).getTime();
      endMs = new Date(`${fecha}T20:00:00-04:00`).getTime();
    } else if (horario.includes('20:00 - 08:00')) {
      startMs = new Date(`${fecha}T19:00:00-04:00`).getTime();
      endMs = new Date(`${nextDateStr}T08:00:00-04:00`).getTime();
    }

    let realPacs = [];
    if (startMs && endMs) {
      realPacs = pacientes.filter(p => p.tAdmision >= startMs && p.tAdmision <= endMs);
    }

    const realTotal = realPacs.length;
    const realAltas = realPacs.filter(p => p.estado === 'Cancelada').length;

    const isMatch = (storedTotal === realTotal) && (storedAltas === realAltas);
    console.log(`DocID: ${docId} | Fecha: ${fecha} | Horario: ${horario}`);
    console.log(`  -> Firestore Stored: Total=${storedTotal}, Altas=${storedAltas}`);
    console.log(`  -> Real Patients:    Total=${realTotal}, Altas=${realAltas} ${isMatch ? '✅ MATCH' : '❌ DISCREPANCY!'}`);
  });
}

auditAugust();
