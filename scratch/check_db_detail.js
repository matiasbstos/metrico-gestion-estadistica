import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

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
  console.log("Conectando a Firestore...");
  try {
    const turnosRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'turnos');
    const q = query(turnosRef, limit(10));
    const snapshot = await getDocs(q);
    
    console.log(`Leídos ${snapshot.size} turnos.`);
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.fechaInicio && data.fechaInicio.startsWith('2026')) {
        console.log("\n==========================================");
        console.log("Turno ID:", doc.id);
        console.log("Data:", JSON.stringify(data, null, 2));
      }
    });
  } catch (err) {
    console.error("Error al consultar Firestore:", err);
  }
}

run();
