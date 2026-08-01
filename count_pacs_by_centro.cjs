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

// We want to test different combinations of date range and filters to see which matches:
// Total triados in AnalisisEnfermeria (excluding sincat) = 2812
// No Registrado = 84
// Maria Pilar = 581
// Benjamin Chandia = 546
// Catherine Oviedo = 491
// Jonathan Contreras = 439
// FELIPE IGNACIO = 388
// Juan Mesa = 149
// Paulette Alexandra = 58
// ALAN MAURICIO = 39
// Pablo Reyes = 37

async function run() {
  try {
    const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
    const snapshot = await getDocs(pacientesRef);
    const patients = [];
    
    snapshot.forEach(doc => {
      patients.push(doc.data());
    });

    console.log(`Loaded ${patients.length} patients.`);

    // Let's test combinations:
    // 1. All patients in Enero-Julio 2026? But wait, the total was 23265.
    // 2. What about Diciembre 2025?
    // 3. What about a specific month? E.g. December 2025?
    // Let's search which subset has the exact counts!
    // We will group patients by month/year and see the counts of these nurses.
    
    const monthlyGroups = {};
    patients.forEach(p => {
      if (!p.tAdmision) return;
      const d = new Date(p.tAdmision);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!monthlyGroups[key]) monthlyGroups[key] = [];
      monthlyGroups[key].push(p);
    });

    Object.entries(monthlyGroups).sort().forEach(([monthKey, pacs]) => {
      // Calculate nurse counts
      const nurseCounts = {};
      pacs.forEach(p => {
        const cat = String(p.catPrimera || p.categoria || 'sincat').toLowerCase();
        if (cat === 'sincat') return; // exclude sincat
        
        const enf = p.enfermeroCat1 ? String(p.enfermeroCat1).trim() : (p.enfermeroCatUlt ? String(p.enfermeroCatUlt).trim() : 'No Registrado');
        nurseCounts[enf] = (nurseCounts[enf] || 0) + 1;
      });

      const total = Object.values(nurseCounts).reduce((a, b) => a + b, 0);
      
      console.log(`\nMonth: ${monthKey} (Total Triados: ${total})`);
      const sortedNurses = Object.entries(nurseCounts).sort((a,b) => b[1] - a[1]);
      sortedNurses.slice(0, 10).forEach(([nurse, count]) => {
        console.log(`- ${nurse}: ${count}`);
      });
    });

  } catch (err) {
    console.error(err);
  }
}

run();
