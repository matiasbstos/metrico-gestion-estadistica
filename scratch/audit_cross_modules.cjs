const fetch = require('node-fetch');

async function auditCrossModules() {
  console.log("=== AUDITORÍA GLOBAL DE CRUCE DE DATOS ENTRE MÓDULOS EN METRICO 2026 ===");
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;

  // Admisiones 2026 hasta 06/08/2026
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

  console.log(`\n1. GLOBAL ADMISIONES 2026: ${rawPacs.length} pacientes`);

  // Altas administrativas vs atendidos
  const altasAdmin = rawPacs.filter(p => p.estado === 'Cancelada');
  const atendidos = rawPacs.length - altasAdmin.length;
  const pctAltasAdmin = ((altasAdmin.length / rawPacs.length) * 100).toFixed(1);

  console.log(`   - Atenciones Médicas Efectivas: ${atendidos}`);
  console.log(`   - Altas Administrativas / Retiros: ${altasAdmin.length} (${pctAltasAdmin}%)`);

  // Módulo Fracturas / Traumatología
  const fracturas = rawPacs.filter(p => {
    const diag = String(p.diagnosticoPrincipal || p.codigoDiagnostico || p.diagnostico || '').toLowerCase();
    return diag.includes('fractura') || diag.includes('fx') || diag.includes('traumatism');
  });
  console.log(`\n2. MÓDULO FRACTURAS & TRAUMATOLOGÍA: ${fracturas.length} casos (${((fracturas.length / rawPacs.length)*100).toFixed(1)}%)`);

  // Módulo Constatación de Lesiones (Z51.8)
  const constataciones = rawPacs.filter(p => {
    const diag = String(p.diagnosticoPrincipal || p.codigoDiagnostico || p.diagnostico || '').toLowerCase();
    return diag.includes('z51.8') || diag.includes('z518') || diag.includes('constatacion') || diag.includes('lesiones');
  });
  console.log(`\n3. MÓDULO CONSTATACIÓN DE LESIONES (Z51.8): ${constataciones.length} casos (${((constataciones.length / rawPacs.length)*100).toFixed(1)}%)`);

  // Módulo Traslados Hospitalarios
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

  const traslados = rawPacs.filter(isTrasladoHospitalario);
  console.log(`\n4. MÓDULO TRASLADOS HOSPITALARIOS: ${traslados.length} traslados auditados (${((traslados.length / rawPacs.length)*100).toFixed(1)}%)`);

  // Categorización por Triage
  const triage = { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, sinCat: 0 };
  rawPacs.forEach(p => {
    const cat = String(p.categoria || p.triage || '').toUpperCase();
    if (cat.includes('C1')) triage.c1++;
    else if (cat.includes('C2')) triage.c2++;
    else if (cat.includes('C3')) triage.c3++;
    else if (cat.includes('C4')) triage.c4++;
    else if (cat.includes('C5')) triage.c5++;
    else triage.sinCat++;
  });

  console.log(`\n5. DISTRIBUCIÓN GLOBAL DE TRIAGE:`);
  console.log(`   - C1 (Emergencia Vital): ${triage.c1}`);
  console.log(`   - C2 (Urgencia Alta): ${triage.c2}`);
  console.log(`   - C3 (Urgencia Media): ${triage.c3}`);
  console.log(`   - C4 (Baja Complejidad): ${triage.c4}`);
  console.log(`   - C5 (General / Ambulatorio): ${triage.c5}`);
  console.log(`   - Sin Categorización Registrar: ${triage.sinCat}`);
}

auditCrossModules();
