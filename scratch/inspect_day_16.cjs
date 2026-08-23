const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  // Try initializing with default credentials or project ID
  admin.initializeApp({
    projectId: 'metrico-dashboard-2026'
  });
}

const db = admin.firestore();

async function inspectDay() {
  console.log('Inspecting 16/08/2026...');
  const pacsSnap = await db.collection('pacientes').get();
  console.log(`Total pacientes in DB: ${pacsSnap.size}`);

  const startMs = new Date('2026-08-16T08:00:00').getTime();
  const endMs = new Date('2026-08-16T20:00:00').getTime();

  const turnoPacs = [];
  pacsSnap.forEach(doc => {
    const d = doc.data();
    const t = d.tAdmision || d.fechaHoraAdmision || (d.fecha ? new Date(d.fecha).getTime() : 0);
    if (t >= startMs && t <= endMs) {
      turnoPacs.push({ id: doc.id, ...d });
    }
  });

  console.log(`Pacientes between 08:00 and 20:00 on 16/08/2026: ${turnoPacs.length}`);

  // Let's count atendidos vs altas
  let atendidos = 0;
  let altas = 0;
  let constataciones = 0;
  let traslados = 0;

  const dests = {};
  const diags = [];

  turnoPacs.forEach(p => {
    const isAltaAdmin = p.isAltaAdmin || p.altaAdmin || (p.tipoAlta && String(p.tipoAlta).toLowerCase().includes('admin')) || (p.destinoAlta && String(p.destinoAlta).toLowerCase().includes('fuga') || String(p.destinoAlta).toLowerCase().includes('retiro') || String(p.destinoAlta).toLowerCase().includes('espera') || String(p.destinoAlta).toLowerCase().includes('alta admin'));
    if (isAltaAdmin) altas++;
    else atendidos++;

    const cat = String(p.categoria || p.categoria_triage || '').toLowerCase();
    const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    const isConstatacion = cat === 'c3_z518' || cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');
    if (isConstatacion) constataciones++;

    const dest = String(p.destinoAlta || p.destino || p.lugarDerivacion || p.motivoAlta || p.tipoAlta || '').toUpperCase();
    const obs = String(p.observacion || p.obs || '').toUpperCase();
    const isTrans = dest.includes('HOSP') || dest.includes('URGENC') || dest.includes('EMERGENC') || dest.includes('UEH') || dest.includes('SAMU') || dest.includes('DERIVAC') ||
                    obs.includes('HOSP') || obs.includes('URGENC') || obs.includes('EMERGENC') || obs.includes('UEH') || obs.includes('SAMU') ||
                    cat === 'c1';
    const isRoutine = (dest.includes('CONSULTORIO') || dest.includes('CESFAM') || dest.includes('DOMICILIO')) &&
                      !(dest.includes('HOSP') || dest.includes('URGENC') || dest.includes('EMERGENC') || dest.includes('UEH'));
    if (isTrans && !isRoutine) {
      traslados++;
      diags.push({ dest, cat, diag, cod, obs });
    }

    dests[dest] = (dests[dest] || 0) + 1;
  });

  console.log({
    total: turnoPacs.length,
    atendidos,
    altas,
    constataciones,
    traslados,
    trasladosDetails: diags,
    dests
  });
}

inspectDay().catch(console.error);
