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

async function testFix() {
  const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
  const pSnap = await getDocs(pacientesRef);
  const patients = [];
  pSnap.forEach(doc => patients.push(doc.data()));

  const start2026 = new Date('2026-01-01T00:00:00-04:00').getTime();
  const endAug11 = new Date('2026-08-11T23:59:59-04:00').getTime();

  const pacs2026 = patients.filter(p => p.tAdmision >= start2026 && p.tAdmision <= endAug11);

  // Original helper in AnalisisConstataciones.jsx:
  const isConstatacionOriginal = (p) => {
    if (!p) return false;
    if (p.categoria === 'c3_z518') return true;
    const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    return cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');
  };

  // Fixed helper in AnalisisConstataciones.jsx:
  const isConstatacionFixed = (p) => {
    if (!p) return false;
    if (p.flag_constatacion_z518 !== undefined) return Boolean(p.flag_constatacion_z518);
    const cat = String(p.categoria || '').toLowerCase();
    if (cat === 'c3_z518') return true;
    const cod = String(p.codigoDiagnostico || p.codigo_diagnostico_cie10 || p.codigo || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    return cod.includes('Z51.8') || cod.includes('Z518') || cod.includes('Z04') || diag.includes('CONSTATAC') || diag.includes('LESIÓN') || diag.includes('LESION');
  };

  let countOrig = 0;
  let countFixed = 0;
  pacs2026.forEach(p => {
    if (isConstatacionOriginal(p)) countOrig++;
    if (isConstatacionFixed(p)) countFixed++;
  });

  console.log(`\n=== PRUEBA DE PARIDAD Y FIX DE CONSTATACIONES YTD 2026 ===`);
  console.log(`Total Pacientes 2026 (01/01 - 11/08): ${pacs2026.length}`);
  console.log(`Constataciones con helper Original en AnalisisConstataciones.jsx: ${countOrig}`);
  console.log(`Constataciones con helper Corregido (Case-Insensitive + flag + Z04): ${countFixed}`);

  // Let's breakdown by month
  const byMonthOrig = {};
  const byMonthFixed = {};

  pacs2026.forEach(p => {
    const m = new Date(p.tAdmision).toISOString().substring(0, 7);
    if (!byMonthOrig[m]) byMonthOrig[m] = 0;
    if (!byMonthFixed[m]) byMonthFixed[m] = 0;
    if (isConstatacionOriginal(p)) byMonthOrig[m]++;
    if (isConstatacionFixed(p)) byMonthFixed[m]++;
  });

  console.log("\nDesglose mensual 2026:");
  Object.keys(byMonthOrig).sort().forEach(m => {
    console.log(`  ${m}: Original = ${byMonthOrig[m]} | Corregido = ${byMonthFixed[m]}`);
  });
}

testFix().catch(console.error);
