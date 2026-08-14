const https = require('https');

const appId = 'urgencias-dashboard';

// Proporción diaria oficial para los 31 días de Mayo 2026 (Total: 4110 pac, 434 altas)
// Promedio diario ~132.5 pac/día
const totalMayoTarget = 4110;
const totalAltasTarget = 434;
const totalAtendidosTarget = 3676;

console.log(`=== PLAN DE BENCHMARK OFICIAL DE CONTROL (MAYO 2026) ===`);
console.log(`Establecimiento: SAR Elsa Romo Aravena (Melipilla)`);
console.log(`Rango: 01-05-2026 00:00 al 31-05-2026 23:59`);
console.log(`Completados: ${totalAtendidosTarget} pac.`);
console.log(`Alta sin Atención Médica: 93 pac.`);
console.log(`Egreso Administrativo: 341 pac.`);
console.log(`Altas Admin Totales: ${totalAltasTarget} altas (${((totalAltasTarget/totalMayoTarget)*100).toFixed(2)}%)`);
console.log(`Total Pacientes Admitidos: ${totalMayoTarget} pac.`);
