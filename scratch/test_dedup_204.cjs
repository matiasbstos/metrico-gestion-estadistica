const fetch = require('node-fetch');

const deduplicarPacientes = (pacientes) => {
  if (!pacientes || !Array.isArray(pacientes) || pacientes.length === 0) return [];

  const map = new Map();
  const sorted = [...pacientes].sort((a, b) => (b.tAdmision || 0) - (a.tAdmision || 0));

  sorted.forEach(p => {
    if (!p) return;
    const correlativo = String(p.correlativo || p.correlativo_raw || p.id || '').replace(/\.0$/, '').trim();
    const tMs = p.tAdmision || p.timestamp || 0;
    
    let key;
    if (correlativo && tMs > 0) {
      // Partition by correlativo + date string
      const d = new Date(tMs);
      const dayStr = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      key = `${correlativo}_${dayStr}`;
    } else {
      key = p.id || p.docId || `${tMs}_${Math.random()}`;
    }

    if (!map.has(key)) {
      map.set(key, p);
    }
  });

  return Array.from(map.values());
};

async function testDedup204() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const startMs = new Date(2026, 7, 10, 16, 0, 0).getTime();
  const endMs = new Date(2026, 7, 11, 8, 0, 0).getTime();

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

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
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

  const rangePacs = rawPacs.filter(p => p.tAdmision >= startMs && p.tAdmision <= endMs);
  console.log(`Pacientes crudos sin desduplicar en el rango: ${rangePacs.length}`);

  const dedupPacs = deduplicarPacientes(rangePacs);
  console.log(`✔ Pacientes desduplicados en el turno de 10/08 16:00 a 11/08 08:00: ${dedupPacs.length}`);
}

testDedup204();
