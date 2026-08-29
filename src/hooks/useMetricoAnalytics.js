import { useMemo } from 'react';
import { formatLocalDate, deduplicarPacientes } from '../utils/helpers';

const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;

const parseLocalDatetime = (dateStr, hourMinStr = '00:00') => {
  if (!dateStr) return NaN;
  const str = String(dateStr).trim();
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);

  let y, m, d;

  // Formato ISO: YYYY-MM-DD o YYYY/MM/DD (proveniente de HTML <input type="date">)
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    [y, m, d] = parts;
  }
  // Formato con 4 dígitos al final: DD-MM-YYYY o MM-DD-YYYY
  else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const parts = str.split(/[-/]/).map(Number);
    const p1 = parts[0];
    const p2 = parts[1];
    y = parts[2];

    if (p1 <= 12 && p2 > 12) {
      // p2 > 12 indica que p2 es el día y p1 es el mes (MM/DD/YYYY)
      m = p1;
      d = p2;
    } else {
      // Estándar Chileno: p1 es Día, p2 es Mes (DD/MM/YYYY)
      d = p1;
      m = p2;
    }
  } else {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
    } else {
      return NaN;
    }
  }

  const resultDate = new Date(y, m - 1, d, h || 0, min || 0, 0);
  return resultDate.getTime();
};

export const getWindowRange = (startDayStr, endDayStr, startHourStr = '00:00', endHourStr = '23:59') => {
  if (!startDayStr || !endDayStr) return null;
  const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
  let tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
  if (isNaN(tStart) || isNaN(tEnd)) return null;

  if (startHourStr && endHourStr && startHourStr > endHourStr && startDayStr === endDayStr) {
    const endPlusOne = new Date(tEnd);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    tEnd = endPlusOne.getTime();
  }

  return { start: tStart, end: tEnd };
};

export const isPatientInWindowRange = (tAdmMs, range) => {
  if (!tAdmMs || !range) return false;
  return tAdmMs >= range.start && tAdmMs <= range.end;
};

const isPatientInWindow = (tAdmMs, startDayStr, endDayStr, startHourStr, endHourStr) => {
  const range = getWindowRange(startDayStr, endDayStr, startHourStr, endHourStr);
  return isPatientInWindowRange(tAdmMs, range);
};

export const isConstatacionLesion = (p) => {
  if (!p) return false;
  if (p.flag_constatacion_z518 !== undefined && p.flag_constatacion_z518 !== null) {
    if (Boolean(p.flag_constatacion_z518)) return true;
  }
  const cat = String(p.categoria || p.categoria_triage || '').toLowerCase();
  if (cat === 'c3_z518') return true;
  const cod = String(p.codigoDiagnostico || p.codigo_diagnostico_cie10 || p.codigo || '').toUpperCase();
  const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
  const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
  const obs = String(p.observacion || p.obs || '').toUpperCase();

  if (cod.includes('Z51.8') || cod.includes('Z518') || cod.includes('Z04') || cod.includes('Z65') || cod.includes('Z02.7')) return true;
  if (diag.includes('CONSTATAC') || diag.includes('CIRCUNSTANCIAS LEGALES') || diag.includes('LEGAL')) return true;

  const keywordsPolice = ['CARABINERO', 'PDI', 'COMISARIA', 'COMISARÍA', 'POLICIA', 'POLICÍA', 'POLICIAL', 'DETENIDO', 'CUSTODIA', 'FISCALIA', 'FISCALÍA'];
  if (keywordsPolice.some(k => dest.includes(k) || obs.includes(k))) return true;

  return false;
};

export const isAltaAdmin = (p) => {
  if (!p) return false;
  if (p.flag_alta_administrativa !== undefined) return Boolean(p.flag_alta_administrativa);
  if (p.estado === 'Cancelada' || p.destinoAlta === 'ALTA ADMINISTRATIVA' || p.destinoAlta === 'RETIRO SIN ATENCIÓN' || p.destinoAlta === 'RETIRO') return true;
  const med = String(p.medico || p.profesional || p.medico_tratante || '').trim().toUpperCase();
  const invalidMeds = ['NO REGISTRADO', 'NO REGISTRADA', 'SIN ESPECIFICAR', 'SIN REGISTRO', 'NO ASIGNADO', 'S/R', 'NO ESPECIFICADO', 'SIN MEDICO', 'SIN MÉDICO', 'S/M', '-', 'N/A', 'UNDEFINED', 'NULL', ''];
  return p.estado !== 'Finalizada' && invalidMeds.includes(med);
};

export const isTraslado = (p) => {
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

export const isFractura = (p) => {
  if (!p) return false;
  if (p.flag_fractura !== undefined) return Boolean(p.flag_fractura);
  const cod = String(p.codigoDiagnostico || p.codigo || '').toUpperCase();
  const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
  return /^(S02|S12|S22|S32|S42|S52|S62|S72|S82|S92|T02|T08|T10|T12)/.test(cod) ||
         /FRACTURA|\bFX\b|TRAUMATISM/.test(diag);
};

export const normalizeCategoria = (p) => {
  if (!p) return 'sincat';
  if (isConstatacionLesion(p)) return 'c3_z518';
  
  const raw = String(
    p.categoria || 
    p.catUlt || 
    p.catUltima || 
    p.cat1 || 
    p.catPrimera || 
    p.categoria_triage || 
    p.triage || 
    p.categoriaFinal || 
    ''
  ).toLowerCase().trim();

  if (raw === 'c1' || raw === '1' || raw.startsWith('c1') || raw.includes('c1') || raw.includes('cat 1') || raw.includes('categoría 1') || raw.includes('categoria 1') || raw.includes('reanimac') || raw.includes('vital') || raw.includes('grave')) return 'c1';
  if (raw === 'c2' || raw === '2' || raw.startsWith('c2') || raw.includes('c2') || raw.includes('cat 2') || raw.includes('categoría 2') || raw.includes('categoria 2') || raw.includes('emergenc')) return 'c2';
  if (raw === 'c3_z518' || raw.includes('z518') || raw.includes('z51.8') || raw.includes('lesion') || raw.includes('lesión') || raw.includes('constat')) return 'c3_z518';
  if (raw === 'c3' || raw === '3' || raw.startsWith('c3') || raw.includes('c3') || raw.includes('cat 3') || raw.includes('categoría 3') || raw.includes('categoria 3')) return 'c3';
  if (raw === 'c4' || raw === '4' || raw.startsWith('c4') || raw.includes('c4') || raw.includes('cat 4') || raw.includes('categoría 4') || raw.includes('categoria 4') || raw.includes('no urg') || raw.includes('leve')) return 'c4';
  if (raw === 'c5' || raw === '5' || raw.startsWith('c5') || raw.includes('c5') || raw.includes('cat 5') || raw.includes('categoría 5') || raw.includes('categoria 5') || raw.includes('consulta') || raw.includes('general')) return 'c5';
  
  return 'sincat';
};

const isShiftInWindowRange = (t, windowRange) => {
  if (!t || !windowRange) return true;
  const startDay = t.fechaInicio;
  const endDay = t.fechaFin || t.fechaInicio;
  const horarioStr = String(t.horario || '').toLowerCase();
  let startH = '00:00', endH = '23:59';
  let spansMidnight = false;

  if (horarioStr.includes('16:00') || horarioStr.includes('17:00') || horarioStr.includes('largo')) {
    startH = '16:00'; endH = '09:00'; spansMidnight = true;
  } else if (horarioStr.includes('20:00') || horarioStr.includes('noche')) {
    startH = '20:00'; endH = '08:00'; spansMidnight = true;
  } else if (horarioStr.includes('08:00') || horarioStr.includes('dia') || horarioStr.includes('día')) {
    startH = '08:00'; endH = '20:00'; spansMidnight = false;
  }

  const tStart = parseLocalDatetime(startDay, startH);
  let tEnd = parseLocalDatetime(endDay, endH);
  if (isNaN(tStart) || isNaN(tEnd)) return true;

  if (spansMidnight && startDay === endDay) {
    tEnd += 24 * 3600 * 1000;
  }

  return tStart < windowRange.end && tEnd > windowRange.start;
};

export const useMetricoAnalytics = (pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin, filtrosGlobales = {}, tipoCorte = 'turno', filtroHoraInicio = '00:00', filtroHoraFin = '23:59') => {
  // =========================================================================
  // 1. PIPELINE DE DATOS GLOBAL (Afecta KPIs, Triaje, Tabla Global)
  // =========================================================================
  const windowRange = useMemo(() => {
    return getWindowRange(filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin);
  }, [filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin]);

  const turnosPorFecha = useMemo(() => {
    return turnosDB.filter(t => {
      if (!windowRange) return true;
      return isShiftInWindowRange(t, windowRange);
    });
  }, [turnosDB, windowRange]);

  const hasGlobalFilters = useMemo(() => {
    return Object.values(filtrosGlobales).some(val => val !== '' && val !== 'TODOS');
  }, [filtrosGlobales]);

  const pacientesFiltrados = useMemo(() => {
    if (!windowRange) return [];
    let pacs = pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, windowRange));

    if (hasGlobalFilters) {
      if (filtrosGlobales.sexo && filtrosGlobales.sexo !== 'TODOS') {
        pacs = pacs.filter(p => String(p.sexo).toUpperCase().includes(filtrosGlobales.sexo === 'M' ? 'M' : 'F'));
      }
      if (filtrosGlobales.prevision && filtrosGlobales.prevision !== 'TODOS') {
        pacs = pacs.filter(p => String(p.prevision).toUpperCase().includes(filtrosGlobales.prevision));
      }
      if (filtrosGlobales.edad && filtrosGlobales.edad !== 'TODOS') {
        pacs = pacs.filter(p => {
          if (p.edad === null || p.edad === undefined) return false;
          if (filtrosGlobales.edad === '0-14') return p.edad <= 14;
          if (filtrosGlobales.edad === '15-29') return p.edad >= 15 && p.edad <= 29;
          if (filtrosGlobales.edad === '30-59') return p.edad >= 30 && p.edad <= 59;
          if (filtrosGlobales.edad === '60+') return p.edad >= 60;
          return true;
        });
      }
      if (filtrosGlobales.establecimiento && filtrosGlobales.establecimiento !== 'TODOS') {
        if (filtrosGlobales.establecimiento === 'OTROS') {
          pacs = pacs.filter(p => p.establecimiento && !String(p.establecimiento).toUpperCase().match(/FLORENCIA|BORIS|ELGUETA/));
        } else {
          pacs = pacs.filter(p => String(p.establecimiento).toUpperCase().includes(filtrosGlobales.establecimiento));
        }
      }
    }
    return deduplicarPacientes(pacs);
  }, [pacientesDB, windowRange, filtrosGlobales, hasGlobalFilters]);

  const turnosFiltrados = useMemo(() => {
    if (!turnosPorFecha || turnosPorFecha.length === 0) return [];
    if (!pacientesFiltrados || pacientesFiltrados.length === 0) {
      return turnosPorFecha.map(t => ({
        ...t,
        totalPacientes: Number(t.totalPacientes || 0),
        altasAdmin: Number(t.altasAdmin || 0),
        c1: Number(t.c1 || 0),
        c2: Number(t.c2 || 0),
        c3: Number(t.c3 || 0),
        c3_z518: Number(t.c3_z518 || 0),
        c4: Number(t.c4 || 0),
        c5: Number(t.c5 || 0),
        tiempoAdmCat: Number(t.tiempoAdmCat || 0),
        tiempoCatAna: Number(t.tiempoCatAna || 0),
        tiempoAnaAlt: Number(t.tiempoAnaAlt || 0),
        tiempoAdmAlt: Number(t.tiempoAdmAlt || 0),
        pacientesList: []
      }));
    }

    // 1. Indexación O(N) instantánea por Lote y por Fecha
    const pacsByLoteId = new Map();
    const pacsByDateStr = new Map();

    pacientesFiltrados.forEach(p => {
      if (p.loteId) {
        let arr = pacsByLoteId.get(p.loteId);
        if (!arr) {
          arr = [];
          pacsByLoteId.set(p.loteId, arr);
        }
        arr.push(p);
      }
      if (p.tAdmision) {
        const dStr = formatLocalDate(p.tAdmision);
        if (dStr) {
          let arr = pacsByDateStr.get(dStr);
          if (!arr) {
            arr = [];
            pacsByDateStr.set(dStr, arr);
          }
          arr.push(p);
        }
      }
    });

    return turnosPorFecha.map(t => {
      const startDay = t.fechaInicio;
      const endDay = t.fechaFin || t.fechaInicio;
      const horarioStr = String(t.horario || '').toLowerCase();
      let startH = '00:00', endH = '23:59';
      let spansMidnight = false;

      if (horarioStr.includes('16:00') || horarioStr.includes('17:00') || horarioStr.includes('largo')) {
        startH = '16:00'; endH = '09:00'; spansMidnight = true;
      } else if (horarioStr.includes('20:00') || horarioStr.includes('noche')) {
        startH = '20:00'; endH = '08:00'; spansMidnight = true;
      } else if (horarioStr.includes('08:00') || horarioStr.includes('dia') || horarioStr.includes('día')) {
        startH = '08:00'; endH = '20:00'; spansMidnight = false;
      }

      const tStart = parseLocalDatetime(startDay, startH);
      let tEnd = parseLocalDatetime(endDay, endH);
      if (spansMidnight && startDay === endDay) {
        tEnd += 24 * 3600 * 1000;
      }

      let pacs = null;
      if (t.loteId && pacsByLoteId.has(t.loteId)) {
        pacs = pacsByLoteId.get(t.loteId);
      }
      if (!pacs && t.fechaInicio && pacsByDateStr.has(t.fechaInicio) && !spansMidnight) {
        pacs = pacsByDateStr.get(t.fechaInicio);
      }
      if (!pacs && !isNaN(tStart) && !isNaN(tEnd)) {
        pacs = pacientesFiltrados.filter(p => p.tAdmision && p.tAdmision >= tStart && p.tAdmision < tEnd);
      }
      if (!pacs) {
        pacs = [];
      }

      const pacsCount = pacs.length;
      let altasCount = 0;
      const counts = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };
      let sumAdmCat = 0, countAdmCat = 0;
      let sumCatAna = 0, countCatAna = 0;
      let sumAnaAlt = 0, countAnaAlt = 0;
      let sumAdmAlt = 0, countAdmAlt = 0;

      if (pacsCount > 0) {
        pacs.forEach(p => {
          if (p.estado === 'Cancelada' || isAltaAdmin(p)) altasCount++;
          const cat = normalizeCategoria(p);
          if (counts[cat] !== undefined) {
            counts[cat]++;
          }

          const tAdm = p.tAdmision;
          const tC1 = p.tCat1;
          const tCU = p.tCatUlt;
          const tAn = p.tAnamnesis;
          const tAl = p.tAlta;

          if (tAdm && tC1 && tC1 >= tAdm) {
            sumAdmCat += (tC1 - tAdm) / 60000;
            countAdmCat++;
          }
          if (tCU && tAn && tAn >= tCU) {
            sumCatAna += (tAn - tCU) / 60000;
            countCatAna++;
          }
          if (tAn && tAl && tAl >= tAn) {
            sumAnaAlt += (tAl - tAn) / 60000;
            countAnaAlt++;
          }
          if (tAdm && tAl && tAl >= tAdm) {
            sumAdmAlt += (tAl - tAdm) / 60000;
            countAdmAlt++;
          }
        });
      }

      const tiempoAdmCat = countAdmCat > 0 ? Number((sumAdmCat / countAdmCat).toFixed(2)) : (Number(t.tiempoAdmCat) || 0);
      const tiempoCatAna = countCatAna > 0 ? Number((sumCatAna / countCatAna).toFixed(2)) : (Number(t.tiempoCatAna) || 0);
      const tiempoAnaAlt = countAnaAlt > 0 ? Number((sumAnaAlt / countAnaAlt).toFixed(2)) : (Number(t.tiempoAnaAlt) || 0);
      const tiempoAdmAlt = countAdmAlt > 0 ? Number((sumAdmAlt / countAdmAlt).toFixed(2)) : (Number(t.tiempoAdmAlt) || 0);

      return {
        ...t,
        totalPacientes: pacsCount > 0 ? pacsCount : Number(t.totalPacientes || 0),
        altasAdmin: pacsCount > 0 ? altasCount : Number(t.altasAdmin || 0),
        c1: counts.c1 || Number(t.c1 || 0),
        c2: counts.c2 || Number(t.c2 || 0),
        c3: counts.c3 || Number(t.c3 || 0),
        c3_z518: counts.c3_z518 || Number(t.c3_z518 || 0),
        c4: counts.c4 || Number(t.c4 || 0),
        c5: counts.c5 || Number(t.c5 || 0),
        tiempoAdmCat,
        tiempoCatAna,
        tiempoAnaAlt,
        tiempoAdmAlt,
        pacientesList: pacs
      };
    });
  }, [turnosPorFecha, pacientesFiltrados]);

  // === ANÁLISIS DEMOGRÁFICO Y GLOBAL ===
  const demografiaStats = useMemo(() => {
    const stats = {
      total: 0, edadSum: 0, edadCount: 0, sexo: { F: 0, M: 0, O: 0 },
      edades: Object.fromEntries(AGE_RANGES.map(r => [r, 0])),
      edadesSexo: {
        F: Object.fromEntries(AGE_RANGES.map(r => [r, 0])),
        M: Object.fromEntries(AGE_RANGES.map(r => [r, 0]))
      },
      prevs: {}, comunas: {}, nacionalidades: {}, establecimientos: {}
    };

    pacientesFiltrados.forEach(p => {
      stats.total++;
      
      const s = String(p.sexo || '').toUpperCase();
      let isFemale = false;
      let isMale = false;
      if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') {
        stats.sexo.F++;
        isFemale = true;
      } else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') {
        stats.sexo.M++;
        isMale = true;
      } else {
        stats.sexo.O++;
      }

      if (p.edad !== null && !isNaN(p.edad)) {
         stats.edadSum += p.edad; stats.edadCount++;
         let range = '';
         if (p.edad >= 80) range = '80+';
         else {
           const lower = Math.floor(p.edad / 5) * 5;
           range = `${lower}-${lower + 4}`;
         }
         
         if (stats.edades[range] !== undefined) {
           stats.edades[range]++;
           if (isFemale) stats.edadesSexo.F[range]++;
           else if (isMale) stats.edadesSexo.M[range]++;
         }
      }
      
      const prRaw = String(p.prevision || 'DESCONOCIDO').trim().toUpperCase();
      let prKey = prRaw;
      if (prRaw.includes('FONASA')) {
        if (prRaw.includes('A')) prKey = 'FONASA A'; else if (prRaw.includes('B')) prKey = 'FONASA B';
        else if (prRaw.includes('C')) prKey = 'FONASA C'; else if (prRaw.includes('D')) prKey = 'FONASA D';
        else prKey = 'FONASA (OTRO)';
      } else if (prRaw.includes('ISAPRE')) prKey = 'ISAPRE';
      else if (prRaw.includes('DIPRECA')) prKey = 'DIPRECA';
      else if (prRaw.includes('CAPREDENA')) prKey = 'CAPREDENA';
      else if (prRaw === '' || prRaw === 'UNDEFINED') prKey = 'DESCONOCIDO';
      
      stats.prevs[prKey] = (stats.prevs[prKey] || 0) + 1;

      const com = String(p.comuna || 'DESCONOCIDA').toUpperCase();
      if(com && com !== 'UNDEFINED' && com !== '') stats.comunas[com] = (stats.comunas[com] || 0) + 1;

      const nac = String(p.nacionalidad || 'DESCONOCIDA').toUpperCase();
      if(nac && nac !== 'UNDEFINED' && nac !== '') stats.nacionalidades[nac] = (stats.nacionalidades[nac] || 0) + 1;

      const est = String(p.establecimiento || 'DESCONOCIDO').toUpperCase();
      if(est && est !== 'UNDEFINED' && est !== '') stats.establecimientos[est] = (stats.establecimientos[est] || 0) + 1;
    });

    return stats;
  }, [pacientesFiltrados]);

  const promediosGlobales = useMemo(() => {
    let sAdmCat=0, cAdmCat=0, sCatAna=0, cCatAna=0, sAnaAlt=0, cAnaAlt=0, sAdmAlt=0, cAdmAlt=0;
    pacientesFiltrados.forEach(p => {
      const tAdm = p.tAdmision;
      const tC1 = p.tCat1;
      const tCU = p.tCatUlt;
      const tAn = p.tAnamnesis;
      const tAl = p.tAlta;
      if (tAdm && tC1 && tC1 >= tAdm) { sAdmCat += (tC1 - tAdm)/60000; cAdmCat++; }
      if (tCU && tAn && tAn >= tCU) { sCatAna += (tAn - tCU)/60000; cCatAna++; }
      if (tAn && tAl && tAl >= tAn) { sAnaAlt += (tAl - tAn)/60000; cAnaAlt++; }
      if (tAdm && tAl && tAl >= tAdm) { sAdmAlt += (tAl - tAdm)/60000; cAdmAlt++; }
    });
    return {
      avgAdmCat: cAdmCat ? sAdmCat / cAdmCat : null, 
      avgCatAna: cCatAna ? sCatAna / cCatAna : null, 
      avgAnaAlt: cAnaAlt ? sAnaAlt / cAnaAlt : null,
      avgAdmAlt: cAdmAlt ? sAdmAlt / cAdmAlt : null, 
      totalPacientes: pacientesFiltrados.length
    };
  }, [pacientesFiltrados]);

  const metricsByCategory = useMemo(() => {
    const res = {
      c1: { total: 0, sAdmCat: 0, cAdmCat: 0, sCatAna: 0, cCatAna: 0, sAnaAlt: 0, cAnaAlt: 0, sAdmAlt: 0, cAdmAlt: 0 },
      c2: { total: 0, sAdmCat: 0, cAdmCat: 0, sCatAna: 0, cCatAna: 0, sAnaAlt: 0, cAnaAlt: 0, sAdmAlt: 0, cAdmAlt: 0 },
      c3: { total: 0, sAdmCat: 0, cAdmCat: 0, sCatAna: 0, cCatAna: 0, sAnaAlt: 0, cAnaAlt: 0, sAdmAlt: 0, cAdmAlt: 0 },
      c3_z518: { total: 0, sAdmCat: 0, cAdmCat: 0, sCatAna: 0, cCatAna: 0, sAnaAlt: 0, cAnaAlt: 0, sAdmAlt: 0, cAdmAlt: 0 },
      c4: { total: 0, sAdmCat: 0, cAdmCat: 0, sCatAna: 0, cCatAna: 0, sAnaAlt: 0, cAnaAlt: 0, sAdmAlt: 0, cAdmAlt: 0 },
      c5: { total: 0, sAdmCat: 0, cAdmCat: 0, sCatAna: 0, cCatAna: 0, sAnaAlt: 0, cAnaAlt: 0, sAdmAlt: 0, cAdmAlt: 0 },
      sincat: { total: 0, sAdmCat: 0, cAdmCat: 0, sCatAna: 0, cCatAna: 0, sAnaAlt: 0, cAnaAlt: 0, sAdmAlt: 0, cAdmAlt: 0 }
    };

    pacientesFiltrados.forEach(p => {
      const cat = normalizeCategoria(p);
      const target = res[cat] || res.sincat;
      target.total++;

      const tAdm = p.tAdmision;
      const tC1 = p.tCat1;
      const tCU = p.tCatUlt;
      const tAn = p.tAnamnesis;
      const tAl = p.tAlta;

      if (tAdm && tC1 && tC1 >= tAdm) { target.sAdmCat += (tC1 - tAdm) / 60000; target.cAdmCat++; }
      if (tCU && tAn && tAn >= tCU) { target.sCatAna += (tAn - tCU) / 60000; target.cCatAna++; }
      if (tAn && tAl && tAl >= tAn) { target.sAnaAlt += (tAl - tAn) / 60000; target.cAnaAlt++; }
      if (tAdm && tAl && tAl >= tAdm) { target.sAdmAlt += (tAl - tAdm) / 60000; target.cAdmAlt++; }
    });

    const finalRes = {};
    Object.keys(res).forEach(k => {
      const d = res[k];
      finalRes[k] = {
        total: d.total,
        avgAdmCat: d.cAdmCat ? d.sAdmCat / d.cAdmCat : null,
        avgCatAna: d.cCatAna ? d.sCatAna / d.cCatAna : null,
        avgAnaAlt: d.cAnaAlt ? d.sAnaAlt / d.cAnaAlt : null,
        avgAdmAlt: d.cAdmAlt ? d.sAdmAlt / d.cAdmAlt : null
      };
    });
    return finalRes;
  }, [pacientesFiltrados]);

  const statsKPI = useMemo(() => {
    if (!filtroFechaInicio || !filtroFechaFin) return null;
    const fInit = new Date(filtroFechaInicio); const fEnd = new Date(filtroFechaFin);
    if (isNaN(fInit.getTime()) || isNaN(fEnd.getTime())) return null;

    const daysDiff = Math.max(1, (fEnd - fInit) / (1000 * 60 * 60 * 24));
    // Periodos anteriores (Mes y Año)
    const pmInitStr = new Date(fInit.getFullYear(), fInit.getMonth() - 1, fInit.getDate()).toISOString().split('T')[0];
    const pmEndStr = new Date(fEnd.getFullYear(), fEnd.getMonth() - 1, fEnd.getDate()).toISOString().split('T')[0];
    const pyInitStr = new Date(fInit.getFullYear() - 1, fInit.getMonth(), fInit.getDate()).toISOString().split('T')[0];
    const pyEndStr = new Date(fEnd.getFullYear() - 1, fEnd.getMonth(), fEnd.getDate()).toISOString().split('T')[0];

    const getHoursInPeriod = (startDayStr, endDayStr, startHourStr, endHourStr) => {
      const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
      const tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
      const diffMs = tEnd - tStart;
      const hours = (diffMs + 60 * 1000) / 3600000;
      return Math.max(1, hours);
    };

    const calcEstadia = (pacs) => {
        let sum = 0, count = 0;
        pacs.forEach(p => { if (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) { sum += (p.tAlta - p.tAdmision)/60000; count++; } });
        return count ? sum / count : 0;
    };

    // Pre-calcular rangos de ventana temporal una sola vez (eliminando millones de llamadas a getWindowRange en bucles)
    const pmRange = getWindowRange(pmInitStr, pmEndStr, filtroHoraInicio, filtroHoraFin);
    const pyRange = getWindowRange(pyInitStr, pyEndStr, filtroHoraInicio, filtroHoraFin);

    const prevMonthPacientes = pmRange ? pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, pmRange)) : [];
    const prevYearPacientes = pyRange ? pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, pyRange)) : [];

    const prevMonthVol = prevMonthPacientes.length;
    const prevYearVol = prevYearPacientes.length;

    const pmAltasAdmin = prevMonthPacientes.filter(isAltaAdmin).length;
    const pyAltasAdmin = prevYearPacientes.filter(isAltaAdmin).length;

    const pmEstadia = calcEstadia(prevMonthPacientes);
    const pyEstadia = calcEstadia(prevYearPacientes);

    const pmHours = getHoursInPeriod(pmInitStr, pmEndStr, filtroHoraInicio, filtroHoraFin);
    const pyHours = getHoursInPeriod(pyInitStr, pyEndStr, filtroHoraInicio, filtroHoraFin);

    const pmPacHora = pmHours > 0 ? prevMonthVol / pmHours : 0;
    const pyPacHora = pyHours > 0 ? prevYearVol / pyHours : 0;

    const pmCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };
    const pyCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };

    const countCategories = (pacList, targetObj) => {
      pacList.forEach(p => {
        const cat = normalizeCategoria(p);
        if (targetObj[cat] !== undefined) {
          targetObj[cat]++;
        }
      });
    };

    countCategories(prevMonthPacientes, pmCats);
    countCategories(prevYearPacientes, pyCats);

    const currentVol = pacientesFiltrados.length;
    const currentAltas = pacientesFiltrados.filter(isAltaAdmin).length;
    const currentEstadiaVal = calcEstadia(pacientesFiltrados);

    const currentHours = getHoursInPeriod(filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin);
    const currentPacHoraVal = currentHours > 0 ? currentVol / currentHours : 0;

    const currentCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };
    countCategories(pacientesFiltrados, currentCats);

    const getGrowth = (curr, prev) => {
      const c = Number(curr || 0);
      const p = Number(prev || 0);
      if (p <= 0) return undefined;
      return ((c - p) / p) * 100;
    };

    const isConstatacion = isConstatacionLesion;

    const currentTraslados = deduplicarPacientes(pacientesFiltrados.filter(isTraslado)).length;
    const pmTraslados = deduplicarPacientes(prevMonthPacientes.filter(isTraslado)).length;
    const pyTraslados = deduplicarPacientes(prevYearPacientes.filter(isTraslado)).length;

    const currentConstataciones = pacientesFiltrados.filter(isConstatacion).length;
    const pmConstataciones = prevMonthPacientes.filter(isConstatacion).length;
    const pyConstataciones = prevYearPacientes.filter(isConstatacion).length;

    const avgEdad = demografiaStats.edadCount ? (demografiaStats.edadSum / demografiaStats.edadCount).toFixed(1) : 0;
    const fontTot = Object.entries(demografiaStats.prevs).filter(([k]) => k.includes('FONASA')).reduce((acc, [_, v]) => acc + v, 0);
    const fonasaPercent = demografiaStats.total ? (fontTot / demografiaStats.total) * 100 : 0;
    const meliPercent = demografiaStats.total ? ((demografiaStats.comunas['MELIPILLA'] || 0) / demografiaStats.total) * 100 : 0;

    // Comparativa YTD (Año actual) - Siempre usa día completo civil 00:00 a 23:59
    const yearStartStr = `${fEnd.getFullYear()}-01-01`;
    const fEndStr = fEnd.toISOString().split('T')[0];

    // Deduplicar turnos YTD por fechaInicio + horario para evitar doble conteo de shifts recalculados
    const seenYtdTurnos = new Set();
    const dedupYtdTurnos = [];
    (turnosDB || []).forEach(t => {
      if (!t || !t.fechaInicio || t.fechaInicio < yearStartStr || t.fechaInicio > fEndStr) return;
      const key = `${t.fechaInicio}_${t.horario || t.tipoTurno || ''}`;
      if (seenYtdTurnos.has(key)) return;
      seenYtdTurnos.add(key);
      dedupYtdTurnos.push(t);
    });

    const yearRange = getWindowRange(yearStartStr, fEndStr, '00:00', '23:59');
    const yearLoadedPacs = yearRange ? pacientesDB.filter(p => p.tAdmision && isPatientInWindowRange(p.tAdmision, yearRange)) : [];
    const dedupYearPacs = deduplicarPacientes(yearLoadedPacs);

    const ytdPacientes = dedupYearPacs.length > 0 && dedupYearPacs.length >= dedupYtdTurnos.length 
      ? dedupYearPacs.length 
      : dedupYtdTurnos.reduce((acc, t) => acc + (t.totalPacientes || 0), 0);

    const ytdAltas = dedupYearPacs.length > 0 && dedupYearPacs.length >= dedupYtdTurnos.length 
      ? dedupYearPacs.filter(isAltaAdmin).length 
      : dedupYtdTurnos.reduce((acc, t) => acc + (t.altasAdmin || 0), 0);

    const ytdAtendidos = Math.max(0, ytdPacientes - ytdAltas);
    const ytdTraslados = dedupYtdTurnos.reduce((acc, t) => acc + (t.trasladosCount || 0), 0);
    const ytdConstataciones = dedupYtdTurnos.reduce((acc, t) => acc + (t.constatacionesCount || 0), 0);

    const ytdEstadia = calcEstadia(dedupYearPacs);

    // Crear conjunto de fechas que son fin de semana o festivos
    const weekendDates = new Set();
    (dedupYtdTurnos || []).forEach(t => {
      if (t && t.horario && typeof t.horario === 'string' && t.horario.includes('Fin de semana') && t.fechaInicio) {
        const parts = String(t.fechaInicio).split('-');
        if (parts.length === 3) {
          weekendDates.add(`${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      }
    });

    const isWeekendOrFestivo = (dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') return false;
      if (weekendDates.has(dateStr)) return true;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (isNaN(d.getTime())) return false;
        const day = d.getDay();
        return day === 0 || day === 6;
      }
      return false;
    };

    // Calcular récords por TURNO INDIVIDUAL del año (YTD) a partir de turnosDB deduplicados
    let recordPacWkdy = { count: 0, date: 'Sin registros', horario: '' };
    let recordPacWknd = { count: 0, date: 'Sin registros', horario: '' };
    let recordAltasWkdy = { count: 0, date: 'Sin registros', horario: '' };
    let recordAltasWknd = { count: 0, date: 'Sin registros', horario: '' };

    (dedupYtdTurnos || []).forEach(t => {
      if (!t || !t.fechaInicio) return;
      const parts = String(t.fechaInicio).split('-');
      if (parts.length !== 3) return;
      const dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
      const pacs = Number(t.totalPacientes || 0);
      const altas = Number(t.altasAdmin || 0);
      const hor = String(t.horario || '');

      // Un turno es de fin de semana/festivo si su horario lo indica o si cae en fin de semana
      const isWknd = isWeekendOrFestivo(dateStr) || hor.toLowerCase().includes('fin de semana') || hor.toLowerCase().includes('festivo') || hor.includes('08:00 - 20:00');

      if (isWknd) {
        if (pacs > recordPacWknd.count) {
          recordPacWknd = { count: pacs, date: dateStr, horario: hor };
        }
        if (altas > recordAltasWknd.count) {
          recordAltasWknd = { count: altas, date: dateStr, horario: hor };
        }
      } else {
        if (pacs > recordPacWkdy.count) {
          recordPacWkdy = { count: pacs, date: dateStr, horario: hor };
        }
        if (altas > recordAltasWkdy.count) {
          recordAltasWkdy = { count: altas, date: dateStr, horario: hor };
        }
      }
    });

    // Comparativa YTD del Año Anterior (Mismo periodo 01/01 al corte actual del año previo)
    const prevYearNum = fEnd.getFullYear() - 1;
    const pyYearStartStr = `${prevYearNum}-01-01`;
    const pyMonthStr = String(fEnd.getMonth() + 1).padStart(2, '0');
    const pyDayStr = String(fEnd.getDate()).padStart(2, '0');
    const pyYearEndStr = `${prevYearNum}-${pyMonthStr}-${pyDayStr}`;

    const seenPyTurnos = new Set();
    const dedupPyYtdTurnos = [];
    (turnosDB || []).forEach(t => {
      if (!t || !t.fechaInicio || t.fechaInicio < pyYearStartStr || t.fechaInicio > pyYearEndStr) return;
      const key = `${t.fechaInicio}_${t.horario || t.tipoTurno || ''}`;
      if (seenPyTurnos.has(key)) return;
      seenPyTurnos.add(key);
      dedupPyYtdTurnos.push(t);
    });

    const pyYearRange = getWindowRange(pyYearStartStr, pyYearEndStr, '00:00', '23:59');
    const pyYearLoadedPacs = pyYearRange ? pacientesDB.filter(p => p.tAdmision && isPatientInWindowRange(p.tAdmision, pyYearRange)) : [];
    const dedupPyYearPacs = deduplicarPacientes(pyYearLoadedPacs);

    // Línea Base Histórica SAR 2025 Acumulada para los meses transcurridos (Enero a Agosto = 26.370)
    const BASELINE_2025_MONTHLY = { 1: 2980, 2: 2540, 3: 3320, 4: 3390, 5: 3980, 6: 3850, 7: 3200, 8: 3110, 9: 2940, 10: 2890, 11: 2760, 12: 2850 };
    const currentMonthNum = fEnd.getMonth() + 1;
    let baseline2025YtdSum = 0;
    for (let m = 1; m <= currentMonthNum; m++) {
      baseline2025YtdSum += (BASELINE_2025_MONTHLY[m] || 0);
    }

    let pyYtdPacientes = dedupPyYearPacs.length > 0 
      ? dedupPyYearPacs.length 
      : dedupPyYtdTurnos.reduce((acc, t) => acc + (t.totalPacientes || 0), 0);

    if (pyYtdPacientes < 2000 && baseline2025YtdSum > 0) {
      pyYtdPacientes = baseline2025YtdSum;
    }

    let pyYtdAltas = dedupPyYearPacs.length > 0 
      ? dedupPyYearPacs.filter(isAltaAdmin).length 
      : dedupPyYtdTurnos.reduce((acc, t) => acc + (t.altasAdmin || 0), 0);
    if (pyYtdAltas === 0 && pyYtdPacientes > 0) {
      pyYtdAltas = Math.round(pyYtdPacientes * 0.1005); // ~2.650 altas en 2025
    }

    const pyYtdAtendidos = Math.max(0, pyYtdPacientes - pyYtdAltas);
    const pyYtdTraslados = dedupPyYtdTurnos.reduce((acc, t) => acc + (t.trasladosCount || 0), 0) || Math.round(pyYtdPacientes * 0.04);
    const pyYtdConstataciones = dedupPyYtdTurnos.reduce((acc, t) => acc + (t.constatacionesCount || 0), 0) || Math.round(pyYtdPacientes * 0.009);
    const pyYtdEstadia = calcEstadia(dedupPyYearPacs) || 130;
    const pyYtdHours = Math.max(1, getHoursInPeriod(pyYearStartStr, pyYearEndStr, '00:00', '23:59'));
    const pyYtdPacHora = pyYtdHours > 0 ? pyYtdPacientes / pyYtdHours : 0;

    const statsAnual = {
      pacientes: { 
        current: ytdPacientes,
        growthYear: getGrowth(ytdPacientes, pyYtdPacientes)
      },
      atendidos: { 
        current: ytdAtendidos,
        growthYear: getGrowth(ytdAtendidos, pyYtdAtendidos)
      },
      estadia: { 
        current: ytdEstadia,
        growthYear: getGrowth(ytdEstadia, pyYtdEstadia)
      },
      pacHora: { 
        current: ytdPacientes / Math.max(1, getHoursInPeriod(yearStartStr, fEndStr, '00:00', '23:59')),
        growthYear: getGrowth(ytdPacientes / Math.max(1, getHoursInPeriod(yearStartStr, fEndStr, '00:00', '23:59')), pyYtdPacHora)
      },
      altasAdmin: { 
        current: ytdAltas,
        growthYear: getGrowth(ytdAltas, pyYtdAltas)
      },
      traslados: { 
        current: ytdTraslados,
        growthYear: getGrowth(ytdTraslados, pyYtdTraslados)
      },
      constataciones: { 
        current: ytdConstataciones,
        growthYear: getGrowth(ytdConstataciones, pyYtdConstataciones)
      },
      recordPacWkdy,
      recordPacWknd,
      recordAltasWkdy,
      recordAltasWknd
    };

    return {
        anual: statsAnual,
        pacientes: {  
            current: currentVol, 
            growthMonth: getGrowth(currentVol, prevMonthVol),
            growthYear: getGrowth(currentVol, prevYearVol)
        },
        atendidos: {
            current: currentVol - currentAltas,
            growthMonth: getGrowth(currentVol - currentAltas, prevMonthVol - pmAltasAdmin),
            growthYear: getGrowth(currentVol - currentAltas, prevYearVol - pyAltasAdmin)
        },
        estadia: { 
            current: currentEstadiaVal, 
            growthMonth: getGrowth(currentEstadiaVal, pmEstadia),
            growthYear: getGrowth(currentEstadiaVal, pyEstadia)
        },
        pacHora: { 
            current: currentPacHoraVal, 
            growthMonth: getGrowth(currentPacHoraVal, pmPacHora),
            growthYear: getGrowth(currentPacHoraVal, pyPacHora)
        },
        altasAdmin: { 
            current: currentAltas, 
            growthMonth: getGrowth(currentAltas, pmAltasAdmin),
            growthYear: getGrowth(currentAltas, pyAltasAdmin)
        },
        traslados: {
            current: currentTraslados,
            growthMonth: getGrowth(currentTraslados, pmTraslados),
            growthYear: getGrowth(currentTraslados, pyTraslados)
        },
        constataciones: {
            current: currentConstataciones,
            growthMonth: getGrowth(currentConstataciones, pmConstataciones),
            growthYear: getGrowth(currentConstataciones, pyConstataciones)
        },
        demo: { avgEdad, fonasaPercent, meliPercent },
        categorias: ['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5'].map(c => ({
            name: c === 'c3_z518' ? 'C3 (L)' : c.toUpperCase(),
            current: currentCats[c],
            growthMonth: getGrowth(currentCats[c], pmCats[c]),
            growthYear: getGrowth(currentCats[c], pyCats[c])
        }))
    }
  }, [pacientesFiltrados, turnosDB, pacientesDB, filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin, promediosGlobales, demografiaStats, tipoCorte]);

  const rankingCentros = useMemo(() => {
    const centrosArr = Object.entries(demografiaStats.establecimientos).map(([name, count]) => ({name, count}));
    let countFlorencia = 0, countBoris = 0, countElgueta = 0;

    centrosArr.forEach(c => {
      if (c.name.includes('FLORENCIA')) countFlorencia += c.count;
      else if (c.name.includes('BORIS SOLER')) countBoris += c.count;
      else if (c.name.includes('ELGUETA')) countElgueta += c.count;
    });

    const mainCentrosCount = countFlorencia + countBoris + countElgueta;
    const mainCentrosPercent = perc(mainCentrosCount, demografiaStats.total);
    const otrosCentros = centrosArr
      .filter(c => !(c.name.includes('FLORENCIA') || c.name.includes('BORIS SOLER') || c.name.includes('ELGUETA')) && c.name !== 'DESCONOCIDO')
      .sort((a,b) => b.count - a.count).slice(0,5);

    return { 
      florencia: { count: countFlorencia, perc: perc(countFlorencia, demografiaStats.total) }, 
      boris: { count: countBoris, perc: perc(countBoris, demografiaStats.total) }, 
      elgueta: { count: countElgueta, perc: perc(countElgueta, demografiaStats.total) }, 
      mainCentrosCount, 
      mainCentrosPercent, 
      otrosCentros 
    };
  }, [demografiaStats]);

  const topDiagnosticos = useMemo(() => {
    const counts = {};
    pacientesFiltrados.forEach(p => {
      let diag = p.diagnosticoPrincipal || p.codigoDiagnostico;
      if (diag && String(diag).trim() !== '' && String(diag).trim() !== 'UNDEFINED' && String(diag).trim() !== 'null') {
        let text = String(diag).toUpperCase().trim();
        // Remove code prefix if it looks like "J00 - Resfrio"
        if (text.includes('-')) {
          text = text.split('-').slice(1).join('-').trim();
        }
        counts[text] = (counts[text] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [pacientesFiltrados]);

  return {
    turnosFiltrados,
    pacientesFiltrados,
    demografiaStats,
    promediosGlobales,
    metricsByCategory,
    statsKPI,
    rankingCentros,
    topDiagnosticos
  };
};
