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

async function testPoliceDestination() {
  const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
  const pSnap = await getDocs(pacientesRef);
  const patients = [];
  pSnap.forEach(doc => patients.push(doc.data()));

  const start2026 = new Date('2026-01-01T00:00:00-04:00').getTime();
  const endAug11 = new Date('2026-08-11T23:59:59-04:00').getTime();

  const pacs2026 = patients.filter(p => p.tAdmision >= start2026 && p.tAdmision <= endAug11);

  const keywordsPolice = ['CARABINERO', 'PDI', 'COMISARIA', 'COMISARÍA', 'POLICIA', 'POLICÍA', 'POLICIAL', 'FISCALIA', 'FISCALÍA', 'CUSTODIA', 'DETENIDO'];

  const isConstatacionExtended = (p) => {
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
    if (diag.includes('CONSTATAC') || diag.includes('LEGAL')) return true;
    
    // Mención explícita en Destino Alta u Observaciones
    if (keywordsPolice.some(k => dest.includes(k) || obs.includes(k))) return true;

    return false;
  };

  const byMonth = {};
  pacs2026.forEach(p => {
    const m = new Date(p.tAdmision).toISOString().substring(0, 7);
    if (!byMonth[m]) byMonth[m] = { total: 0, constatations: 0 };
    byMonth[m].total++;
    if (isConstatacionExtended(p)) byMonth[m].constatations++;
  });

  console.log("=== RESUMEN CONSTATACIONES Y ATENCIONES JUDICIALES/POLICIALES POR MES (YTD 2026) ===");
  console.table(byMonth);

  // August 1 to 11 details
  const startAug1 = new Date('2026-08-01T00:00:00-04:00').getTime();
  const augPacs = pacs2026.filter(p => p.tAdmision >= startAug1 && p.tAdmision <= endAug11);
  const augConstat = augPacs.filter(isConstatacionExtended);
  console.log(`\nAgosto 2026 (01/08 - 11/08): Total Admitidos = ${augPacs.length}, Constataciones/Judiciales = ${augConstat.length}`);
}

testPoliceDestination().catch(console.error);
