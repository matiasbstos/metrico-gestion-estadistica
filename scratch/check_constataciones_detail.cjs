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

async function inspectConstataciones() {
  console.log("Downloading pacientes_urgencia from Firestore...");
  const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
  const pSnap = await getDocs(pacientesRef);

  const patients = [];
  pSnap.forEach(doc => patients.push(doc.data()));
  console.log(`Total pacientes cargados: ${patients.length}`);

  // Let's filter for 2026
  const start2026 = new Date('2026-01-01T00:00:00-04:00').getTime();
  const endAug11 = new Date('2026-08-11T23:59:59-04:00').getTime();

  const pacs2026 = patients.filter(p => p.tAdmision >= start2026 && p.tAdmision <= endAug11);
  console.log(`Pacientes en 2026 (hasta 11/08): ${pacs2026.length}`);

  // August 1 to 11
  const startAug1 = new Date('2026-08-01T00:00:00-04:00').getTime();
  const pacsAug = patients.filter(p => p.tAdmision >= startAug1 && p.tAdmision <= endAug11);
  console.log(`Pacientes en Agosto (01/08 - 11/08): ${pacsAug.length}`);

  console.log("\n--- INSPECION DE CONSTATACIONES EN AGOSTO 2026 (01/08 - 11/08) ---");
  const augConstatations = pacsAug.filter(p => {
    return p.flag_constatacion_z518 || 
           p.categoria === 'c3_z518' || 
           String(p.codigoDiagnostico || p.codigo || '').toUpperCase().includes('Z51') ||
           String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase().includes('CONSTATAC') ||
           String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase().includes('LESION');
  });

  console.log(`Constataciones detectadas en Agosto: ${augConstatations.length}`);
  augConstatations.forEach((p, i) => {
    console.log(`\n[${i+1}] Paciente ID: ${p.id || 'N/A'}`);
    console.log(`  Fecha: ${new Date(p.tAdmision).toLocaleString('es-CL')}`);
    console.log(`  flag_constatacion_z518: ${p.flag_constatacion_z518}`);
    console.log(`  categoria: ${p.categoria}`);
    console.log(`  codigoDiagnostico: ${p.codigoDiagnostico}`);
    console.log(`  codigo: ${p.codigo}`);
    console.log(`  diagnosticoPrincipal: ${p.diagnosticoPrincipal}`);
    console.log(`  diagnostico: ${p.diagnostico}`);
  });

  console.log("\n--- CONSTATACIONES MENSUALES EN TODO 2026 ---");
  const monthlyStats = {};
  pacs2026.forEach(p => {
    const isConstat = Boolean(
      p.flag_constatacion_z518 || 
      p.categoria === 'c3_z518' || 
      String(p.codigoDiagnostico || p.codigo || '').toUpperCase().includes('Z51') ||
      String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase().includes('CONSTATAC')
    );
    const monthKey = new Date(p.tAdmision).toISOString().substring(0, 7);
    if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { totalPacs: 0, constatations: 0, byFlag: 0, byCat: 0, byDiag: 0 };
    monthlyStats[monthKey].totalPacs++;
    if (isConstat) {
      monthlyStats[monthKey].constatations++;
      if (p.flag_constatacion_z518) monthlyStats[monthKey].byFlag++;
      if (p.categoria === 'c3_z518') monthlyStats[monthKey].byCat++;
      if (String(p.codigoDiagnostico || p.codigo || p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase().includes('Z51') || String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase().includes('CONSTATAC')) monthlyStats[monthKey].byDiag++;
    }
  });

  console.table(monthlyStats);
}

inspectConstataciones().catch(console.error);
