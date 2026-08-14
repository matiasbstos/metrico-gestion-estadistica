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

// Helper functions directly from useMetricoAnalytics.js
const parseLocalDatetime = (dateStr, hourMinStr = '00:00') => {
  if (!dateStr) return NaN;
  const str = String(dateStr).trim();
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);
  let y, m, d;
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [y, m, d] = parts;
  } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [d, m, y] = parts;
  } else {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    } else return NaN;
  }
  return new Date(y, m - 1, d, h || 0, min || 0, 0).getTime();
};

const getWindowRange = (startDayStr, endDayStr, startHourStr = '00:00', endHourStr = '23:59') => {
  if (!startDayStr || !endDayStr) return null;
  const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
  let tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
  if (isNaN(tStart) || isNaN(tEnd)) return null;
  return { start: tStart, end: tEnd };
};

const isPatientInWindowRange = (tAdmMs, range) => {
  if (!tAdmMs || !range) return false;
  return tAdmMs >= range.start && tAdmMs <= range.end;
};

const isConstatacionLesion = (p) => {
  if (!p) return false;
  if (p.flag_constatacion_z518 !== undefined) return Boolean(p.flag_constatacion_z518);
  if (p.categoria === 'c3_z518') return true;
  const cod = String(p.codigoDiagnostico || p.codigo || '').toUpperCase();
  const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
  return cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC') || diag.includes('LESION');
};

const isAltaAdmin = (p) => {
  if (!p) return false;
  if (p.flag_alta_administrativa !== undefined) return Boolean(p.flag_alta_administrativa);
  if (p.estado === 'Cancelada' || p.destinoAlta === 'ALTA ADMINISTRATIVA' || p.destinoAlta === 'RETIRO SIN ATENCIÓN' || p.destinoAlta === 'RETIRO') return true;
  const med = String(p.medico || p.profesional || p.medico_tratante || '').trim().toUpperCase();
  const invalidMeds = ['NO REGISTRADO', 'NO REGISTRADA', 'SIN ESPECIFICAR', 'SIN REGISTRO', 'NO ASIGNADO', 'S/R', 'NO ESPECIFICADO', 'SIN MEDICO', 'SIN MÉDICO', 'S/M', '-', 'N/A', 'UNDEFINED', 'NULL', ''];
  return p.estado !== 'Finalizada' && invalidMeds.includes(med);
};

const isTraslado = (p) => {
  if (!p) return false;
  if (p.flag_traslado_hospitalario !== undefined) return Boolean(p.flag_traslado_hospitalario);
  const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
  const obs = String(p.observacion || p.obs || '').toUpperCase();
  const cat = String(p.categoria || '').toUpperCase();
  const isTrans = dest.includes('HOSP') || dest.includes('URGENC') || dest.includes('EMERGENC') || dest.includes('UEH') || dest.includes('SAMU') ||
                  obs.includes('HOSP') || obs.includes('URGENC') || obs.includes('EMERGENC') || obs.includes('UEH') || obs.includes('SAMU') ||
                  cat === 'C1';
  const isRoutine = (dest.includes('CONSULTORIO') || dest.includes('CESFAM') || dest.includes('DOMICILIO')) &&
                    !(dest.includes('HOSP') || dest.includes('URGENC') || dest.includes('EMERGENC') || dest.includes('UEH'));
  return isTrans && !isRoutine;
};

const deduplicarPacientes = (pacs) => {
  const map = new Map();
  pacs.forEach(p => {
    const key = p.id || `${p.run || ''}_${p.tAdmision}`;
    if (!map.has(key)) map.set(key, p);
  });
  return Array.from(map.values());
};

async function verifyDashboardData() {
  console.log("Fetching collection from Firestore...");
  const pacientesRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'pacientes_urgencia');
  const turnosRef = collection(db, 'artifacts', appIdVal, 'public', 'data', 'turnos');

  const [pSnap, tSnap] = await Promise.all([getDocs(pacientesRef), getDocs(turnosRef)]);

  const pacientesDB = [];
  pSnap.forEach(doc => pacientesDB.push(doc.data()));
  const turnosDB = [];
  tSnap.forEach(doc => turnosDB.push(doc.data()));

  console.log(`Loaded ${pacientesDB.length} pacientes and ${turnosDB.length} turnos from Firestore.`);

  // Dates in UI: 08/01/2026 12:00 AM to 08/11/2026 11:59 PM (2026-08-01 to 2026-08-11)
  const rangeCurr = getWindowRange('2026-08-01', '2026-08-11', '00:00', '23:59');
  const rangePM = getWindowRange('2026-07-01', '2026-07-11', '00:00', '23:59');
  const rangePY = getWindowRange('2025-08-01', '2025-08-11', '00:00', '23:59');
  const rangeYTD = getWindowRange('2026-01-01', '2026-08-11', '00:00', '23:59');

  const pacsCurr = deduplicarPacientes(pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, rangeCurr)));
  const pacsPM = deduplicarPacientes(pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, rangePM)));
  const pacsPY = deduplicarPacientes(pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, rangePY)));
  const pacsYTD = deduplicarPacientes(pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, rangeYTD)));

  const calcEstadia = (pacs) => {
    let sum = 0, count = 0;
    pacs.forEach(p => { if (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) { sum += (p.tAlta - p.tAdmision)/60000; count++; } });
    return count ? sum / count : 0;
  };

  const getGrowth = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

  // --- PERIODO SELECCIONADO ---
  const currentVol = pacsCurr.length;
  const currentAltas = pacsCurr.filter(isAltaAdmin).length;
  const currentAtendidos = currentVol - currentAltas;
  const currentEstadia = calcEstadia(pacsCurr);
  const currentHours = Math.max(1, (rangeCurr.end - rangeCurr.start + 60000) / 3600000);
  const currentPacHora = currentVol / currentHours;
  const currentTraslados = pacsCurr.filter(isTraslado).length;
  const currentConstataciones = pacsCurr.filter(isConstatacionLesion).length;

  const ageSum = pacsCurr.reduce((acc, p) => (p.edad !== null && !isNaN(p.edad)) ? acc + p.edad : acc, 0);
  const ageCount = pacsCurr.filter(p => p.edad !== null && !isNaN(p.edad)).length;
  const avgEdad = ageCount ? ageSum / ageCount : 0;

  const fonasaCount = pacsCurr.filter(p => String(p.prevision || '').toUpperCase().includes('FONASA')).length;
  const pctFonasa = currentVol ? (fonasaCount / currentVol) * 100 : 0;

  // --- TRIAGE ---
  const cats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };
  pacsCurr.forEach(p => {
    if (isConstatacionLesion(p)) cats.c3_z518++;
    else if (cats[p.categoria] !== undefined) cats[p.categoria]++;
    else cats.sincat++;
  });

  // --- MES ANTERIOR ---
  const pmVol = pacsPM.length;
  const pmAltas = pacsPM.filter(isAltaAdmin).length;
  const pmAtendidos = pmVol - pmAltas;
  const pmEstadia = calcEstadia(pacsPM);
  const pmHours = Math.max(1, (rangePM.end - rangePM.start + 60000) / 3600000);
  const pmPacHora = pmVol / pmHours;
  const pmTraslados = pacsPM.filter(isTraslado).length;
  const pmConstataciones = pacsPM.filter(isConstatacionLesion).length;

  const pmCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };
  pacsPM.forEach(p => {
    if (isConstatacionLesion(p)) pmCats.c3_z518++;
    else if (pmCats[p.categoria] !== undefined) pmCats[p.categoria]++;
  });

  // --- AÑO ANTERIOR ---
  const pyVol = pacsPY.length;
  const pyAltas = pacsPY.filter(isAltaAdmin).length;
  const pyAtendidos = pyVol - pyAltas;
  const pyEstadia = calcEstadia(pacsPY);
  const pyHours = Math.max(1, (rangePY.end - rangePY.start + 60000) / 3600000);
  const pyPacHora = pyVol / pyHours;
  const pyTraslados = pacsPY.filter(isTraslado).length;
  const pyConstataciones = pacsPY.filter(isConstatacionLesion).length;

  const pyCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };
  pacsPY.forEach(p => {
    if (isConstatacionLesion(p)) pyCats.c3_z518++;
    else if (pyCats[p.categoria] !== undefined) pyCats[p.categoria]++;
  });

  // --- YTD GLOBAL ANUAL ---
  const ytdTurnos = turnosDB.filter(t => t.fechaInicio && t.fechaInicio >= '2026-01-01' && t.fechaInicio <= '2026-08-11');
  const ytdPacientesTurnos = ytdTurnos.reduce((acc, t) => acc + (t.totalPacientes || 0), 0);
  const ytdAltasTurnos = ytdTurnos.reduce((acc, t) => acc + (t.altasAdmin || 0), 0);
  const ytdAtendidosTurnos = ytdPacientesTurnos - ytdAltasTurnos;
  const ytdTrasladosTurnos = ytdTurnos.reduce((acc, t) => acc + (t.trasladosCount || 0), 0);
  const ytdConstatacionesTurnos = ytdTurnos.reduce((acc, t) => acc + (t.constatacionesCount || 0), 0);
  const ytdEstadiaPacs = calcEstadia(pacsYTD);
  const ytdHours = Math.max(1, (rangeYTD.end - rangeYTD.start + 60000) / 3600000);
  const ytdPacHora = ytdPacientesTurnos / ytdHours;

  console.log("\n==========================================================================================");
  console.log("📊 RESULTADOS VERIFICACIÓN DE DATOS (01/08/2026 - 11/08/2026)");
  console.log("==========================================================================================\n");

  const printCompare = (label, calcVal, uiVal, unit = '') => {
    const diff = Math.abs(Number(calcVal) - Number(uiVal));
    const match = diff < 0.15 ? "✅ COINCIDE" : "❌ DISCREPANCIA";
    console.log(`${label.padEnd(35)} | Calculado: ${String(calcVal).padStart(8)} ${unit} | UI Screenshot: ${String(uiVal).padStart(8)} ${unit} | ${match}`);
  };

  console.log("--- 1. GLOBAL ANUAL (YTD 2026) ---");
  printCompare("Pac. Admitidos (Total)", ytdPacientesTurnos, 24640);
  printCompare("Pac. Atendidos (Total)", ytdAtendidosTurnos, 22514);
  printCompare("Rendimiento Global (pac/h)", ytdPacHora.toFixed(1), 4.6);
  printCompare("Estadía Promedio Global (min)", Math.round(ytdEstadiaPacs), 133);
  printCompare("Altas Admin YTD", ytdAltasTurnos, 2126);
  printCompare("Traslados Hosp YTD", ytdTrasladosTurnos, 896);
  printCompare("Constat. Lesiones YTD", ytdConstatacionesTurnos, 276);

  console.log("\n--- 2. PERIODO SELECCIONADO (01/08/2026 - 11/08/2026) ---");
  printCompare("Pac. Admitidos", currentVol, 1151);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(currentVol, pmVol).toFixed(1), 4.4, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(currentVol, pyVol).toFixed(1), -6.2, '%');

  printCompare("Pac. Atendidos", currentAtendidos, 1070);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(currentAtendidos, pmAtendidos).toFixed(1), 7.8, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(currentAtendidos, pyAtendidos).toFixed(1), -4.4, '%');

  printCompare("Pac / Hora", currentPacHora.toFixed(1), 4.4);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(currentPacHora, pmPacHora).toFixed(1), 4.4, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(currentPacHora, pyPacHora).toFixed(1), -6.2, '%');

  printCompare("Prom. Estadía (min)", Math.round(currentEstadia), 111);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(currentEstadia, pmEstadia).toFixed(1), -19.1, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(currentEstadia, pyEstadia).toFixed(1), -14.3, '%');

  printCompare("Altas Admin", currentAltas, 81);
  printCompare("  -> Pct de Admitidos", ((currentAltas / currentVol) * 100).toFixed(1), 7.0, '%');
  printCompare("  -> Vs Mes Ant (%)", getGrowth(currentAltas, pmAltas).toFixed(1), -25.7, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(currentAltas, pyAltas).toFixed(1), -25.0, '%');

  printCompare("Traslados Hosp", currentTraslados, 43);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(currentTraslados, pmTraslados).toFixed(1), 48.5, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(currentTraslados, pyTraslados).toFixed(1), 2.4, '%');

  printCompare("Constat. Lesiones", currentConstataciones, 1);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(currentConstataciones, pmConstataciones).toFixed(1), 0.0, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(currentConstataciones, pyConstataciones).toFixed(1), -93.3, '%');

  printCompare("Promedio Edad (años)", avgEdad.toFixed(1), 33.6);
  printCompare("Pac. FONASA (%)", pctFonasa.toFixed(1), 93.1, '%');

  console.log("\n--- 3. DISTRIBUCIÓN DE TRIAGE ---");
  printCompare("C1", cats.c1, 1);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(cats.c1, pmCats.c1).toFixed(1), 100.0, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(cats.c1, pyCats.c1).toFixed(1), 100.0, '%');

  printCompare("C2", cats.c2, 8);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(cats.c2, pmCats.c2).toFixed(1), 60.0, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(cats.c2, pyCats.c2).toFixed(1), 300.0, '%');

  printCompare("C3", cats.c3, 101);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(cats.c3, pmCats.c3).toFixed(1), 5.1, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(cats.c3, pyCats.c3).toFixed(1), 173.0, '%');

  printCompare("C3 (L) [Constataciones]", cats.c3_z518, 1);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(cats.c3_z518, pmCats.c3_z518).toFixed(1), 0.0, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(cats.c3_z518, pyCats.c3_z518).toFixed(1), -93.3, '%');

  printCompare("C4", cats.c4, 430);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(cats.c4, pmCats.c4).toFixed(1), 7.2, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(cats.c4, pyCats.c4).toFixed(1), 74.0, '%');

  printCompare("C5", cats.c5, 584);
  printCompare("  -> Vs Mes Ant (%)", getGrowth(cats.c5, pmCats.c5).toFixed(1), 3.2, '%');
  printCompare("  -> Vs Año Ant (%)", getGrowth(cats.c5, pyCats.c5).toFixed(1), 34.6, '%');

  const sumTriage = cats.c1 + cats.c2 + cats.c3 + cats.c3_z518 + cats.c4 + cats.c5;
  console.log(`\nSuma de categorías Triage (C1 + C2 + C3 + C3(L) + C4 + C5): ${sumTriage}`);
  console.log(`Pacientes sin categoría (sincat): ${cats.sincat}`);
  console.log(`Total Admitidos: ${currentVol}`);
}

verifyDashboardData().catch(console.error);
