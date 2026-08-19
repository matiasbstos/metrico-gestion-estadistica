const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'metrico-dashboard-2026'
  });
}

const db = admin.firestore();

async function run() {
  const turnosSnap = await db.collection('artifacts/metrico-gestion-estadistica/public/data/turnos_urgencia')
    .where('fechaInicio', '>=', '2026-08-01')
    .where('fechaInicio', '<=', '2026-08-16')
    .get();

  console.log(`Found ${turnosSnap.docs.length} turnos in August 2026`);
  turnosSnap.docs.slice(0, 5).forEach(doc => {
    const d = doc.data();
    console.log('Turno:', doc.id, {
      fechaInicio: d.fechaInicio,
      fechaFin: d.fechaFin,
      horario: d.horario,
      loteId: d.loteId,
      totalPacientes: d.totalPacientes,
      tiempoAdmCat: d.tiempoAdmCat,
      tiempoCatAna: d.tiempoCatAna,
      tiempoAnaAlt: d.tiempoAnaAlt,
      tiempoAdmAlt: d.tiempoAdmAlt
    });
  });

  const pacSnap = await db.collection('artifacts/metrico-gestion-estadistica/public/data/pacientes_urgencia')
    .where('tAdmision', '>=', new Date(2026, 7, 1).getTime())
    .where('tAdmision', '<=', new Date(2026, 7, 17).getTime())
    .limit(10)
    .get();

  console.log(`Found sample patients in August 2026:`);
  pacSnap.docs.slice(0, 5).forEach(doc => {
    const d = doc.data();
    console.log('Paciente:', doc.id, {
      loteId: d.loteId,
      tAdmision: d.tAdmision,
      tCat1: d.tCat1,
      tCatUlt: d.tCatUlt,
      tAnamnesis: d.tAnamnesis,
      tAlta: d.tAlta,
      correlativo: d.correlativo
    });
  });
}

run().catch(console.error);
