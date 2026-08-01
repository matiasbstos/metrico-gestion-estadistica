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

async function run() {
  console.log("Analizando datos filtrados por centro...");
  try {
    const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
    const snapshot = await getDocs(pacientesRef);
    const patients = [];
    
    snapshot.forEach(doc => {
      patients.push(doc.data());
    });

    // We will group by center and calculate:
    // For Jan 1st to July 29th:
    // - Total triados (excluding sincat)
    // - No Registrado count (excluding sincat)
    // - Total patients (including sincat)
    
    const start = new Date(2026, 0, 1, 0, 0, 0).getTime();
    const end = new Date(2026, 6, 29, 23, 59, 59).getTime();

    const centers = {};
    patients.forEach(p => {
      if (!p.tAdmision) return;
      if (p.tAdmision < start || p.tAdmision > end) return;
      
      const centro = p.centro || 'Sin Centro';
      if (!centers[centro]) {
        centers[centro] = { total: 0, triados: 0, noReg: 0, noRegWithCat: 0, byMonth: {} };
      }
      
      const c = centers[centro];
      c.total++;
      
      const cat = String(p.catPrimera || p.categoria || 'sincat').toLowerCase();
      const hasCat = cat && cat !== 'sincat';
      const enf1 = p.enfermeroCat1 || '';
      const enfUlt = p.enfermeroCatUlt || '';
      const noEnf = !enf1 && !enfUlt;
      
      if (hasCat) {
        c.triados++;
        if (noEnf) {
          c.noRegWithCat++;
        }
      }
      
      if (noEnf) {
        c.noReg++;
      }

      const d = new Date(p.tAdmision);
      const mKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (!c.byMonth[mKey]) c.byMonth[mKey] = { total: 0, triados: 0, noRegWithCat: 0 };
      c.byMonth[mKey].total++;
      if (hasCat) {
        c.byMonth[mKey].triados++;
        if (noEnf) c.byMonth[mKey].noRegWithCat++;
      }
    });

    console.log("=== ANÁLISIS DE CENTROS PARA ENERO-JULIO 2026 ===");
    Object.entries(centers).forEach(([centro, stats]) => {
      console.log(`\nCentro: ${centro}`);
      console.log(`- Total registros: ${stats.total}`);
      console.log(`- Total Triados (C1-C5): ${stats.triados}`);
      console.log(`- No Registrado (con categoría): ${stats.noRegWithCat}`);
      console.log(`- No Registrado (total, inc. sincat): ${stats.noReg}`);
      console.log("- Desglose por mes (Enero-Julio):");
      Object.entries(stats.byMonth).sort().forEach(([m, mStats]) => {
        console.log(`  * ${m}: Triados = ${mStats.triados}, No Registrado con Cat = ${mStats.noRegWithCat}`);
      });
    });

  } catch (err) {
    console.error(err);
  }
}

run();
