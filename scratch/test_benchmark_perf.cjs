// Benchmark test for useMetricoAnalytics logic
const createMockData = () => {
  const pacs = [];
  const startMs = new Date('2026-01-01T00:00:00').getTime();
  const endMs = new Date('2026-08-16T23:59:59').getTime();
  
  for (let i = 0; i < 25223; i++) {
    const tAdm = startMs + Math.random() * (endMs - startMs);
    const loteNum = Math.floor((tAdm - startMs) / (12 * 3600 * 1000));
    pacs.push({
      id: `p_${i}`,
      tAdmision: tAdm,
      loteId: `lote_${loteNum}`,
      categoria: ['c1', 'c2', 'c3', 'c4', 'c5'][i % 5],
      sexo: i % 2 === 0 ? 'M' : 'F',
      edad: 20 + (i % 60),
      prevision: 'FONASA B',
      establecimiento: 'CESFAM CENTRAL',
      tCat1: tAdm + 10 * 60000,
      tCatUlt: tAdm + 15 * 60000,
      tAnamnesis: tAdm + 30 * 60000,
      tAlta: tAdm + 90 * 60000,
      medico: `Dr. Medico_${i % 25}`
    });
  }

  const turnos = [];
  for (let i = 0; i < 350; i++) {
    const d = new Date(startMs + i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    turnos.push({
      id: `t_${i}`,
      loteId: `lote_${i * 2}`,
      fechaInicio: dateStr,
      fechaFin: dateStr,
      horario: 'Largo 17:00 a 08:00',
      totalPacientes: 70,
      altasAdmin: 5
    });
  }

  return { pacs, turnos };
};

console.log("Generating 25,223 pacs and 350 turnos...");
const { pacs, turnos } = createMockData();

// Test optimized indexing
console.time("Optimized Turno Linking & Aggregation");
const pacsByLoteId = new Map();
const pacsByDateStr = new Map();

pacs.forEach(p => {
  if (p.loteId) {
    let arr = pacsByLoteId.get(p.loteId);
    if (!arr) { arr = []; pacsByLoteId.set(p.loteId, arr); }
    arr.push(p);
  }
});

const resultTurnos = turnos.map(t => {
  const pList = pacsByLoteId.get(t.loteId) || [];
  return { ...t, count: pList.length };
});
console.timeEnd("Optimized Turno Linking & Aggregation");
console.log(`Linked ${resultTurnos.length} turnos, sample count: ${resultTurnos[0].count}`);
