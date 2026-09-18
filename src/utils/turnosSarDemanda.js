/**
 * Motor Lógico de Turnos SAR, Feriados Oficiales y Análisis de Impacto Hospitalario
 * Implementación canónica conforme a la Lógica Real de Turnos SAR (Reglas 4, 9, 17, 20).
 */

import { CHILE_HOLIDAYS_OFFICIAL } from './helpers';

/**
 * Normaliza cualquier entrada de fecha a formato ISO 'YYYY-MM-DD'
 * @param {string|Date|number} fechaInput
 * @returns {string|null}
 */
export const normalizeDateToIso = (fechaInput) => {
  if (!fechaInput) return null;
  if (fechaInput instanceof Date) {
    if (isNaN(fechaInput.getTime())) return null;
    const y = fechaInput.getFullYear();
    const m = String(fechaInput.getMonth() + 1).padStart(2, '0');
    const d = String(fechaInput.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof fechaInput === 'number') {
    return normalizeDateToIso(new Date(fechaInput));
  }
  if (typeof fechaInput === 'string') {
    const clean = fechaInput.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (clean.includes('-')) {
      const parts = clean.split('T')[0].split(' ')[0].split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }
  return null;
};

/**
 * FASE 1: Evalúa si un día corresponde a Día Hábil o Fin de Semana / Feriado
 * @param {string|Date|number} fecha
 * @param {Object} [pautasDB] - Pauta opcional de Firestore para festivos excepcionales
 * @returns {'HABIL' | 'FINDE_FERIADO'}
 */
export const determinarTipoJornada = (fecha, pautasDB = null) => {
  const iso = normalizeDateToIso(fecha);
  if (!iso) return 'HABIL';

  const [y, m, d] = iso.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d, 12, 0, 0);
  const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 6 = Sábado

  // 1. Fin de semana (Sábado o Domingo)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'FINDE_FERIADO';
  }

  // 2. Feriado oficial de Chile (Matriz 2025-2027)
  if (CHILE_HOLIDAYS_OFFICIAL && CHILE_HOLIDAYS_OFFICIAL.has(iso)) {
    return 'FINDE_FERIADO';
  }

  // 3. Festivo adicional según pauta mensual
  const monthId = `${y}-${String(m).padStart(2, '0')}`;
  if (pautasDB && pautasDB[monthId]?.[iso]?.festivo) {
    return 'FINDE_FERIADO';
  }

  return 'HABIL';
};

/**
 * Normaliza la categoría triaje del paciente en c1, c2, c3, c4, c5
 * @param {Object} p
 * @returns {'c1'|'c2'|'c3'|'c4'|'c5'|'sincat'}
 */
export const extraerCategoriaPaciente = (p) => {
  if (!p) return 'sincat';
  const raw = String(p.cat1Clean || p.categoria || p.cat1 || p.triage || '').toLowerCase().trim();
  if (raw === 'c1' || raw.includes('c1')) return 'c1';
  if (raw === 'c2' || raw.includes('c2')) return 'c2';
  if (raw === 'c3' || raw.includes('c3')) return 'c3';
  if (raw === 'c4' || raw.includes('c4')) return 'c4';
  if (raw === 'c5' || raw.includes('c5')) return 'c5';
  return 'sincat';
};

/**
 * Obtiene el timestamp numérico seguro de tAdmision
 * @param {Object} p
 * @returns {number|null}
 */
export const getTimestampAdmision = (p) => {
  if (!p) return null;
  if (typeof p.tAdmision === 'number' && !isNaN(p.tAdmision)) return p.tAdmision;
  if (p.tAdmision) {
    const t = new Date(p.tAdmision).getTime();
    if (!isNaN(t)) return t;
  }
  return null;
};

/**
 * FASE 1: Agrupa los registros de pacientes según la jornada SAR detectada para una fecha específica:
 * - Jornada Hábil (Lun-Vie): Agrupa en un solo bloque "Turno Hábil Vespertino-Nocturno" (17:00 a 07:59 hrs del día siguiente).
 * - Fin de Semana / Feriado: Agrupa en dos bloques:
 *     1) "Turno Fin de Semana Día" (08:00 a 19:59 hrs).
 *     2) "Turno Fin de Semana Noche" (20:00 a 07:59 hrs del día siguiente).
 *
 * @param {Array} datos - Array de pacientes (pacientesDB o pacientesPool)
 * @param {string|Date} fecha - Fecha de referencia (YYYY-MM-DD)
 * @param {Object} [pautasDB]
 * @returns {Array<Object>} Lista de bloques/turnos SAR consolidados
 */
export const agruparPorTurnoSAR = (datos = [], fecha, pautasDB = null) => {
  const iso = normalizeDateToIso(fecha);
  if (!iso || !datos) return [];

  const tipoJornada = determinarTipoJornada(iso, pautasDB);
  const [y, m, d] = iso.split('-').map(Number);

  // Fecha inicio del turno en timestamp ms
  const fechaStart = new Date(y, m - 1, d, 0, 0, 0).getTime();
  // Siguiente día civil
  const nextDayDate = new Date(y, m - 1, d + 1, 0, 0, 0);
  const nextDayIso = normalizeDateToIso(nextDayDate);

  // Helper para contabilizar métricas de un subconjunto de pacientes
  const consolidarMetricasTurno = (pacs, id, nombre, horario, tipoTurno) => {
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, sincat = 0, altasAdmin = 0;
    let sumEsperaBox = 0, countEsperaBox = 0;

    pacs.forEach(p => {
      const cat = extraerCategoriaPaciente(p);
      if (cat === 'c1') c1++;
      else if (cat === 'c2') c2++;
      else if (cat === 'c3') c3++;
      else if (cat === 'c4') c4++;
      else if (cat === 'c5') c5++;
      else sincat++;

      if (p.estado === 'Cancelada' || p.tipoAlta === 'Alta Administrativa' || p.isAltaAdmin) {
        altasAdmin++;
      }

      // Latencia Box (Triage a Box o Admisión a Box)
      const tAdm = getTimestampAdmision(p);
      const tBox = p.tAnamnesis ? (typeof p.tAnamnesis === 'number' ? p.tAnamnesis : new Date(p.tAnamnesis).getTime()) : null;
      if (tAdm && tBox && tBox >= tAdm) {
        sumEsperaBox += (tBox - tAdm) / 60000;
        countEsperaBox++;
      }
    });

    const esperaPromedio = countEsperaBox > 0 ? Math.round(sumEsperaBox / countEsperaBox) : 0;
    const altaComplejidadCount = c1 + c2 + c3;
    const altaComplejidadPct = pacs.length > 0 ? Number(((altaComplejidadCount / pacs.length) * 100).toFixed(1)) : 0;

    return {
      id,
      nombre,
      horario,
      tipoJornada,
      tipoTurno,
      fechaIso: iso,
      fechaDisplay: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
      totalPacientes: pacs.length,
      c1, c2, c3, c4, c5, sincat,
      altaComplejidadCount,
      altaComplejidadPct,
      altasAdmin,
      esperaPromedio,
      pacientes: pacs
    };
  };

  if (tipoJornada === 'HABIL') {
    // =========================================================================
    // JORNADA HÁBIL: 1 SOLO BLOQUE (17:00 a 07:59 hrs del día siguiente)
    // =========================================================================
    const tStart = new Date(y, m - 1, d, 17, 0, 0).getTime();
    const tEnd = new Date(nextDayDate.getFullYear(), nextDayDate.getMonth(), nextDayDate.getDate(), 8, 0, 0).getTime();

    const pacsTurno = datos.filter(p => {
      const tAdm = getTimestampAdmision(p);
      return tAdm && tAdm >= tStart && tAdm < tEnd;
    });

    return [
      consolidarMetricasTurno(
        pacsTurno,
        `habil_${iso}`,
        'Turno Hábil Vespertino-Nocturno',
        '17:00 a 07:59 hrs (+1d)',
        'HABIL_LARGO'
      )
    ];
  } else {
    // =========================================================================
    // FIN DE SEMANA / FERIADO: 2 BLOQUES INDEPENDIENTES
    // 1) Turno Fin de Semana Día (08:00 a 19:59 hrs)
    // 2) Turno Fin de Semana Noche (20:00 a 07:59 hrs del día siguiente)
    // =========================================================================
    const tDiaStart = new Date(y, m - 1, d, 8, 0, 0).getTime();
    const tDiaEnd = new Date(y, m - 1, d, 20, 0, 0).getTime();

    const tNocheStart = new Date(y, m - 1, d, 20, 0, 0).getTime();
    const tNocheEnd = new Date(nextDayDate.getFullYear(), nextDayDate.getMonth(), nextDayDate.getDate(), 8, 0, 0).getTime();

    const pacsDia = datos.filter(p => {
      const tAdm = getTimestampAdmision(p);
      return tAdm && tAdm >= tDiaStart && tAdm < tDiaEnd;
    });

    const pacsNoche = datos.filter(p => {
      const tAdm = getTimestampAdmision(p);
      return tAdm && tAdm >= tNocheStart && tAdm < tNocheEnd;
    });

    return [
      consolidarMetricasTurno(
        pacsDia,
        `finde_dia_${iso}`,
        'Turno Fin de Semana Día',
        '08:00 a 19:59 hrs',
        'FINDE_DIA'
      ),
      consolidarMetricasTurno(
        pacsNoche,
        `finde_noche_${iso}`,
        'Turno Fin de Semana Noche',
        '20:00 a 07:59 hrs (+1d)',
        'FINDE_NOCHE'
      )
    ];
  }
};

/**
 * FASE 2: Compara los turnos SAR entre un Período Base y un Período Contraste
 * Genera el dataset exacto que alimenta el BarChart de Recharts:
 * 1 o 2 barras consolidadas por día (según tipo de jornada) comparando "Volumen Base" vs "Volumen Contraste".
 *
 * @param {Array} pacientesBase
 * @param {Array} pacientesContraste
 * @param {string} fechaBaseIni
 * @param {string} fechaBaseFin
 * @param {string} fechaContrasteIni
 * @param {string} fechaContrasteFin
 * @param {Object} [pautasDB]
 * @returns {Array<Object>} Dataset para Recharts
 */
export const compararTurnosSARPeriodos = (
  pacientesBase = [],
  pacientesContraste = [],
  fechaBaseIni,
  fechaBaseFin,
  fechaContrasteIni,
  fechaContrasteFin,
  pautasDB = null
) => {
  const bIniIso = normalizeDateToIso(fechaBaseIni);
  const bFinIso = normalizeDateToIso(fechaBaseFin);
  const cIniIso = normalizeDateToIso(fechaContrasteIni);
  const cFinIso = normalizeDateToIso(fechaContrasteFin);

  if (!bIniIso || !bFinIso) return [];

  // Recorrer todos los días del período base
  const [y1, m1, d1] = bIniIso.split('-').map(Number);
  const [y2, m2, d2] = bFinIso.split('-').map(Number);
  const curDate = new Date(y1, m1 - 1, d1);
  const endDate = new Date(y2, m2 - 1, d2);

  // Calcular diferencia de días para mapear el día equivalente en Contraste
  let cStartDate = null;
  if (cIniIso) {
    const [cy1, cm1, cd1] = cIniIso.split('-').map(Number);
    cStartDate = new Date(cy1, cm1 - 1, cd1);
  }

  const resultBars = [];
  let dayIndex = 0;

  while (curDate <= endDate) {
    const curIso = normalizeDateToIso(curDate);
    const turnosBaseDelDia = agruparPorTurnoSAR(pacientesBase, curIso, pautasDB);

    // Determinar la fecha análoga en el período de contraste (offset por día de la serie)
    let curContrasteIso = null;
    if (cStartDate) {
      const cDate = new Date(cStartDate);
      cDate.setDate(cDate.getDate() + dayIndex);
      curContrasteIso = normalizeDateToIso(cDate);
    }

    const turnosContrasteDelDia = curContrasteIso 
      ? agruparPorTurnoSAR(pacientesContraste, curContrasteIso, pautasDB)
      : [];

    turnosBaseDelDia.forEach((tBase, idx) => {
      const tContraste = turnosContrasteDelDia[idx] || null;
      const volBase = tBase.totalPacientes;
      const volContraste = tContraste ? tContraste.totalPacientes : 0;
      const delta = volBase - volContraste;
      const deltaPct = volContraste > 0 ? Number(((delta / volContraste) * 100).toFixed(1)) : 0;

      // Etiqueta legible para Recharts
      const shortName = tBase.tipoTurno === 'HABIL_LARGO' 
        ? `${tBase.fechaDisplay.slice(0, 5)} Hábil`
        : tBase.tipoTurno === 'FINDE_DIA'
        ? `${tBase.fechaDisplay.slice(0, 5)} Día`
        : `${tBase.fechaDisplay.slice(0, 5)} Noche`;

      resultBars.push({
        key: tBase.id,
        nombreTurno: tBase.nombre,
        tipoTurno: tBase.tipoTurno,
        tipoJornada: tBase.tipoJornada,
        horario: tBase.horario,
        fechaDisplay: tBase.fechaDisplay,
        shortName,
        labelCompleta: `${tBase.fechaDisplay} (${tBase.nombre})`,
        volumenBase: volBase,
        volumenContraste: volContraste,
        c1Base: tBase.c1,
        c2Base: tBase.c2,
        c3Base: tBase.c3,
        c4Base: tBase.c4,
        c5Base: tBase.c5,
        esperaBase: tBase.esperaPromedio,
        c1Contraste: tContraste?.c1 || 0,
        c2Contraste: tContraste?.c2 || 0,
        c3Contraste: tContraste?.c3 || 0,
        esperaContraste: tContraste?.esperaPromedio || 0,
        delta,
        deltaPct
      });
    });

    curDate.setDate(curDate.getDate() + 1);
    dayIndex++;
  }

  return resultBars;
};

/**
 * FASE 3: Motor de Análisis de Impacto Externo (Derivación por Hito Hospitalario)
 * Evalúa exactamente 15 días previos y 15 días posteriores a la fecha hito.
 * Filtra exclusivamente categorizaciones de alta complejidad: C1, C2 y C3 (ignora C4 y C5).
 *
 * @param {Array} pacientesPool - Conjunto de pacientes (todos los registros cargados)
 * @param {string|Date} fechaHito - Fecha del hito hospitalario
 * @returns {Object} Estadísticas, deltas y proporciones Pre vs Post hito
 */
export const calcularImpactoHitoHospitalario = (pacientesPool = [], fechaHito) => {
  const hitoIso = normalizeDateToIso(fechaHito);
  if (!hitoIso || !pacientesPool || pacientesPool.length === 0) {
    return {
      fechaHito: hitoIso || '2026-06-15',
      ventanaPre: { inicio: '-', fin: '-', total: 0, c1: 0, c2: 0, c3: 0, altaComplejidad: 0 },
      ventanaPost: { inicio: '-', fin: '-', total: 0, c1: 0, c2: 0, c3: 0, altaComplejidad: 0 },
      deltaAltaComplejidad: 0,
      deltaAltaComplejidadPct: 0,
      donutDataPre: [],
      donutDataPost: [],
      stackedData: []
    };
  }

  const [y, m, d] = hitoIso.split('-').map(Number);
  const hitoDate = new Date(y, m - 1, d, 0, 0, 0);

  // Ventana Pre: 15 días previos (del día -15 al día -1 a las 23:59:59)
  const preStartDate = new Date(hitoDate);
  preStartDate.setDate(preStartDate.getDate() - 15);
  const preEndDate = new Date(hitoDate);
  preEndDate.setDate(preEndDate.getDate() - 1);
  preEndDate.setHours(23, 59, 59, 999);

  // Ventana Post: 15 días desde la fecha hito (del día 0 al día +14 a las 23:59:59)
  const postStartDate = new Date(hitoDate);
  const postEndDate = new Date(hitoDate);
  postEndDate.setDate(postEndDate.getDate() + 14);
  postEndDate.setHours(23, 59, 59, 999);

  const preStartMs = preStartDate.getTime();
  const preEndMs = preEndDate.getTime();
  const postStartMs = postStartDate.getTime();
  const postEndMs = postEndDate.getTime();

  let c1Pre = 0, c2Pre = 0, c3Pre = 0, totalPre = 0;
  let c1Post = 0, c2Post = 0, c3Post = 0, totalPost = 0;

  pacientesPool.forEach(p => {
    const tAdm = getTimestampAdmision(p);
    if (!tAdm) return;

    if (tAdm >= preStartMs && tAdm <= preEndMs) {
      totalPre++;
      const cat = extraerCategoriaPaciente(p);
      if (cat === 'c1') c1Pre++;
      else if (cat === 'c2') c2Pre++;
      else if (cat === 'c3') c3Pre++;
    } else if (tAdm >= postStartMs && tAdm <= postEndMs) {
      totalPost++;
      const cat = extraerCategoriaPaciente(p);
      if (cat === 'c1') c1Post++;
      else if (cat === 'c2') c2Post++;
      else if (cat === 'c3') c3Post++;
    }
  });

  const altaComplejidadPre = c1Pre + c2Pre + c3Pre;
  const altaComplejidadPost = c1Post + c2Post + c3Post;

  // Variación neta y porcentual de alta complejidad
  const deltaAltaComplejidad = altaComplejidadPost - altaComplejidadPre;
  const deltaAltaComplejidadPct = altaComplejidadPre > 0 
    ? Number((((altaComplejidadPost - altaComplejidadPre) / altaComplejidadPre) * 100).toFixed(1))
    : 0;

  // Proporciones relativas exclusivamente de C1, C2 y C3
  const calcPct = (val, total) => (total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0);

  const donutDataPre = [
    { name: 'C1 (Emergencia)', key: 'c1', value: c1Pre, pct: calcPct(c1Pre, altaComplejidadPre), color: '#ef4444' },
    { name: 'C2 (Muy Urgente)', key: 'c2', value: c2Pre, pct: calcPct(c2Pre, altaComplejidadPre), color: '#f97316' },
    { name: 'C3 (Urgente)', key: 'c3', value: c3Pre, pct: calcPct(c3Pre, altaComplejidadPre), color: '#eab308' }
  ];

  const donutDataPost = [
    { name: 'C1 (Emergencia)', key: 'c1', value: c1Post, pct: calcPct(c1Post, altaComplejidadPost), color: '#ef4444' },
    { name: 'C2 (Muy Urgente)', key: 'c2', value: c2Post, pct: calcPct(c2Post, altaComplejidadPost), color: '#f97316' },
    { name: 'C3 (Urgente)', key: 'c3', value: c3Post, pct: calcPct(c3Post, altaComplejidadPost), color: '#eab308' }
  ];

  // Datos para gráfico de barras 100% apiladas
  const stackedData = [
    {
      periodo: 'Pre-Hito (-15d)',
      c1: c1Pre,
      c2: c2Pre,
      c3: c3Pre,
      c1Pct: calcPct(c1Pre, altaComplejidadPre),
      c2Pct: calcPct(c2Pre, altaComplejidadPre),
      c3Pct: calcPct(c3Pre, altaComplejidadPre),
      totalAltaComplejidad: altaComplejidadPre
    },
    {
      periodo: 'Post-Hito (+15d)',
      c1: c1Post,
      c2: c2Post,
      c3: c3Post,
      c1Pct: calcPct(c1Post, altaComplejidadPost),
      c2Pct: calcPct(c2Post, altaComplejidadPost),
      c3Pct: calcPct(c3Post, altaComplejidadPost),
      totalAltaComplejidad: altaComplejidadPost
    }
  ];

  return {
    fechaHito: hitoIso,
    ventanaPre: {
      inicio: normalizeDateToIso(preStartDate),
      fin: normalizeDateToIso(preEndDate),
      total: totalPre,
      c1: c1Pre,
      c2: c2Pre,
      c3: c3Pre,
      altaComplejidad: altaComplejidadPre,
      ratioSeveridadPct: totalPre > 0 ? Number(((altaComplejidadPre / totalPre) * 100).toFixed(1)) : 0
    },
    ventanaPost: {
      inicio: normalizeDateToIso(postStartDate),
      fin: normalizeDateToIso(postEndDate),
      total: totalPost,
      c1: c1Post,
      c2: c2Post,
      c3: c3Post,
      altaComplejidad: altaComplejidadPost,
      ratioSeveridadPct: totalPost > 0 ? Number(((altaComplejidadPost / totalPost) * 100).toFixed(1)) : 0
    },
    deltaAltaComplejidad,
    deltaAltaComplejidadPct,
    donutDataPre,
    donutDataPost,
    stackedData
  };
};
