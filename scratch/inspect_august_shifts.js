import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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
  console.log("=== INSPECCIONANDO PAUTAS DE TURNO Y TURNOS DE AGOSTO 2026 ===");
  
  // 1. Revisar documento de pauta para 2026-08
  const pautaRef = doc(db, 'artifacts', appIdVal, 'public', 'data', 'pautas_turnos', '2026-08');
  const pautaSnap = await getDoc(pautaRef);
  if (pautaSnap.exists()) {
    console.log("Pauta 2026-08 encontrada en Firestore:");
    console.log(JSON.stringify(pautaSnap.data(), null, 2));
  } else {
    console.log("NO existe documento de pauta para '2026-08' en artifacts/urgencias-dashboard/public/data/pautas_turnos");
  }

  // 2. Listar todas las pautas existentes
  const allPautasRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pautas_turnos');
  const allPautasSnap = await getDocs(allPautasRef);
  console.log(`\nDocumentos en pautas_turnos: ${allPautasSnap.size}`);
  allPautasSnap.forEach(d => {
    console.log(` - ID: ${d.id}`);
  });

  // 3. Revisar turnos de agosto 2026
  const turnosRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'turnos');
  const turnosSnap = await getDocs(turnosRef);
  console.log(`\nTotal turnos en BD: ${turnosSnap.size}`);
  const turnosAug = [];
  turnosSnap.forEach(d => {
    const data = d.data();
    if (data.fechaInicio && data.fechaInicio.startsWith('2026-08')) {
      turnosAug.push({ id: d.id, ...data });
    }
  });

  console.log(`\nTurnos de Agosto 2026 encontrados: ${turnosAug.length}`);
  turnosAug.sort((a,b) => a.fechaInicio.localeCompare(b.fechaInicio));
  turnosAug.forEach(t => {
    console.log(`Turno: ${t.fechaInicio} ${t.horario || ''} | Equipo: ${t.equipo || 'SIN EQUIPO'} | Pacientes: ${t.totalPacientes || (t.pacientesList ? t.pacientesList.length : 0)} | Atendidos: ${t.totalAtendidos || 0}`);
  });

  // 4. Revisar pacientes de agosto 2026
  const pacsRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
  const pacsSnap = await getDocs(pacsRef);
  console.log(`\nTotal pacientes en BD: ${pacsSnap.size}`);
  let pacsAug = 0;
  let pacsAugAtendidos = 0;
  const pacsByDate = {};
  pacsSnap.forEach(d => {
    const p = d.data();
    if (p.tAdmision) {
      const dt = new Date(p.tAdmision);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      if (y === 2026 && m === '08') {
        pacsAug++;
        if (p.tAnamnesis || p.tAlta || p.medico) pacsAugAtendidos++;
        pacsByDate[dateStr] = (pacsByDate[dateStr] || 0) + 1;
      }
    }
  });

  console.log(`Pacientes de Agosto 2026: ${pacsAug} (Atendidos: ${pacsAugAtendidos})`);
  console.log("Desglose de pacientes por día de agosto:", pacsByDate);
}

run();
