const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAx1kjRtaeeEhqdTJE7Q5_FlaSQLmFBzhI",
  authDomain: "metrico-dashboard-2026.firebaseapp.com",
  projectId: "metrico-dashboard-2026",
  storageBucket: "metrico-dashboard-2026.firebasestorage.app",
  messagingSenderId: "140680893264",
  appId: "1:140680893264:web:371040f89633e2a9529255"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appIdVal = 'urgencias-dashboard';

async function inspectPoliceMentions() {
  console.log("Downloading pacientes_urgencia from Firestore...");
  const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
  const pSnap = await getDocs(pacientesRef);

  const patients = [];
  pSnap.forEach(doc => patients.push(doc.data()));
  console.log(`Total pacientes cargados: ${patients.length}`);

  const start2026 = new Date('2026-01-01T00:00:00-04:00').getTime();
  const endAug11 = new Date('2026-08-11T23:59:59-04:00').getTime();
  const pacs2026 = patients.filter(p => p.tAdmision >= start2026 && p.tAdmision <= endAug11);

  const keywords = ['COMISARIA', 'COMISARÍA', 'CARABINERO', 'CARABINEROS', 'PDI', 'POLICIA', 'POLICÍA', 'POLICIAL', 'FISCALIA', 'FISCALÍA', 'DETENIDO', 'CUSTODIA'];

  const matchesDestino = [];
  const matchesObs = [];
  const matchesOther = [];

  pacs2026.forEach(p => {
    const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
    const obs = String(p.observacion || p.obs || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    const cod = String(p.codigoDiagnostico || p.codigo || '').toUpperCase();

    const hasInDest = keywords.some(k => dest.includes(k));
    const hasInObs = keywords.some(k => obs.includes(k));

    if (hasInDest) {
      matchesDestino.push(p);
    }
    if (hasInObs) {
      matchesObs.push(p);
    }
  });

  console.log(`\n=== RESULTADOS DE BÚSQUEDA DE MENCIONES POLICIALES/JUDICIALES (YTD 2026) ===`);
  console.log(`Pacientes con mención en Destino de Alta (destinoAlta): ${matchesDestino.length}`);
  console.log(`Pacientes con mención en Observaciones (observacion): ${matchesObs.length}`);

  console.log("\n--- EJEMPLOS DE DESTINO DE ALTA CON MENCION POLICIAL ---");
  matchesDestino.slice(0, 10).forEach((p, i) => {
    console.log(`[${i+1}] Fecha: ${new Date(p.tAdmision).toISOString().substring(0, 10)}`);
    console.log(`     Destino Alta: "${p.destinoAlta || p.destino}"`);
    console.log(`     Observación:  "${p.observacion || p.obs || ''}"`);
    console.log(`     Diagnóstico:  "${p.codigoDiagnostico || ''} - ${p.diagnosticoPrincipal || ''}"`);
    console.log(`     Categoría:    "${p.categoria}"`);
  });

  console.log("\n--- EJEMPLOS DE OBSERVACIONES CON MENCION POLICIAL ---");
  matchesObs.slice(0, 10).forEach((p, i) => {
    console.log(`[${i+1}] Fecha: ${new Date(p.tAdmision).toISOString().substring(0, 10)}`);
    console.log(`     Observación:  "${p.observacion || p.obs || ''}"`);
    console.log(`     Destino Alta: "${p.destinoAlta || p.destino}"`);
    console.log(`     Diagnóstico:  "${p.codigoDiagnostico || ''} - ${p.diagnosticoPrincipal || ''}"`);
  });

  // August 2026 specific check
  const startAug1 = new Date('2026-08-01T00:00:00-04:00').getTime();
  const augDestMatches = matchesDestino.filter(p => p.tAdmision >= startAug1 && p.tAdmision <= endAug11);
  const augObsMatches = matchesObs.filter(p => p.tAdmision >= startAug1 && p.tAdmision <= endAug11);

  console.log(`\n--- AGOSTO 2026 (01/08 - 11/08) ---`);
  console.log(`Menciones en Destino Alta en Agosto: ${augDestMatches.length}`);
  console.log(`Menciones en Observaciones en Agosto: ${augObsMatches.length}`);
  augDestMatches.concat(augObsMatches).forEach(p => {
    console.log("Agosto Police Match:", {
      fecha: new Date(p.tAdmision).toLocaleString('es-CL'),
      destinoAlta: p.destinoAlta || p.destino,
      observacion: p.observacion,
      codigoDiagnostico: p.codigoDiagnostico,
      diagnosticoPrincipal: p.diagnosticoPrincipal
    });
  });
}

inspectPoliceMentions().catch(console.error);
