import { useMemo } from 'react';

const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;

export const useMetricoAnalytics = (pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin, filtrosGlobales = {}) => {
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
    const lotesVisibles = turnosPorFecha.map(t => t.loteId);
    let pacs = pacientesDB.filter(p => lotesVisibles.includes(p.loteId));

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
  }, [pacientesDB, turnosPorFecha, filtrosGlobales, hasGlobalFilters]);

  const turnosFiltrados = useMemo(() => {
    if (!hasGlobalFilters) return turnosPorFecha;

    // Cuando hay filtros globales, recalculamos los totales de los turnos en base a los pacientes filtrados
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
  }, [turnosPorFecha, pacientesFiltrados, hasGlobalFilters]);

  // === ANÁLISIS DEMOGRÁFICO Y GLOBAL ===
  const demografiaStats = useMemo(() => {
    const stats = {
      total: 0, edadSum: 0, edadCount: 0, sexo: { F: 0, M: 0, O: 0 },
      edades: Object.fromEntries(AGE_RANGES.map(r => [r, 0])),
      prevs: {}, comunas: {}, nacionalidades: {}, establecimientos: {}
    };

    pacientesFiltrados.forEach(p => {
      stats.total++;
      if (p.edad !== null && !isNaN(p.edad)) {
         stats.edadSum += p.edad; stats.edadCount++;
         if (p.edad >= 80) stats.edades['80+']++;
         else {
           const lower = Math.floor(p.edad / 5) * 5;
           const range = `${lower}-${lower + 4}`;
           if (stats.edades[range] !== undefined) stats.edades[range]++;
         }
      }
      
      const s = String(p.sexo || '').toUpperCase();
      if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') stats.sexo.F++;
      else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') stats.sexo.M++;
      else stats.sexo.O++;

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
    const pyEndStr = new Date(fEnd.getFullYear() - 1, fEnd.getMonth(), fEnd.getDate()).toISOString().split('T')[0];

    const prevMonthTurnos = turnosDB.filter(t => t.fechaInicio >= pmInitStr && t.fechaFin <= pmEndStr);
    const prevYearTurnos = turnosDB.filter(t => t.fechaInicio >= pyInitStr && t.fechaFin <= pyEndStr);

    const prevMonthLotes = prevMonthTurnos.map(t => t.loteId);
    const prevYearLotes = prevYearTurnos.map(t => t.loteId);
    const prevMonthPacientes = pacientesDB.filter(p => prevMonthLotes.includes(p.loteId));
    const prevYearPacientes = pacientesDB.filter(p => prevYearLotes.includes(p.loteId));

    const calcEstadia = (pacs) => {
        let sum = 0, count = 0;
        pacs.forEach(p => { if (p.tAdmision && p.tAlta) { sum += (p.tAlta - p.tAdmision)/60000; count++; } });
        return count ? sum / count : 0;
    };

    const calcPacHora = (turnos) => {
        let horas = 0;
        turnos.forEach(t => horas += (String(t.horario||'').includes('17:00') ? 15 : 12));
        return horas > 0 ? turnos.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0) / horas : 0;
    };

    const currentEstadia = promediosGlobales.avgAdmAlt || 0;
    const pmEstadia = calcEstadia(prevMonthPacientes);
    const pyEstadia = calcEstadia(prevYearPacientes);

    const currentPacHora = calcPacHora(turnosFiltrados);
    const pmPacHora = calcPacHora(prevMonthTurnos);
    const pyPacHora = calcPacHora(prevYearTurnos);

    const prevMonthVol = prevMonthTurnos.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
    const prevYearVol = prevYearTurnos.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
    
    const currentAltasAdmin = turnosFiltrados.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
    const pmAltasAdmin = prevMonthTurnos.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
    const pyAltasAdmin = prevYearTurnos.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);

    const getGrowth = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    const avgEdad = demografiaStats.edadCount ? (demografiaStats.edadSum / demografiaStats.edadCount).toFixed(1) : 0;
    const fonasaTot = Object.entries(demografiaStats.prevs).filter(([k]) => k.includes('FONASA')).reduce((acc, [_, v]) => acc + v, 0);
    const fonasaPercent = demografiaStats.total ? (fonasaTot / demografiaStats.total) * 100 : 0;
    const meliPercent = demografiaStats.total ? ((demografiaStats.comunas['MELIPILLA'] || 0) / demografiaStats.total) * 100 : 0;

    // Comparativa YTD (Año actual)
    const yearStartStr = `${fEnd.getFullYear()}-01-01`;
    const fEndStr = fEnd.toISOString().split('T')[0];
    const yearTurnos = turnosDB.filter(t => t.fechaInicio >= yearStartStr && t.fechaFin <= fEndStr);
    const yearLotes = yearTurnos.map(t => t.loteId);
    const yearPacientes = pacientesDB.filter(p => yearLotes.includes(p.loteId));

    const statsAnual = {
        pacientes: { current: yearTurnos.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0) },
        estadia: { current: calcEstadia(yearPacientes) },
        pacHora: { current: calcPacHora(yearTurnos) },
        altasAdmin: { current: yearTurnos.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0) }
    };

    return {
        anual: statsAnual,
        pacientes: {  
            current: turnosFiltrados.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0), 
            growthMonth: getGrowth(turnosFiltrados.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0), prevMonthVol),
            growthYear: getGrowth(turnosFiltrados.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0), prevYearVol)
        },
        estadia: { 
            current: currentEstadia, 
            growthMonth: getGrowth(currentEstadia, pmEstadia),
            growthYear: getGrowth(currentEstadia, pyEstadia)
        },
        pacHora: { 
            current: currentPacHora, 
            growthMonth: getGrowth(currentPacHora, pmPacHora),
            growthYear: getGrowth(currentPacHora, pyPacHora)
        },
        altasAdmin: { 
            current: currentAltasAdmin, 
            growthMonth: getGrowth(currentAltasAdmin, pmAltasAdmin),
            growthYear: getGrowth(currentAltasAdmin, pyAltasAdmin)
        },
        demo: { avgEdad, fonasaPercent, meliPercent },
        categorias: ['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5'].map(c => ({
            name: c === 'c3_z518' ? 'C3 (L)' : c.toUpperCase(),
            current: turnosFiltrados.reduce((acc, t) => acc + Number(t[c] || 0), 0),
            growthMonth: getGrowth(turnosFiltrados.reduce((acc, t) => acc + Number(t[c] || 0), 0), prevMonthTurnos.reduce((acc, t) => acc + Number(t[c] || 0), 0)),
            growthYear: getGrowth(turnosFiltrados.reduce((acc, t) => acc + Number(t[c] || 0), 0), prevYearTurnos.reduce((acc, t) => acc + Number(t[c] || 0), 0))
        }))
    }
  }, [turnosFiltrados, turnosDB, pacientesDB, filtroFechaInicio, filtroFechaFin, promediosGlobales, demografiaStats]);

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
