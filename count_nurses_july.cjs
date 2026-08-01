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

// We want to test different date ranges around July 2026:
// Range: 2026-07-01 to 2026-07-29

async function run() {
  try {
    const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
    const snapshot = await getDocs(pacientesRef);
    const patients = [];
    
    snapshot.forEach(doc => {
      patients.push(doc.data());
    });

    // Let's filter between July 1st and July 29th (local time, or UTC? Let's check both!)
    const tStartLocal = new Date(2026, 6, 1, 0, 0, 0).getTime();
    const tEndLocal = new Date(2026, 6, 29, 23, 59, 59).getTime();

    const tStartUTC = Date.UTC(2026, 6, 1, 0, 0, 0);
    const tEndUTC = Date.UTC(2026, 6, 29, 23, 59, 59);

    function testRange(start, end, label) {
      const nurseCounts = {};
      let total = 0;
      patients.forEach(p => {
        if (!p.tAdmision) return;
        if (p.tAdmision >= start && p.tAdmision <= end) {
          const cat = String(p.catPrimera || p.categoria || 'sincat').toLowerCase();
          if (cat === 'sincat') return;
          
          const enf = p.enfermeroCat1 ? String(p.enfermeroCat1).trim() : (p.enfermeroCatUlt ? String(p.enfermeroCatUlt).trim() : 'No Registrado');
          nurseCounts[enf] = (nurseCounts[enf] || 0) + 1;
          total++;
        }
      });
      console.log(`\n=== RANGE: ${label} (Total: ${total}) ===`);
      const sorted = Object.entries(nurseCounts).sort((a,b) => b[1] - a[1]);
      sorted.forEach(([nurse, count]) => {
        console.log(`- ${nurse}: ${count}`);
      });
    }

    testRange(tStartLocal, tEndLocal, "July 1st to July 29th (Local)");
    testRange(tStartUTC, tEndUTC, "July 1st to July 29th (UTC)");

  } catch (err) {
    console.error(err);
  }
}

run();
