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

async function checkAugustDiagnoses() {
  const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
  const pSnap = await getDocs(pacientesRef);

  const startAug1 = new Date('2026-08-01T00:00:00-04:00').getTime();
  const endAug11 = new Date('2026-08-11T23:59:59-04:00').getTime();

  const augPatients = [];
  pSnap.forEach(doc => {
    const p = doc.data();
    if (p.tAdmision >= startAug1 && p.tAdmision <= endAug11) {
      augPatients.push(p);
    }
  });

  console.log(`Total pacientes en Agosto 1 al 11: ${augPatients.length}`);

  // Search for any suspicious terms in all string fields
  const matches = [];
  augPatients.forEach(p => {
    const fullText = JSON.stringify(p).toUpperCase();
    if (fullText.includes('Z51') || fullText.includes('Z04') || fullText.includes('CONSTAT') || fullText.includes('C3_Z518')) {
      matches.push(p);
    }
  });

  console.log(`Coincidencias con Z51/Z04/CONSTAT/C3_Z518 en Agosto: ${matches.length}`);
  matches.forEach(p => {
    console.log("Match:", {
      tAdmision: new Date(p.tAdmision).toISOString(),
      categoria: p.categoria,
      codigoDiagnostico: p.codigoDiagnostico,
      diagnosticoPrincipal: p.diagnosticoPrincipal,
      flag_constatacion_z518: p.flag_constatacion_z518
    });
  });

  // Let's also check July 2026 constataciones to compare how they were stored
  const startJuly1 = new Date('2026-07-01T00:00:00-04:00').getTime();
  const endJuly31 = new Date('2026-07-31T23:59:59-04:00').getTime();
  const julyConstatations = [];
  pSnap.forEach(doc => {
    const p = doc.data();
    if (p.tAdmision >= startJuly1 && p.tAdmision <= endJuly31) {
      const fullText = JSON.stringify(p).toUpperCase();
      if (fullText.includes('Z51') || fullText.includes('CONSTAT') || p.categoria === 'c3_z518' || p.flag_constatacion_z518) {
        julyConstatations.push(p);
      }
    }
  });

  console.log(`\nEjemplo de Constataciones en Julio (${julyConstatations.length} encontradas):`);
  julyConstatations.slice(0, 5).forEach(p => {
    console.log("Julio Constatacion:", {
      tAdmision: new Date(p.tAdmision).toISOString(),
      categoria: p.categoria,
      codigoDiagnostico: p.codigoDiagnostico,
      codigo: p.codigo,
      diagnosticoPrincipal: p.diagnosticoPrincipal,
      diagnostico: p.diagnostico,
      flag_constatacion_z518: p.flag_constatacion_z518
    });
  });
}

checkAugustDiagnoses().catch(console.error);
