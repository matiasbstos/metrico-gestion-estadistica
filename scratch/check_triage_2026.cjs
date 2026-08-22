const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD-placeholder",
  authDomain: "metrico-dashboard-2026.firebaseapp.com",
  projectId: "metrico-dashboard-2026",
  storageBucket: "metrico-dashboard-2026.firebasestorage.app",
  messagingSenderId: "367375990264",
  appId: "1:367375990264:web:0ca5e39d3fb153d8650df4"
};

// Let's read firebase.js to get exact config
const fs = require('fs');
const path = require('path');
const fbFile = fs.readFileSync(path.join(__dirname, '../src/config/firebase.js'), 'utf8');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function analyzeTriage() {
  console.log("Fetching pacientes_urgencia...");
  const snap = await getDocs(collection(db, 'artifacts', 'metrico-sar-elsa-romo', 'public', 'data', 'pacientes_urgencia'));
  console.log(`Total records in Firestore: ${snap.size}`);

  const patients2026 = [];
  const catCount = {};
  const estadoCount = {};
  const c1List = [];

  snap.forEach(doc => {
    const p = doc.data();
    const dStr = p.fecha || (p.tAdmision ? p.tAdmision.substring(0, 10) : '');
    if (dStr >= '2026-01-01' && dStr <= '2026-08-16') {
      patients2026.push(p);

      const cat = (p.categoria || 'sincat').toLowerCase().trim();
      catCount[cat] = (catCount[cat] || 0) + 1;

      const est = (p.estado || 'sin_estado').trim();
      estadoCount[est] = (estadoCount[est] || 0) + 1;

      if (cat === 'c1' || cat.includes('c1')) {
        c1List.push({
          id: doc.id,
          fecha: dStr,
          correlativo: p.correlativo,
          nombre: p.nombrePaciente,
          diagnostico: p.diagnosticoPrincipal,
          tAdmision: p.tAdmision,
          categoria: p.categoria,
          estado: p.estado,
          destino: p.destinoAlta
        });
      }
    }
  });

  console.log(`\n--- 2026 PACIENTES (01/01/2026 - 16/08/2026) ---`);
  console.log(`Total pacientes 2026: ${patients2026.length}`);
  console.log(`\nDistribución por Campo 'categoria' en Pacientes:`, catCount);
  console.log(`\nDistribución por Campo 'estado' en Pacientes:`, estadoCount);
  console.log(`\nPacientes C1 encontrados (${c1List.length}):`, JSON.stringify(c1List, null, 2));

  // Now check turnos
  console.log("\nFetching turnos...");
  const turnosSnap = await getDocs(collection(db, 'artifacts', 'metrico-sar-elsa-romo', 'public', 'data', 'turnos'));
  let turnosTotPac = 0;
  let turnosAltas = 0;
  const turnosCatSum = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };

  turnosSnap.forEach(doc => {
    const t = doc.data();
    const f = t.fechaInicio ? t.fechaInicio.substring(0, 10) : '';
    if (f >= '2026-01-01' && f <= '2026-08-16') {
      turnosTotPac += Number(t.totalPacientes || 0);
      turnosAltas += Number(t.altasAdmin || 0);
      turnosCatSum.c1 += Number(t.c1 || 0);
      turnosCatSum.c2 += Number(t.c2 || 0);
      turnosCatSum.c3 += Number(t.c3 || 0);
      turnosCatSum.c3_z518 += Number(t.c3_z518 || 0);
      turnosCatSum.c4 += Number(t.c4 || 0);
      turnosCatSum.c5 += Number(t.c5 || 0);
      turnosCatSum.sincat += Number(t.sincat || 0);
    }
  });

  console.log(`\n--- SUMATORIA DE TURNOS 2026 ---`);
  console.log(`Total Pacientes en Turnos: ${turnosTotPac}`);
  console.log(`Altas Admin en Turnos: ${turnosAltas}`);
  console.log(`Atendidos en Turnos (Tot - Altas): ${turnosTotPac - turnosAltas}`);
  console.log(`Categorías en Turnos:`, turnosCatSum);
  const sumCats = turnosCatSum.c1 + turnosCatSum.c2 + turnosCatSum.c3 + turnosCatSum.c3_z518 + turnosCatSum.c4 + turnosCatSum.c5 + turnosCatSum.sincat;
  console.log(`Suma de todas las categorías en Turnos: ${sumCats}`);

  process.exit(0);
}

analyzeTriage().catch(err => {
  console.error(err);
  process.exit(1);
});
