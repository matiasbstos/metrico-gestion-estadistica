const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function verifyAnalisisConstataciones() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  const startMs = new Date('2026-08-01T00:00:00-04:00').getTime();
  const endMs = new Date('2026-08-11T23:59:59-04:00').getTime();

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

  const pacientesLesiones = docs.filter(isConstatacionOficial);
  console.log(`\n=== RESULTADO DEL ANÁLISIS DE CONSTATACIONES (01/08/2026 al 11/08/2026) ===`);
  console.log(`Total Constataciones & Atenciones Médico-Legales: ${pacientesLesiones.length} pac`);

  // Sexo breakdown
  let mujeres = 0, hombres = 0, otros = 0;
  pacientesLesiones.forEach(p => {
    const s = String(p.sexo || '').toUpperCase();
    if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') mujeres++;
    else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') hombres++;
    else otros++;
  });
  console.log(`Distribución por Sexo: Mujeres = ${mujeres} (${((mujeres/pacientesLesiones.length)*100).toFixed(1)}%), Hombres = ${hombres} (${((hombres/pacientesLesiones.length)*100).toFixed(1)}%)`);

  // Age groups
  const porRangoEdad = { '0-14': 0, '15-29': 0, '30-59': 0, '60+': 0, 'Desconocido': 0 };
  const matrizEdadSexo = {
    '0-14': { Mujeres: 0, Hombres: 0 },
    '15-29': { Mujeres: 0, Hombres: 0 },
    '30-59': { Mujeres: 0, Hombres: 0 },
    '60+': { Mujeres: 0, Hombres: 0 }
  };

  pacientesLesiones.forEach(p => {
    let r = '30-59';
    if (p.edad !== null && p.edad !== undefined && !isNaN(p.edad)) {
      if (p.edad <= 14) r = '0-14';
      else if (p.edad <= 29) r = '15-29';
      else if (p.edad <= 59) r = '30-59';
      else r = '60+';
    }
    porRangoEdad[r]++;
    const s = String(p.sexo || '').toUpperCase();
    if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') matrizEdadSexo[r].Mujeres++;
    else matrizEdadSexo[r].Hombres++;
  });

  console.log('\n--- MATRIZ EDAD VS SEXO ---');
  console.table(matrizEdadSexo);

  // Comunas breakdown
  const porComuna = {};
  pacientesLesiones.forEach(p => {
    const c = String(p.comuna || 'SIN REGISTRO').toUpperCase().trim() || 'SIN REGISTRO';
    porComuna[c] = (porComuna[c] || 0) + 1;
  });

  console.log('\n--- DISTRIBUCIÓN POR COMUNA DE RESIDENCIA ---');
  console.table(porComuna);

}

verifyAnalisisConstataciones().catch(console.error);
