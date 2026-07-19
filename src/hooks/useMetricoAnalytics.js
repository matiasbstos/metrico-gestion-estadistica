import { useMemo } from 'react';

const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;

const parseLocalDatetime = (dateStr, hourMinStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0).getTime();
};

const isPatientInWindow = (tAdmMs, startDayStr, endDayStr, startHourStr, endHourStr) => {
  if (!tAdmMs) return false;
  const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
  let tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
  if (isNaN(tStart) || isNaN(tEnd)) return false;
  
  if (startHourStr && endHourStr && startHourStr > endHourStr && startDayStr === endDayStr) {
    const endPlusOne = new Date(tEnd);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    tEnd = endPlusOne.getTime();
  }
  
  return tAdmMs >= tStart && tAdmMs <= tEnd;
};

export const useMetricoAnalytics = (pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin, filtrosGlobales = {}, tipoCorte = 'turno', filtroHoraInicio = '00:00', filtroHoraFin = '23:59') => {
  // =========================================================================
  // 1. PIPELINE DE DATOS GLOBAL (Afecta KPIs, Triaje, Tabla Global)
  // =========================================================================
  const turnosPorFecha = useMemo(() => {
    return turnosDB.filter(t => {
      if (filtroFechaInicio && t.fechaInicio < filtroFechaInicio) return false;
      if (filtroFechaFin && t.fechaFin > filtroFechaFin) return false;
      return true;
    });
  }, [turnosDB, filtroFechaInicio, filtroFechaFin]);

  const hasGlobalFilters = useMemo(() => {
    return Object.values(filtrosGlobales).some(val => val !== '' && val !== 'TODOS');
  }, [filtrosGlobales]);

  const pacientesFiltrados = useMemo(() => {
    let pacs = pacientesDB.filter(p => isPatientInWindow(p.tAdmision, filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin));

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
    return pacs;
  }, [pacientesDB, filtrosGlobales, hasGlobalFilters, filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin]);

  const recalcularTurnos = useMemo(() => {
    const hasHours = (filtroHoraInicio !== '00:00' || filtroHoraFin !== '23:59');
    return hasGlobalFilters || hasHours;
  }, [hasGlobalFilters, filtroHoraInicio, filtroHoraFin]);

  const turnosFiltrados = useMemo(() => {
    if (!recalcularTurnos) return turnosPorFecha;

    // Cuando hay filtros activos (globales o de horas), recalculamos los totales de los turnos en base a los pacientes filtrados
    // y excluímos los turnos manuales (ya que no se les pueden aplicar filtros de pacientes)
    return turnosPorFecha.filter(t => t.tipo === 'Masiva').map(t => {
      const pacs = pacientesFiltrados.filter(p => p.loteId === t.loteId);
      
      const counts = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };
      pacs.forEach(p => {
        if (counts[p.categoria] !== undefined) counts[p.categoria]++;
      });

      return {
        ...t,
        totalPacientes: pacs.length,
        altasAdmin: pacs.filter(p => p.estado === 'Cancelada').length,
        ...counts
      };
    });
  }, [turnosPorFecha, pacientesFiltrados, recalcularTurnos]);

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
      if (p.tAdmision && p.tCat1) { sAdmCat += (p.tCat1 - p.tAdmision)/60000; cAdmCat++; }
      if (p.tCatUlt && p.tAnamnesis) { sCatAna += (p.tAnamnesis - p.tCatUlt)/60000; cCatAna++; }
      if (p.tAnamnesis && p.tAlta) { sAnaAlt += (p.tAlta - p.tAnamnesis)/60000; cAnaAlt++; }
      if (p.tAdmision && p.tAlta) { sAdmAlt += (p.tAlta - p.tAdmision)/60000; cAdmAlt++; }
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
    const res = {};
    ['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5', 'sincat'].forEach(cat => {
      const pacs = pacientesFiltrados.filter(p => p.categoria === cat);
      let sAdmCat=0, cAdmCat=0, sCatAna=0, cCatAna=0, sAnaAlt=0, cAnaAlt=0, sAdmAlt=0, cAdmAlt=0;
      pacs.forEach(p => {
        if (p.tAdmision && p.tCat1) { sAdmCat += (p.tCat1 - p.tAdmision)/60000; cAdmCat++; }
        if (p.tCatUlt && p.tAnamnesis) { sCatAna += (p.tAnamnesis - p.tCatUlt)/60000; cCatAna++; }
        if (p.tAnamnesis && p.tAlta) { sAnaAlt += (p.tAlta - p.tAnamnesis)/60000; cAnaAlt++; }
        if (p.tAdmision && p.tAlta) { sAdmAlt += (p.tAlta - p.tAdmision)/60000; cAdmAlt++; }
      });
      res[cat] = {
        total: pacs.length, 
        avgAdmCat: cAdmCat ? sAdmCat / cAdmCat : null,
        avgCatAna: cCatAna ? sCatAna / cCatAna : null, 
        avgAnaAlt: cAnaAlt ? sAnaAlt / cAnaAlt : null,
        avgAdmAlt: cAdmAlt ? sAdmAlt / cAdmAlt : null 
      };
    });
    return res;
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
    const pyEndStr = new Date(fEnd.getFullYear() - 1, fEnd.getMonth(), fEnd.getDate()).toISOString().split('T')[0];    const getHoursInPeriod = (startDayStr, endDayStr, startHourStr, endHourStr) => {
      const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
      const tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
      const diffMs = tEnd - tStart;
      const hours = (diffMs + 60 * 1000) / 3600000;
      return Math.max(1, hours);
    };

    const calcEstadia = (pacs) => {
        let sum = 0, count = 0;
        pacs.forEach(p => { if (p.tAdmision && p.tAlta) { sum += (p.tAlta - p.tAdmision)/60000; count++; } });
        return count ? sum / count : 0;
    };

    let prevMonthPacientes, prevYearPacientes;
    let prevMonthVol, prevYearVol;
    let pmAltasAdmin, pyAltasAdmin;
    let pmEstadia, pyEstadia;
    let pmPacHora, pyPacHora;
    const pmCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };
    const pyCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };

    prevMonthPacientes = pacientesDB.filter(p => isPatientInWindow(p.tAdmision, pmInitStr, pmEndStr, filtroHoraInicio, filtroHoraFin));
    prevYearPacientes = pacientesDB.filter(p => isPatientInWindow(p.tAdmision, pyInitStr, pyEndStr, filtroHoraInicio, filtroHoraFin));

    prevMonthVol = prevMonthPacientes.length;
    prevYearVol = prevYearPacientes.length;

    pmAltasAdmin = prevMonthPacientes.filter(p => p.estado === 'Cancelada').length;
    pyAltasAdmin = prevYearPacientes.filter(p => p.estado === 'Cancelada').length;

    pmEstadia = calcEstadia(prevMonthPacientes);
    pyEstadia = calcEstadia(prevYearPacientes);

    const pmHours = getHoursInPeriod(pmInitStr, pmEndStr, filtroHoraInicio, filtroHoraFin);
    const pyHours = getHoursInPeriod(pyInitStr, pyEndStr, filtroHoraInicio, filtroHoraFin);

    pmPacHora = pmHours > 0 ? prevMonthVol / pmHours : 0;
    pyPacHora = pyHours > 0 ? prevYearVol / pyHours : 0;

    prevMonthPacientes.forEach(p => { if (pmCats[p.categoria] !== undefined) pmCats[p.categoria]++; });
    prevYearPacientes.forEach(p => { if (pyCats[p.categoria] !== undefined) pyCats[p.categoria]++; });

    const currentVol = pacientesFiltrados.length;
    const currentAltas = pacientesFiltrados.filter(p => p.estado === 'Cancelada').length;
    const currentEstadiaVal = calcEstadia(pacientesFiltrados);

    const currentHours = getHoursInPeriod(filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin);
    const currentPacHoraVal = currentHours > 0 ? currentVol / currentHours : 0;

    const currentCats = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };
    pacientesFiltrados.forEach(p => {
      if (currentCats[p.categoria] !== undefined) currentCats[p.categoria]++;
    });

    const getGrowth = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    const avgEdad = demografiaStats.edadCount ? (demografiaStats.edadSum / demografiaStats.edadCount).toFixed(1) : 0;
    const fontTot = Object.entries(demografiaStats.prevs).filter(([k]) => k.includes('FONASA')).reduce((acc, [_, v]) => acc + v, 0);
    const fonasaPercent = demografiaStats.total ? (fontTot / demografiaStats.total) * 100 : 0;
    const meliPercent = demografiaStats.total ? ((demografiaStats.comunas['MELIPILLA'] || 0) / demografiaStats.total) * 100 : 0;

    // Comparativa YTD (Año actual) - Siempre usa día completo civil 00:00 a 23:59
    const yearStartStr = `${fEnd.getFullYear()}-01-01`;
    const fEndStr = fEnd.toISOString().split('T')[0];

    const yearPacs = pacientesDB.filter(p => isPatientInWindow(p.tAdmision, yearStartStr, fEndStr, '00:00', '23:59'));
    
    // Crear conjunto de fechas que son fin de semana o festivos
    const weekendDates = new Set();
    turnosDB.forEach(t => {
      if (t.horario && t.horario.includes('Fin de semana') && t.fechaInicio) {
        const parts = t.fechaInicio.split('-');
        if (parts.length === 3) {
          weekendDates.add(`${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      }
    });

    const isWeekendOrFestivo = (dateStr) => {
      if (weekendDates.has(dateStr)) return true;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        const day = d.getDay();
        return day === 0 || day === 6;
      }
      return false;
    };

    // Calcular récords diarios del año (YTD)
    const pacsByDate = {};
    const altasByDate = {};
    yearPacs.forEach(p => {
      if (!p.tAdmision) return;
      const d = new Date(p.tAdmision);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${day}/${m}/${y}`;

      pacsByDate[dateStr] = (pacsByDate[dateStr] || 0) + 1;
      if (p.estado === 'Cancelada') {
        altasByDate[dateStr] = (altasByDate[dateStr] || 0) + 1;
      }
    });

    let recordPacWkdy = { count: 0, date: 'Sin registros' };
    let recordPacWknd = { count: 0, date: 'Sin registros' };

    Object.entries(pacsByDate).forEach(([date, count]) => {
      if (isWeekendOrFestivo(date)) {
        if (count > recordPacWknd.count) {
          recordPacWknd = { count, date };
        }
      } else {
        if (count > recordPacWkdy.count) {
          recordPacWkdy = { count, date };
        }
      }
    });

    let recordAltasWkdy = { count: 0, date: 'Sin registros' };
    let recordAltasWknd = { count: 0, date: 'Sin registros' };

    Object.entries(altasByDate).forEach(([date, count]) => {
      if (isWeekendOrFestivo(date)) {
        if (count > recordAltasWknd.count) {
          recordAltasWknd = { count, date };
        }
      } else {
        if (count > recordAltasWkdy.count) {
          recordAltasWkdy = { count, date };
        }
      }
    });

    const statsAnual = {
      pacientes: { current: yearPacs.length },
      atendidos: { current: yearPacs.length - yearPacs.filter(p => p.estado === 'Cancelada').length },
      estadia: { current: calcEstadia(yearPacs) },
      pacHora: { current: yearPacs.length / Math.max(1, getHoursInPeriod(yearStartStr, fEndStr, '00:00', '23:59')) },
      altasAdmin: { current: yearPacs.filter(p => p.estado === 'Cancelada').length },
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
