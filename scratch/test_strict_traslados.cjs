const fetch = require('node-fetch');

async function verifyStrictTraslados() {
  console.log("Verificando regla estricta: Hospital, Servicio de Urgencia, Urgencia...");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Query 2026 patients
  const startMs = new Date(2026, 0, 1, 0, 0, 0).getTime();
  const endMs = new Date(2026, 7, 6, 23, 59, 59).getTime();

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
  }).filter(p => p.tAdmision && p.tAdmision <= endMs);

  const isTrasladoHospitalario = (p) => {
    if (!p) return false;
    const dest = String(p.destinoAlta || p.destino || p.lugarDerivacion || p.motivoAlta || p.tipoAlta || '').toLowerCase();
    const cat = String(p.categoria || p.triage || '').toLowerCase();
    const obs = String(p.observacion || p.obs || '').toLowerCase();

    const isConsultorioOAmb = dest.includes('consultorio') || dest.includes('cesfam') || dest.includes('domicilio');
    const hasHospitalOUrgencia = dest.includes('hosp') || dest.includes('urgenc') || dest.includes('emergenc') || dest.includes('ueh');

    if (isConsultorioOAmb && !hasHospitalOUrgencia) {
      return false;
    }

    return (
      hasHospitalOUrgencia ||
      dest.includes('samu') ||
      obs.includes('hosp') ||
      obs.includes('urgenc') ||
      obs.includes('traslado a') ||
      cat === 'c1'
    );
  };

  const trasladosStrict = rawPacs.filter(isTrasladoHospitalario);
  console.log(`\n======================================================`);
  console.log(`TOTAL ADMISIONES EN 2026: ${rawPacs.length}`);
  console.log(`TOTAL TRASLADOS HOSPITALARIOS AUDITADOS: ${trasladosStrict.length}`);
  console.log(`PORCENTAJE SOBRE EL TOTAL: ${((trasladosStrict.length / rawPacs.length) * 100).toFixed(1)}%`);
  console.log(`======================================================\n`);

  const destMap = {};
  trasladosStrict.forEach(p => {
    const rawDest = p.destinoAlta || p.destino || p.lugarDerivacion || 'Hospital / UEH Melipilla';
    let cleanDest = 'Hospital / UEH (Atención Secundaria)';
    const dLower = String(rawDest).toLowerCase();
    if (dLower.includes('unidad de emergencia') || dLower.includes('ueh')) {
      cleanDest = 'Unidad de Emergencia Hospitalaria (UEH)';
    } else if (dLower.includes('hospital')) {
      cleanDest = 'Hospital Melipilla / Red Hospitalaria';
    } else if (dLower.includes('samu')) {
      cleanDest = 'SAMU / Traslado de Urgencia';
    } else if (dLower.includes('fallecido')) {
      cleanDest = 'Fallecido en Unidad';
    }
    destMap[cleanDest] = (destMap[cleanDest] || 0) + 1;
  });

  console.log("DESGLOSE DE CENTROS Y UNIDADES RECEPTORAS:");
  Object.entries(destMap).sort((a,b) => b[1] - a[1]).forEach(([dest, count]) => {
    console.log(` • ${dest}: ${count} pacientes (${((count / trasladosStrict.length)*100).toFixed(1)}%)`);
  });
}

verifyStrictTraslados();
