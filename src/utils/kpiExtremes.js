/**
 * Motor Lógico de Ordenamiento de Extremos de KPIs
 * Función pura utilitaria que evalúa la polaridad institucional de cada indicador sin mutar el estado global
 * ni crear fórmulas nuevas (CANDADO DE DATOS - Data Fetching Rule).
 * 
 * Polaridad canónica:
 * - Mayor es Mejor: Volumen Total Admitido, Tasa Resolutiva, Pacientes C1-C3.
 * - Menor es Mejor: Latencia Admisión-Triaje, Lead Time Global, Tasa de Fuga, Reingreso < 48H.
 */

export const KPI_POLARITY_DEFINITIONS = [
  {
    key: 'volumen',
    name: 'Volumen Total Admitido',
    polarity: 'higher_is_better',
    accessor: (t) => Number(t.stats?.totalPacientes ?? t.stats?.atendidos ?? t.vol ?? 0),
    format: (v) => `${Number(v).toLocaleString('es-CL')} pac.`,
    unit: 'pac.'
  },
  {
    key: 'tasaResolutiva',
    name: 'Tasa Resolutiva',
    polarity: 'higher_is_better',
    accessor: (t) => Number(t.stats?.tasaResolutiva ?? t.resolutiva ?? 0),
    format: (v) => `${Number(v).toFixed(1)}%`,
    unit: '%'
  },
  {
    key: 'pacientesC1C3',
    name: 'Pacientes C1-C3 (Complejidad)',
    polarity: 'higher_is_better',
    accessor: (t) => Number(t.stats?.altaComplejidadVol ?? ((t.stats?.c1 || 0) + (t.stats?.c2 || 0) + (t.stats?.c3 || 0)) ?? 0),
    format: (v) => `${Number(v).toLocaleString('es-CL')} pac.`,
    unit: 'pac.'
  },
  {
    key: 'latenciaTriage',
    name: 'Latencia Admisión-Triaje',
    polarity: 'lower_is_better',
    accessor: (t) => Number(t.stats?.promEsperaTriage ?? t.latencia ?? 0),
    format: (v) => `${Number(v).toFixed(1)} min`,
    unit: 'min'
  },
  {
    key: 'leadTime',
    name: 'Lead Time Global (Estadía)',
    polarity: 'lower_is_better',
    accessor: (t) => Number(t.stats?.promEstadiaTotal ?? t.leadTime ?? 0),
    format: (v) => `${Number(v).toFixed(1)} min`,
    unit: 'min'
  },
  {
    key: 'tasaFuga',
    name: 'Tasa de Fuga',
    polarity: 'lower_is_better',
    accessor: (t) => Number(t.stats?.tasaFuga ?? 0),
    format: (v) => `${Number(v).toFixed(2)}%`,
    unit: '%'
  },
  {
    key: 'tasaReingreso',
    name: 'Reingreso < 48H',
    polarity: 'lower_is_better',
    accessor: (t) => Number(t.stats?.tasaReingreso ?? 0),
    format: (v) => `${Number(v).toFixed(2)}%`,
    unit: '%'
  }
];

/**
 * Función utilitaria pura para identificar el Mejor (#1) y Peor (último) turno por cada métrica.
 * @param {Array} data - Array de turnos con sus métricas procesadas (ej. scorecardRanking)
 * @returns {Object} { [kpiName]: { best: turnoX, worst: turnoY, ... } }
 */
export function getKpiExtremes(data) {
  if (!Array.isArray(data) || data.length === 0) return {};

  const extremes = {};

  for (const def of KPI_POLARITY_DEFINITIONS) {
    const sortedDesc = [...data].sort((a, b) => def.accessor(b) - def.accessor(a));
    const highest = sortedDesc[0];
    const lowest = sortedDesc[sortedDesc.length - 1];

    const bestTurno = def.polarity === 'higher_is_better' ? highest : lowest;
    const worstTurno = def.polarity === 'higher_is_better' ? lowest : highest;

    const bestVal = def.accessor(bestTurno);
    const worstVal = def.accessor(worstTurno);

    extremes[def.key] = {
      kpiKey: def.key,
      kpiName: def.name,
      polarity: def.polarity,
      best: bestTurno,
      worst: worstTurno,
      bestValue: bestVal,
      worstValue: worstVal,
      bestFormatted: def.format(bestVal),
      worstFormatted: def.format(worstVal),
      unit: def.unit
    };
  }

  return extremes;
}
