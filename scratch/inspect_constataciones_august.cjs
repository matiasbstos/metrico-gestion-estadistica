const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function inspectAugustConstataciones() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const startMs = new Date('2026-08-01T00:00:00-04:00').getTime();
  const endMs = new Date('2026-08-11T23:59:59-04:00').getTime();

  console.log(`Checking patients between 01/08/2026 and 11/08/2026 (${startMs} to ${endMs})...`);

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'pacientes_urgencia' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: 'tAdmision' }, op: 'GREATER_THAN_OR_EQUAL', value: { integerValue: startMs } } },
            { fieldFilter: { field: { fieldPath: 'tAdmision' }, op: 'LESS_THAN_OR_EQUAL', value: { integerValue: endMs } } }
          ]
        }
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const docs = data.filter(d => d.document).map(d => {
    const fields = d.document.fields;
    const obj = {};
    for (const k in fields) {
      const v = fields[k];
      if (v.stringValue !== undefined) obj[k] = v.stringValue;
      else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
      else if (v.doubleValue !== undefined) obj[k] = Number(v.doubleValue);
      else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    }
    return obj;
  });

  console.log(`Total pacientes returned from Firestore REST API: ${docs.length}`);

  const isConstatacionOficial = (p) => {
    if (!p) return false;
    if (p.flag_constatacion_z518 !== undefined && p.flag_constatacion_z518 !== null) {
      if (Boolean(p.flag_constatacion_z518)) return true;
    }
    const cat = String(p.categoria || p.categoria_triage || '').toLowerCase();
    if (cat === 'c3_z518') return true;
    const cod = String(p.codigoDiagnostico || p.codigo_diagnostico_cie10 || p.codigo || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
    const obs = String(p.observacion || p.obs || '').toUpperCase();

    if (cod.includes('Z51.8') || cod.includes('Z518') || cod.includes('Z04') || cod.includes('Z65') || cod.includes('Z02.7')) return true;
    if (diag.includes('CONSTATAC') || diag.includes('CIRCUNSTANCIAS LEGALES') || diag.includes('LEGAL')) return true;

    const keywordsPolice = ['CARABINERO', 'PDI', 'COMISARIA', 'COMISARÍA', 'POLICIA', 'POLICÍA', 'POLICIAL', 'DETENIDO', 'CUSTODIA', 'FISCALIA', 'FISCALÍA'];
    if (keywordsPolice.some(k => dest.includes(k) || obs.includes(k))) return true;

    return false;
  };

  const matches = docs.filter(isConstatacionOficial);
  console.log(`Matched Constataciones/Legal count: ${matches.length}`);

  matches.forEach(m => {
    console.log(`Match: ID=${m.correlativo || m.id}, Cat=${m.categoria}, Code=${m.codigoDiagnostico || m.codigo}, Diag=${m.diagnosticoPrincipal || m.diagnostico}, Dest=${m.destinoAlta}, Sexo=${m.sexo}, Edad=${m.edad}, Comuna=${m.comuna}`);
  });

}

inspectAugustConstataciones().catch(console.error);
