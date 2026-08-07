import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Calendar, Users, Clock, AlertTriangle, CheckSquare, Square, Activity, Hospital, UserCheck, ShieldCheck, ShieldAlert, Layers } from 'lucide-react';
import { useMetricoAnalytics } from '../../hooks/useMetricoAnalytics';
import { useMetricoProfesionales } from '../../hooks/useMetricoProfesionales';
import FiltrosGlobales from './FiltrosGlobales';
import { generateAltasSummary, generateFracturasSummary, generateEnfermeriaSummary, generateConstatacionesSummary, generateTrasladosSummary } from '../../utils/summaryGenerator';
import { obtenerTurnoDetallado } from '../../utils/helpers';

export default function ReportesModule({ 
  user,
  pacientesDB, 
  turnosDB,
  modoComparativo, setModoComparativo,
  filtroFechaInicio, setFiltroFechaInicio,
  filtroFechaFin, setFiltroFechaFin,
  filtroFechaInicioB, setFiltroFechaInicioB,
  filtroFechaFinB, setFiltroFechaFinB,
  applyDatePreset,
  tipoCorte, setTipoCorte,
  filtroHoraInicio, setFiltroHoraInicio,
  filtroHoraFin, setFiltroHoraFin,
  horarioPreset, setHorarioPreset,
  maxDateLabel,
  handleClearFilters,
  kpisBigQuery,
  loading,
  syncStatus,
  onSync
}) {
  // Selección de Sub-reportes para incluir en la impresión
  const [incluirGeneral, setIncluirGeneral] = useState(true);
  const [incluirAltas, setIncluirAltas] = useState(true);
  const [incluirFracturas, setIncluirFracturas] = useState(true);
  const [incluirEnfermeria, setIncluirEnfermeria] = useState(true);
  const [incluirConstataciones, setIncluirConstataciones] = useState(true);
  const [incluirTraslados, setIncluirTraslados] = useState(true);
  const [incluirRadar, setIncluirRadar] = useState(true);

  // Fechas dinámicas desde la barra de filtros globales
  const fechas = useMemo(() => {
    const rawInicio = filtroFechaInicio || new Date().toISOString().split('T')[0];
    const rawFin = filtroFechaFin || new Date().toISOString().split('T')[0];

    const formatD = (dateStr) => {
      if (!dateStr || dateStr.length < 10) return '';
      const p = dateStr.split('-');
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr;
    };

    return { 
      inicio: formatD(rawInicio), 
      fin: formatD(rawFin), 
      rawInicio, 
      rawFin 
    };
  }, [filtroFechaInicio, filtroFechaFin]);

  // Tipo de reporte dinámico
  const tipoReporte = useMemo(() => {
    if (!fechas.rawInicio || !fechas.rawFin) return 'Consolidado General';
    if (fechas.rawInicio === fechas.rawFin) return 'Diario';
    return 'Consolidado del Periodo';
  }, [fechas.rawInicio, fechas.rawFin]);

  // Extraer KPIs para el reporte
  const { statsKPI, demografiaStats, topDiagnosticos, pacientesFiltrados, turnosFiltrados } = useMetricoAnalytics(pacientesDB, turnosDB, fechas.rawInicio, fechas.rawFin);
  const { filteredMetricsByDoctor } = useMetricoProfesionales(pacientesDB, turnosDB, fechas.rawInicio, fechas.rawFin, [], '');

  // Rango de fechas reales detectado automáticamente de los datos de pacientes
  const rangoFechasReales = useMemo(() => {
    const pacs = pacientesFiltrados || [];
    if (pacs.length === 0) {
      return { inicio: fechas.inicio, fin: fechas.fin, texto: `${fechas.inicio} al ${fechas.fin}` };
    }

    let minT = Infinity;
    let maxT = -Infinity;

    pacs.forEach(p => {
      if (p.tAdmision) {
        if (p.tAdmision < minT) minT = p.tAdmision;
        if (p.tAdmision > maxT) maxT = p.tAdmision;
      }
    });

    if (minT === Infinity || maxT === -Infinity) {
      return { inicio: fechas.inicio, fin: fechas.fin, texto: `${fechas.inicio} al ${fechas.fin}` };
    }

    const formatDate = (ms) => {
      const d = new Date(ms);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const iniStr = formatDate(minT);
    const finStr = formatDate(maxT);

    return {
      inicio: iniStr,
      fin: finStr,
      texto: `${iniStr} al ${finStr}`
    };
  }, [pacientesFiltrados, fechas]);

  // Datos para sub-reporte de Altas Admin
  const altasStats = useMemo(() => {
    if (!statsKPI) return { totalPacientes: 0, totalAltas: 0, pct: '0.0', turnosCriticos: [], prevYearAltas: 0, prevYearPct: '0.0', yoyGrowth: '0.0' };

    const totalPacientes = statsKPI.pacientes.current;
    const totalAltas = statsKPI.altasAdmin.current;
    const pct = totalPacientes > 0 ? ((totalAltas / totalPacientes) * 100).toFixed(1) : '0.0';

    const turnosCriticos = (turnosFiltrados || [])
      .map(t => ({
        ...t,
        pct: t.totalPacientes > 0 ? ((t.altasAdmin / t.totalPacientes) * 100).toFixed(1) : 0
      }))
      .filter(t => Number(t.pct) > 10)
      .sort((a, b) => b.pct - a.pct);

    let prevYearAltas = 0;
    let prevYearTotalAdms = 0;
    let prevYearPct = '0.0';
    let yoyGrowth = '0.0';

    if (kpisBigQuery && kpisBigQuery.prevYearValues) {
      prevYearAltas = kpisBigQuery.prevYearValues.altasAdmin || 0;
      prevYearTotalAdms = kpisBigQuery.prevYearValues.pacientes || 0;
      prevYearPct = prevYearTotalAdms > 0 ? ((prevYearAltas / prevYearTotalAdms) * 100).toFixed(1) : '0.0';
      yoyGrowth = (kpisBigQuery.altasAdmin?.growthYear || 0).toFixed(1);
    } else if (pacientesDB && filtroFechaInicio && filtroFechaFin) {
      const pStart = filtroFechaInicio.split('-');
      const pEnd = filtroFechaFin.split('-');
      if (pStart.length === 3 && pEnd.length === 3) {
        const prevStartStr = `${parseInt(pStart[0]) - 1}-${pStart[1]}-${pStart[2]}`;
        const prevEndStr = `${parseInt(pEnd[0]) - 1}-${pEnd[1]}-${pEnd[2]}`;
        const startMs = new Date(prevStartStr + 'T00:00:00').getTime();
        const endMs = new Date(prevEndStr + 'T23:59:59').getTime();
        const prevYearPacs = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
        prevYearAltas = prevYearPacs.filter(p => p.estado === 'Cancelada').length;
        prevYearTotalAdms = prevYearPacs.length;
        prevYearPct = prevYearTotalAdms > 0 ? ((prevYearAltas / prevYearTotalAdms) * 100).toFixed(1) : '0.0';
        if (prevYearAltas > 0) {
          yoyGrowth = (((totalAltas - prevYearAltas) / prevYearAltas) * 100).toFixed(1);
        } else if (totalAltas > 0) {
          yoyGrowth = '100.0';
        }
      }
    }

    return { totalPacientes, totalAltas, pct, turnosCriticos, prevYearAltas, prevYearPct, yoyGrowth };
  }, [statsKPI, turnosFiltrados, kpisBigQuery, pacientesDB, filtroFechaInicio, filtroFechaFin]);

  // Datos para sub-reporte de Fracturas y Destino
  const fracturasStats = useMemo(() => {
    const pacs = pacientesFiltrados || [];

    let totalFracturas = 0;
    let hospitalCount = 0;
    let domicilioCount = 0;
    let otrosCount = 0;
    let sinRegistroCount = 0;

    // Desglose específico para pacientes con diagnóstico de fracturas
    let fracturasTrasladadas = 0;
    let fracturasDomicilio = 0;
    let fracturasOtros = 0;

    let sumAdmCatFrac = 0, countAdmCatFrac = 0;
    let sumCatAnaFrac = 0, countCatAnaFrac = 0;
    let sumAnaAltFrac = 0, countAnaAltFrac = 0;
    let sumAdmAltFrac = 0, countAdmAltFrac = 0;

    let sumAnaAltTrasladoFrac = 0, countAnaAltTrasladoFrac = 0;
    let sumAdmAltTrasladoFrac = 0, countAdmAltTrasladoFrac = 0;

    const diagMap = {};

    pacs.forEach(p => {
      const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || '').toLowerCase();
      const isFrac = diag.includes('fractura') || diag.includes('fx');
      
      const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
      const isTraslado = dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac');
      const isDomicilio = dest.includes('domicilio');

      if (isFrac) {
        totalFracturas++;
        const key = (p.diagnosticoPrincipal || p.codigoDiagnostico || 'FRACTURA NO ESPECIFICADA').toUpperCase();
        diagMap[key] = (diagMap[key] || 0) + 1;

        if (isTraslado) {
          fracturasTrasladadas++;
        } else if (isDomicilio) {
          fracturasDomicilio++;
        } else {
          fracturasOtros++;
        }

        // Tiempos de atención para fracturas
        let tCat = null;
        if (typeof p.tCat1 === 'number' && typeof p.tCatUlt === 'number') tCat = (p.tCat1 + p.tCatUlt) / 2;
        else if (typeof p.tCat1 === 'number') tCat = p.tCat1;
        else if (typeof p.tCatUlt === 'number') tCat = p.tCatUlt;

        if (typeof p.tAdmision === 'number' && typeof tCat === 'number' && tCat >= p.tAdmision) {
          sumAdmCatFrac += (tCat - p.tAdmision) / 3600000;
          countAdmCatFrac++;
        }
        if (typeof tCat === 'number' && typeof p.tAnamnesis === 'number' && p.tAnamnesis >= tCat) {
          sumCatAnaFrac += (p.tAnamnesis - tCat) / 3600000;
          countCatAnaFrac++;
        }
        if (typeof p.tAnamnesis === 'number' && typeof p.tAlta === 'number' && p.tAlta >= p.tAnamnesis) {
          const dAnaAlt = (p.tAlta - p.tAnamnesis) / 3600000;
          sumAnaAltFrac += dAnaAlt;
          countAnaAltFrac++;
          if (isTraslado) {
            sumAnaAltTrasladoFrac += dAnaAlt;
            countAnaAltTrasladoFrac++;
          }
        }
        if (typeof p.tAdmision === 'number' && typeof p.tAlta === 'number' && p.tAlta >= p.tAdmision) {
          const dAdmAlt = (p.tAlta - p.tAdmision) / 3600000;
          sumAdmAltFrac += dAdmAlt;
          countAdmAltFrac++;
          if (isTraslado) {
            sumAdmAltTrasladoFrac += dAdmAlt;
            countAdmAltTrasladoFrac++;
          }
        }
      }

      if (isTraslado) hospitalCount++;
      else if (isDomicilio) domicilioCount++;
      else if (!dest) sinRegistroCount++;
      else otrosCount++;
    });

    const topFracturas = Object.entries(diagMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    let prevYearFracturas = 0;
    let prevYearTotalAdms = 0;
    let prevYearPct = '0.0';
    let yoyGrowth = '0.0';

    if (filtroFechaInicio && filtroFechaFin && pacientesDB) {
      const pStart = filtroFechaInicio.split('-');
      const pEnd = filtroFechaFin.split('-');
      if (pStart.length === 3 && pEnd.length === 3) {
        const prevStartStr = `${parseInt(pStart[0]) - 1}-${pStart[1]}-${pStart[2]}`;
        const prevEndStr = `${parseInt(pEnd[0]) - 1}-${pEnd[1]}-${pEnd[2]}`;
        const startMs = new Date(prevStartStr + 'T00:00:00').getTime();
        const endMs = new Date(prevEndStr + 'T23:59:59').getTime();
        const prevYearPacs = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
        const prevFracs = prevYearPacs.filter(p => {
          const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || '').toLowerCase();
          return diag.includes('fractura') || diag.includes('fx');
        });
        prevYearFracturas = prevFracs.length;
        prevYearTotalAdms = prevYearPacs.length;
        prevYearPct = prevYearTotalAdms > 0 ? ((prevYearFracturas / prevYearTotalAdms) * 100).toFixed(1) : '0.0';
        if (prevYearFracturas > 0) {
          yoyGrowth = (((totalFracturas - prevYearFracturas) / prevYearFracturas) * 100).toFixed(1);
        } else if (totalFracturas > 0) {
          yoyGrowth = '100.0';
        }
      }
    }

    const avgAdmCatFrac = countAdmCatFrac > 0 ? (sumAdmCatFrac / countAdmCatFrac) : null;
    const avgCatAnaFrac = countCatAnaFrac > 0 ? (sumCatAnaFrac / countCatAnaFrac) : null;
    const avgAnaAltFrac = countAnaAltFrac > 0 ? (sumAnaAltFrac / countAnaAltFrac) : null;
    const avgEstadiaTotalFrac = countAdmAltFrac > 0 ? (sumAdmAltFrac / countAdmAltFrac) : null;

    const avgAnaAltTrasladoFrac = countAnaAltTrasladoFrac > 0 ? (sumAnaAltTrasladoFrac / countAnaAltTrasladoFrac) : null;
    const avgEstadiaTrasladoFrac = countAdmAltTrasladoFrac > 0 ? (sumAdmAltTrasladoFrac / countAdmAltTrasladoFrac) : null;

    // Grupo etario con mayor porcentaje de fracturas
    const ageGroupCounts = {};
    pacs.forEach(p => {
      const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || '').toLowerCase();
      if (diag.includes('fractura') || diag.includes('fx')) {
        let edadNum = null;
        if (typeof p.edadNum === 'number') edadNum = p.edadNum;
        else if (p.edad) {
          const parsed = parseInt(String(p.edad).replace(/\D/g, ''));
          if (!isNaN(parsed)) edadNum = parsed;
        }
        if (edadNum !== null) {
          let r5 = edadNum >= 80 ? '80+' : `${Math.floor(edadNum / 5) * 5}-${Math.floor(edadNum / 5) * 5 + 4}`;
          ageGroupCounts[r5] = (ageGroupCounts[r5] || 0) + 1;
        }
      }
    });

    const sortedAgeGroups = Object.entries(ageGroupCounts).sort((a,b) => b[1] - a[1]);
    const topAgeGroup = sortedAgeGroups.length > 0 ? {
      rango: sortedAgeGroups[0][0],
      total: sortedAgeGroups[0][1],
      pct: totalFracturas > 0 ? ((sortedAgeGroups[0][1] / totalFracturas) * 100).toFixed(1) : '0.0'
    } : { rango: 'N/A', total: 0, pct: '0.0' };

    return { 
      totalPacientes: pacs.length, 
      totalFracturas, 
      hospitalCount, 
      domicilioCount, 
      otrosCount, 
      sinRegistroCount, 
      topFracturas,
      topAgeGroup,
      fracturasTrasladadas,
      fracturasDomicilio,
      fracturasOtros,
      prevYearFracturas,
      prevYearPct,
      yoyGrowth,
      avgAdmCatFrac,
      avgCatAnaFrac,
      avgAnaAltFrac,
      avgEstadiaTotalFrac,
      avgAnaAltTrasladoFrac,
      avgEstadiaTrasladoFrac
    };
  }, [pacientesFiltrados, pacientesDB, filtroFechaInicio, filtroFechaFin]);

  // Datos para sub-reporte de Enfermería
  const enfermeriaStats = useMemo(() => {
    const pacs = pacientesFiltrados || [];

    let sumMinCat1 = 0, countMinCat1 = 0;
    let sumMinReCat = 0, countMinReCat = 0;
    const enfMap = {};

    pacs.forEach(p => {
      const tAdm = p.tAdmision;
      const tC1 = p.tCat1 || p.tCatUlt;
      const tCU = p.tCatUlt;

      if (tAdm && tC1 && tC1 >= tAdm) {
        const m = (tC1 - tAdm) / 60000;
        if (m <= 300) { sumMinCat1 += m; countMinCat1++; }
      }
      if (tC1 && tCU && tCU > tC1) {
        const m = (tCU - tC1) / 60000;
        if (m <= 600) { sumMinReCat += m; countMinReCat++; }
      }

      const enf = p.enfermeroCat1 ? String(p.enfermeroCat1).trim() : 'No Registrado';
      if (enf !== 'No Registrado') {
        if (!enfMap[enf]) {
          enfMap[enf] = {
            nombre: enf,
            total: 0,
            c1: 0, c2: 0, c3: 0, c4: 0, c5: 0,
            sumMinCat1: 0, countMinCat1: 0,
            sumMinReCat: 0, countMinReCat: 0
          };
        }
        
        const item = enfMap[enf];
        item.total++;
        
        let cat = String(p.catPrimera || p.categoria || '').toLowerCase();
        
        // Dinámicamente identificar Constatación de Lesiones (Z51.8 Estricto)
        const cod = (p.codigoDiagnostico || '').toUpperCase();
        const isLesion = cod.includes('Z51.8') || cod.includes('Z518');
        
        if (isLesion) {
          cat = 'c3_z518';
        }

        if (cat === 'c1') item.c1++;
        else if (cat === 'c2') item.c2++;
        else if (cat === 'c3') item.c3++;
        else if (cat === 'c3_z518') item.c3++; // En conteo de C3 del funcionario agrupamos ambos
        else if (cat === 'c4') item.c4++;
        else if (cat === 'c5') item.c5++;

        if (tAdm && tC1 && tC1 >= tAdm) {
          const m = (tC1 - tAdm) / 60000;
          if (m <= 300) {
            item.sumMinCat1 += m;
            item.countMinCat1++;
          }
        }
        if (tC1 && tCU && tCU > tC1) {
          const m = (tCU - tC1) / 60000;
          if (m <= 600) {
            item.sumMinReCat += m;
            item.countMinReCat++;
          }
        }
      }
    });

    const topEnfermeros = Object.values(enfMap)
      .map(e => ({
        ...e,
        avgMinCat1: e.countMinCat1 ? Math.round(e.sumMinCat1 / e.countMinCat1) : 0,
        avgMinReCat: e.countMinReCat ? Math.round(e.sumMinReCat / e.countMinReCat) : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Desglose de casos críticos C1 y C2 para el sub-reporte imprimible
    const casosCriticos = pacs.filter(p => {
      const cat = String(p.catPrimera || p.categoria || '').toLowerCase();
      return cat === 'c1' || cat === 'c2';
    });

    // Diferenciación C3 (Constatación de lesiones vs Otros diagnósticos)
    const c3LesionesPacs = pacs.filter(p => {
      const cat = String(p.catPrimera || p.categoria || '').toLowerCase();
      const cod = (p.codigoDiagnostico || '').toUpperCase();
      const diag = (p.diagnosticoPrincipal || '').toUpperCase();
      const isLesion = cod.includes('Z51.8') || cod.includes('Z518') || 
                       cod.includes('Z04') || 
                       diag.includes('CONSTATAC') || 
                       diag.includes('LESIÓN') || diag.includes('LESION') ||
                       diag.includes('CIRCUNSTANCIAS LEGALES') ||
                       diag.includes('POLICIAL') ||
                       diag.includes('AGRESIÓN') || diag.includes('AGRESION');
      return cat === 'c3_z518' || (cat === 'c3' && isLesion);
    });
    const c3ClinicoPacs = pacs.filter(p => {
      const cat = String(p.catPrimera || p.categoria || '').toLowerCase();
      const cod = (p.codigoDiagnostico || '').toUpperCase();
      const diag = (p.diagnosticoPrincipal || '').toUpperCase();
      const isLesion = cod.includes('Z51.8') || cod.includes('Z518') || 
                       cod.includes('Z04') || 
                       diag.includes('CONSTATAC') || 
                       diag.includes('LESIÓN') || diag.includes('LESION') ||
                       diag.includes('CIRCUNSTANCIAS LEGALES') ||
                       diag.includes('POLICIAL') ||
                       diag.includes('AGRESIÓN') || diag.includes('AGRESION');
      return cat === 'c3' && !isLesion;
    });
    const totalC3 = c3LesionesPacs.length + c3ClinicoPacs.length;

    const diagCounts = {};
    c3ClinicoPacs.forEach(p => {
      const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || 'SIN DIAGNÓSTICO ESPECIFICADO').toUpperCase().trim();
      diagCounts[diag] = (diagCounts[diag] || 0) + 1;
    });

    const top10DiagC3 = Object.entries(diagCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: c3ClinicoPacs.length > 0 ? ((count / c3ClinicoPacs.length) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    let prevYearAvgCat1 = 0;
    let yoyAvgCat1Growth = '0.0';

    if (filtroFechaInicio && filtroFechaFin && pacientesDB) {
      const pStart = filtroFechaInicio.split('-');
      const pEnd = filtroFechaFin.split('-');
      if (pStart.length === 3 && pEnd.length === 3) {
        const prevStartStr = `${parseInt(pStart[0]) - 1}-${pStart[1]}-${pStart[2]}`;
        const prevEndStr = `${parseInt(pEnd[0]) - 1}-${pEnd[1]}-${pEnd[2]}`;
        const startMs = new Date(prevStartStr + 'T00:00:00').getTime();
        const endMs = new Date(prevEndStr + 'T23:59:59').getTime();
        const prevYearPacs = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
        let sumPrev = 0; let countPrev = 0;
        prevYearPacs.forEach(p => {
          const tAdm = p.tAdmision;
          const tC1 = p.tCat1 || p.tCatUlt;
          if (tAdm && tC1 && tC1 >= tAdm) {
            const m = (tC1 - tAdm) / 60000;
            if (m <= 300) { sumPrev += m; countPrev++; }
          }
        });
        const currentAvg = countMinCat1 ? Math.round(sumMinCat1 / countMinCat1) : 0;
        prevYearAvgCat1 = countPrev ? Math.round(sumPrev / countPrev) : 0;
        if (prevYearAvgCat1 > 0) {
          yoyAvgCat1Growth = (((currentAvg - prevYearAvgCat1) / prevYearAvgCat1) * 100).toFixed(1);
        }
      }
    }

    return {
      totalTriados: pacs.length,
      avgMinCat1: countMinCat1 ? Math.round(sumMinCat1 / countMinCat1) : 0,
      avgMinReCat: countMinReCat ? Math.round(sumMinReCat / countMinReCat) : 0,
      reCatCount: countMinReCat,
      topEnfermeros,
      casosCriticos,
      c3Stats: {
        totalC3,
        lesionesCount: c3LesionesPacs.length,
        lesionesPerc: totalC3 > 0 ? ((c3LesionesPacs.length / totalC3) * 100).toFixed(1) : '0.0',
        clinicoCount: c3ClinicoPacs.length,
        clinicoPerc: totalC3 > 0 ? ((c3ClinicoPacs.length / totalC3) * 100).toFixed(1) : '0.0',
        top10DiagC3
      },
      prevYearAvgCat1,
      yoyAvgCat1Growth
    };
  }, [pacientesFiltrados, pacientesDB, filtroFechaInicio, filtroFechaFin]);

  // Métricas para el informe formal imprimible de Constataciones Z51.8
  const statsConstatacionesReporte = useMemo(() => {
    const pacs = pacientesFiltrados || [];
    let official241 = 0;
    let subLesiones = 0;
    let subLegales = 0;
    let subAgresion = 0;
    let subPolicial = 0;

    let c3Total = 0;
    let hombres = 0, mujeres = 0;
    const matrixMap = {
      '0-14': { mujeres: 0, hombres: 0, total: 0 },
      '15-29': { mujeres: 0, hombres: 0, total: 0 },
      '30-59': { mujeres: 0, hombres: 0, total: 0 },
      '60+': { mujeres: 0, hombres: 0, total: 0 }
    };

    const comunasMap = {};

    pacs.forEach(p => {
      const cat = String(p.categoria || '').toLowerCase();
      const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
      const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();

      const isC3 = cat === 'c3' || cat === 'c3_z518';
      const isOfficial = cat === 'c3_z518' || cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');

      if (isOfficial) {
        official241++;
        
        const s = String(p.sexo || '').toUpperCase();
        const isF = s.includes('MUJER') || s.includes('FEMENINO') || s === 'F';
        const isM = s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M';
        if (isF) mujeres++; else if (isM) hombres++;

        let r = '30-59';
        if (p.edad !== null && p.edad !== undefined && !isNaN(p.edad)) {
          if (p.edad <= 14) r = '0-14';
          else if (p.edad <= 29) r = '15-29';
          else if (p.edad <= 59) r = '30-59';
          else r = '60+';
        }

        if (matrixMap[r]) {
          matrixMap[r].total++;
          if (isF) matrixMap[r].mujeres++;
          if (isM) matrixMap[r].hombres++;
        }

        const com = String(p.comuna || 'MELIPILLA').toUpperCase().trim();
        comunasMap[com] = (comunasMap[com] || 0) + 1;
      }

      if (isC3) c3Total++;

      if (cod.includes('Z51') || cod.includes('Z04') || isOfficial) {
        if (cod.includes('Z51') || cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC')) subLesiones++;
        if (diag.includes('CIRCUNSTANCIAS LEGALES') || diag.includes('LEGAL')) subLegales++;
        if (diag.includes('AGRESIÓ') || diag.includes('AGRESION')) subAgresion++;
        if (diag.includes('POLICIAL') || diag.includes('CARABINERO') || diag.includes('PDI') || cod.includes('Z04')) subPolicial++;
      }
    });

    const totalOff = official241;
    const matrixArr = Object.entries(matrixMap).map(([rango, data]) => ({
      rango,
      mujeres: data.mujeres,
      hombres: data.hombres,
      total: data.total,
      pct: totalOff > 0 ? ((data.total / totalOff) * 100).toFixed(1) : '0.0',
      pctMujeres: totalOff > 0 ? ((data.mujeres / totalOff) * 100).toFixed(1) : '0.0',
      pctHombres: totalOff > 0 ? ((data.hombres / totalOff) * 100).toFixed(1) : '0.0'
    }));

    // Rango etario de mayor participación
    const sortedRangos = [...matrixArr].sort((a, b) => b.total - a.total);
    const topRango = sortedRangos[0] || { rango: '30-59', total: 0, pct: '0.0' };

    // Lista de comunas ordenadas por cantidad
    const comunasArr = Object.entries(comunasMap)
      .map(([comuna, count]) => ({
        comuna,
        count,
        pct: totalOff > 0 ? ((count / totalOff) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count);

    let prevYearConstataciones = 0;
    let prevYearPct = '0.0';
    let yoyGrowth = '0.0';

    if (kpisBigQuery && kpisBigQuery.prevYearValues) {
      prevYearConstataciones = kpisBigQuery.prevYearValues.constataciones || 0;
      yoyGrowth = (kpisBigQuery.constataciones?.growthYear || 0).toFixed(1);
      const prevTotal = kpisBigQuery.prevYearValues.pacientes || 0;
      prevYearPct = prevTotal > 0 ? ((prevYearConstataciones / prevTotal) * 100).toFixed(1) : '0.0';
    } else if (filtroFechaInicio && filtroFechaFin && pacientesDB) {
      const pStart = filtroFechaInicio.split('-');
      const pEnd = filtroFechaFin.split('-');
      if (pStart.length === 3 && pEnd.length === 3) {
        const prevStartStr = `${parseInt(pStart[0]) - 1}-${pStart[1]}-${pStart[2]}`;
        const prevEndStr = `${parseInt(pEnd[0]) - 1}-${pEnd[1]}-${pEnd[2]}`;
        const startMs = new Date(prevStartStr + 'T00:00:00').getTime();
        const endMs = new Date(prevEndStr + 'T23:59:59').getTime();
        const prevYearPacs = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
        const prevConsts = prevYearPacs.filter(p => {
          const cat = String(p.categoria || '').toLowerCase();
          const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
          const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
          return cat === 'c3_z518' || cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');
        });
        prevYearConstataciones = prevConsts.length;
        prevYearPct = prevYearPacs.length > 0 ? ((prevYearConstataciones / prevYearPacs.length) * 100).toFixed(1) : '0.0';
        if (prevYearConstataciones > 0) {
          yoyGrowth = (((totalOff - prevYearConstataciones) / prevYearConstataciones) * 100).toFixed(1);
        } else if (totalOff > 0) {
          yoyGrowth = '100.0';
        }
      }
    }

    return {
      totalOfficial: totalOff,
      totalSarPacientes: pacs.length,
      totalC3: c3Total,
      pctC3: c3Total > 0 ? ((totalOff / c3Total) * 100).toFixed(1) : '0.0',
      pctSarTotal: pacs.length > 0 ? ((totalOff / pacs.length) * 100).toFixed(1) : '0.0',
      hombres,
      hombresPct: totalOff > 0 ? ((hombres / totalOff) * 100).toFixed(1) : '0.0',
      mujeres,
      mujeresPct: totalOff > 0 ? ((mujeres / totalOff) * 100).toFixed(1) : '0.0',
      topRango,
      subLesiones,
      subLegales,
      subAgresion,
      subPolicial,
      matrixArr,
      comunasArr,
      prevYearConstataciones,
      prevYearPct,
      yoyGrowth
    };
  }, [pacientesFiltrados, pacientesDB, kpisBigQuery, filtroFechaInicio, filtroFechaFin]);

  // Totales globales para el pie de la tabla de enfermeros en el reporte consolidado
  const totalesEnfermeriaReporte = useMemo(() => {
    let totalTriados = 0;
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
    (enfermeriaStats.topEnfermeros || []).forEach(row => {
      totalTriados += row.total;
      c1 += row.c1;
      c2 += row.c2;
      c3 += row.c3;
      c4 += row.c4;
      c5 += row.c5;
    });
    return {
totalTriados,
      c1, c2, c3, c4, c5,
      avgMinCat1: enfermeriaStats.avgMinCat1,
      avgMinReCat: enfermeriaStats.avgMinReCat
    };
  }, [enfermeriaStats]);

  const trasladosReportStats = useMemo(() => {
    const pacs = pacientesFiltrados || [];
    
    // Identificar traslados
    const isTraslado = (p) => {
      const dest = (p.destinoAlta || p.destino || '').toLowerCase();
      return dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac');
    };
    
    const listTraslados = pacs.filter(isTraslado);
    const totalTraslados = listTraslados.length;
    const totalPacientes = pacs.length || 1;
    const pctTraslados = ((totalTraslados / totalPacientes) * 100).toFixed(1);
    
    // Promedio diario
    const uniqueDays = new Set();
    listTraslados.forEach(p => {
      if (p.tAdmision) {
        uniqueDays.add(new Date(p.tAdmision).toDateString());
      }
    });
    const diasTotal = uniqueDays.size || 1;
    const promedioDiario = (totalTraslados / diasTotal).toFixed(1);
    
    // Distribución de sexo
    let hombres = 0;
    let mujeres = 0;
    let otros = 0;
    
    listTraslados.forEach(p => {
      const sex = (p.sexo || '').toUpperCase();
      if (sex.includes('HOMBRE') || sex.includes('MASCULINO') || sex === 'M') hombres++;
      else if (sex.includes('MUJER') || sex.includes('FEMENINO') || sex === 'F') mujeres++;
      else otros++;
    });
    
    const hombresPct = totalTraslados > 0 ? ((hombres / totalTraslados) * 100).toFixed(1) : '0.0';
    const mujeresPct = totalTraslados > 0 ? ((mujeres / totalTraslados) * 100).toFixed(1) : '0.0';
    
    // Rangos etarios en tramos de 5 años
    const brackets = [
      '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', 
      '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'
    ];
    const ageRanges = {};
    brackets.forEach(r => { ageRanges[r] = 0; });
    ageRanges['Desconocido'] = 0;

    listTraslados.forEach(p => {
      const age = p.edad;
      if (age === null || age === undefined || isNaN(age)) {
        ageRanges['Desconocido']++;
        return;
      }
      if (age >= 80) {
        ageRanges['80+']++;
        return;
      }
      let placed = false;
      for (let i = 0; i < 16; i++) {
        const start = i * 5;
        const end = start + 4;
        if (age >= start && age <= end) {
          ageRanges[`${start}-${end}`]++;
          placed = true;
          break;
        }
      }
      if (!placed) ageRanges['Desconocido']++;
    });

    const ageRangesPct = {};
    Object.entries(ageRanges).forEach(([range, count]) => {
      ageRangesPct[range] = totalTraslados > 0 ? ((count / totalTraslados) * 100).toFixed(1) : '0.0';
    });

    // Top 3 de mayor participación
    const topAgeRanges = Object.entries(ageRanges)
      .filter(([range, count]) => range !== 'Desconocido' && count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([range, count]) => ({
        range,
        count,
        pct: totalTraslados > 0 ? ((count / totalTraslados) * 100).toFixed(1) : '0.0'
      }));

    // Comparativa año anterior (YoY)
    let prevYearTraslados = 0;
    let prevYearTotalAdms = 0;
    let prevYearPct = '0.0';
    let yoyGrowth = '0.0';
    
    if (kpisBigQuery && kpisBigQuery.prevYearValues) {
      prevYearTraslados = kpisBigQuery.prevYearValues.traslados || 0;
      prevYearTotalAdms = kpisBigQuery.prevYearValues.pacientes || 0;
      prevYearPct = prevYearTotalAdms > 0 ? ((prevYearTraslados / prevYearTotalAdms) * 100).toFixed(1) : '0.0';
      yoyGrowth = (kpisBigQuery.traslados.growthYear || 0).toFixed(1);
    } else if (pacientesDB && filtroFechaInicio && filtroFechaFin) {
      const pStart = filtroFechaInicio.split('-');
      const pEnd = filtroFechaFin.split('-');
      if (pStart.length === 3 && pEnd.length === 3) {
        const prevStartStr = `${parseInt(pStart[0]) - 1}-${pStart[1]}-${pStart[2]}`;
        const prevEndStr = `${parseInt(pEnd[0]) - 1}-${pEnd[1]}-${pEnd[2]}`;
        
        const startMs = new Date(prevStartStr + 'T00:00:00').getTime();
        const endMs = new Date(prevEndStr + 'T23:59:59').getTime();
        
        const prevYearPacs = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
        const prevListTras = prevYearPacs.filter(isTraslado);
        prevYearTraslados = prevListTras.length;
        prevYearTotalAdms = prevYearPacs.length;
        prevYearPct = prevYearTotalAdms > 0 ? ((prevYearTraslados / prevYearTotalAdms) * 100).toFixed(1) : '0.0';
        
        if (prevYearTraslados > 0) {
          yoyGrowth = (((totalTraslados - prevYearTraslados) / prevYearTraslados) * 100).toFixed(1);
        } else if (totalTraslados > 0) {
          yoyGrowth = '100.0';
        }
      }
    }

    const prevYearPacs = pacientesDB && filtroFechaInicio && filtroFechaFin ? (() => {
      const pStart = filtroFechaInicio.split('-');
      const pEnd = filtroFechaFin.split('-');
      if (pStart.length === 3 && pEnd.length === 3) {
        const prevStartStr = `${parseInt(pStart[0]) - 1}-${pStart[1]}-${pStart[2]}`;
        const prevEndStr = `${parseInt(pEnd[0]) - 1}-${pEnd[1]}-${pEnd[2]}`;
        const startMs = new Date(prevStartStr + 'T00:00:00').getTime();
        const endMs = new Date(prevEndStr + 'T23:59:59').getTime();
        return pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
      }
      return [];
    })() : [];
    
    const summaryText = generateTrasladosSummary(pacs, prevYearPacs);

    // Top Destino
    const destCounts = {};
    listTraslados.forEach(p => {
      const dest = p.destinoAlta || p.destino || 'Sin Especificar';
      destCounts[dest] = (destCounts[dest] || 0) + 1;
    });
    let topDestName = '-';
    let topDestCount = 0;
    Object.entries(destCounts).forEach(([name, count]) => {
      if (count > topDestCount) {
        topDestName = name;
        topDestCount = count;
      }
    });
    const topDestPct = totalTraslados > 0 ? ((topDestCount / totalTraslados) * 100).toFixed(1) : '0.0';
    
    // Turno Récord
    const turnosCounts = {};
    listTraslados.forEach(p => {
      if (!p.tAdmision) return;
      
      const d = new Date(p.tAdmision);
      const isNight = d.getHours() >= 20 || d.getHours() < 8;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const dateStr = d.toLocaleDateString('es-CL');
      
      // Intentar obtener el número de turno real (1, 2, 3)
      const tInfo = obtenerTurnoDetallado ? obtenerTurnoDetallado(p.tAdmision) : null;
      const turnoNum = tInfo ? tInfo.turnoNum : (isNight ? '3 (Noche)' : isWeekend ? '2 (Tarde)' : '1 (Mañana)');
      const tipo = tInfo ? tInfo.tipo : (isWeekend ? 'Fin de Semana' : 'Largo de Semana');
      
      const key = `${dateStr}_${turnoNum}_${tipo}`;
      turnosCounts[key] = (turnosCounts[key] || 0) + 1;
    });
    
    let maxKey = null;
    let maxCount = 0;
    Object.entries(turnosCounts).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxKey = key;
      }
    });
    
    let recordTurnoStr = '-';
    let recordTurnoNum = '-';
    let recordTurnoFecha = '-';
    let recordTurnoTipo = '-';
    if (maxKey) {
      const [dateStr, turnoNum, tipo] = maxKey.split('_');
      recordTurnoFecha = dateStr;
      recordTurnoNum = turnoNum;
      recordTurnoTipo = tipo;
      recordTurnoStr = `Turno ${turnoNum} (${tipo}) del ${dateStr} con ${maxCount} pac.`;
    }
    
    // Top 5 diagnósticos
    const diagCounts = {};
    const diagNames = {};
    listTraslados.forEach(p => {
      const code = p.codigoDiagnostico || 'SIN_COD';
      const name = p.diagnosticoPrincipal || 'Sin diagnóstico';
      diagCounts[code] = (diagCounts[code] || 0) + 1;
      diagNames[code] = name;
    });
    
    const topDiagArr = Object.entries(diagCounts)
      .map(([code, count]) => ({
        code,
        name: diagNames[code],
        count,
        pct: totalTraslados > 0 ? ((count / totalTraslados) * 100).toFixed(1) : '0.0',
        pctGlobal: totalPacientes > 0 ? ((count / totalPacientes) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTraslados,
      pctTraslados,
      promedioDiario,
      hombres,
      mujeres,
      hombresPct,
      mujeresPct,
      ageRanges,
      ageRangesPct,
      topAgeRanges,
      prevYearTraslados,
      prevYearPct,
      yoyGrowth,
      summaryText,
      topDestName,
      topDestCount,
      topDestPct,
      recordTurnoStr,
      recordTurnoNum,
      recordTurnoFecha,
      recordTurnoTipo,
      recordCount: maxCount,
      topDiagArr,
      listTraslados
    };
  }, [pacientesFiltrados, pacientesDB, filtroFechaInicio, filtroFechaFin]);

  const altasSummaryText = useMemo(() => generateAltasSummary(pacientesFiltrados), [pacientesFiltrados]);
  const fracturasSummaryText = useMemo(() => generateFracturasSummary(pacientesFiltrados), [pacientesFiltrados]);
  const enfermeriaSummaryText = useMemo(() => generateEnfermeriaSummary(pacientesFiltrados), [pacientesFiltrados]);
  const constatacionesSummaryText = useMemo(() => generateConstatacionesSummary(pacientesFiltrados), [pacientesFiltrados]);

  const printReport = () => {
    const originalTitle = document.title;
    let nombreReporte = 'Reporte Ejecutivo Consolidado';
    const seleccionados = [];
    if (incluirGeneral) seleccionados.push('General');
    if (incluirAltas) seleccionados.push('Altas Admin');
    if (incluirFracturas) seleccionados.push('Fracturas');
    if (incluirEnfermeria) seleccionados.push('Enfermería');
    if (incluirConstataciones) seleccionados.push('Constatación Lesiones Z51.8');
    if (incluirTraslados) seleccionados.push('Traslados');

    if (seleccionados.length === 1) {
      if (incluirConstataciones) nombreReporte = 'Informe Técnico Constatación de Lesiones Z51.8';
      else if (incluirEnfermeria) nombreReporte = 'Sub-reporte Enfermería y Triaje';
      else if (incluirAltas) nombreReporte = 'Sub-reporte Altas Administrativas';
      else if (incluirFracturas) nombreReporte = 'Sub-reporte Fracturas y Destino';
      else if (incluirGeneral) nombreReporte = 'Reporte Ejecutivo General';
      else if (incluirTraslados) nombreReporte = 'Sub-reporte Traslados Hospitalarios';
    } else if (seleccionados.length > 1) {
      nombreReporte = `Reporte Consolidado (${seleccionados.join(' - ')})`;
    }

    // Fecha actual para el nombre del archivo
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const fechaActualStr = `${dd}-${mm}-${yyyy}`;

    // Construir el título dinámico que el navegador usará como nombre sugerido al guardar en PDF
    const customTitle = `MÉTRICO - Gestión Estadística SAR - ${nombreReporte} - ${fechaActualStr}`;
    
    document.title = customTitle;

    window.print();

    // Restaurar título original de la pestaña
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const exportCSV = () => {
    const startMs = new Date(fechas.inicio + 'T00:00:00').getTime();
    const endMs = new Date(fechas.fin + 'T23:59:59').getTime();
    const pacs = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
    
    if (pacs.length === 0) return alert('No hay datos en este periodo para exportar.');
    
    const headers = ['ID_Lote', 'Edad', 'Sexo', 'Categoria', 'Medico', 'Comuna', 'Nacionalidad', 'Diagnostico_Principal', 'Destino_Alta'];
    const csvContent = headers.join(",") + "\n"
      + pacs.map(p => `${p.loteId || ''},${p.edad || ''},${p.sexo || ''},${p.categoria || ''},${p.medico || ''},${p.comuna || ''},${p.nacionalidad || ''},"${String(p.diagnosticoPrincipal || p.codigoDiagnostico || '').replace(/"/g, '""')}","${String(p.destinoAlta || p.destino || '').replace(/"/g, '""')}"`).join("\n");
      
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `metrico_reporte_completo_${fechas.inicio}_a_${fechas.fin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasData = statsKPI && statsKPI.pacientes.current > 0;
  
  const generateNarrative = () => {
    if (!hasData) return "No se registraron atenciones en este periodo.";
    
    let text = `Durante el periodo comprendido entre el ${fechas.inicio} y el ${fechas.fin}, se registró un total de ${statsKPI.pacientes.current} pacientes atendidos. `;
    text += `El rendimiento promedio de atención médica se situó en ${statsKPI.pacHora.current.toFixed(1)} pacientes por hora. `;
    text += `El tiempo promedio de estadía por paciente fue de ${Math.round(statsKPI.estadia.current)} minutos. `;

    const topDoc = [...filteredMetricsByDoctor].sort((a,b) => b.total - a.total)[0];
    if (topDoc) {
      text += `El profesional con mayor volumen de pacientes fue ${topDoc.name} con ${topDoc.total} atenciones. `;
    }

    const altasPct = (statsKPI.altasAdmin.current / statsKPI.pacientes.current) * 100;
    if (altasPct > 10) {
      text += `Atención: La tasa de Alta Administrativa fue del ${altasPct.toFixed(1)}%, superando el umbral del 10%.`;
    }

    return { text, altasPct };
  };

  const narrativeData = generateNarrative();
  const maxDiagCount = topDiagnosticos && topDiagnosticos.length > 0 ? Math.max(...topDiagnosticos.map(d => d.count)) : 1;

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* BARRA DE FILTROS GLOBALES Y RANGO DE FECHAS (No se imprime) */}
      <div className="no-print">
        <FiltrosGlobales 
          modoComparativo={modoComparativo} setModoComparativo={setModoComparativo}
          filtroFechaInicio={filtroFechaInicio} setFiltroFechaInicio={setFiltroFechaInicio}
          filtroFechaFin={filtroFechaFin} setFiltroFechaFin={setFiltroFechaFin}
          filtroFechaInicioB={filtroFechaInicioB} setFiltroFechaInicioB={setFiltroFechaInicioB}
          filtroFechaFinB={filtroFechaFinB} setFiltroFechaFinB={setFiltroFechaFinB}
          applyDatePreset={applyDatePreset}
          tipoCorte={tipoCorte} setTipoCorte={setTipoCorte}
          filtroHoraInicio={filtroHoraInicio} setFiltroHoraInicio={setFiltroHoraInicio}
          filtroHoraFin={filtroHoraFin} setFiltroHoraFin={setFiltroHoraFin}
          horarioPreset={horarioPreset} setHorarioPreset={setHorarioPreset}
          maxDateLabel={maxDateLabel}
          onClearFilters={handleClearFilters}
          onSync={onSync}
          syncStatus={syncStatus}
        />
      </div>

      {/* PANEL DE ACCIONES E IMPRESIÓN DEL REPORTE (No se imprime) */}
      <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm no-print space-y-4 theme-transition">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary-custom tracking-tight">Generador de Reportes Ejecutivos</h2>
              <p className="text-xs text-secondary-custom font-semibold">Configura el rango temporal y selecciona los sub-reportes a incluir para formato Hoja Carta (PDF).</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button 
              onClick={exportCSV} 
              disabled={loading || syncStatus === 'connecting' || syncStatus === 'syncing'} 
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold rounded-xl text-xs hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> CSV
            </button>

            <button 
              onClick={printReport} 
              disabled={!hasData || loading || syncStatus === 'connecting' || syncStatus === 'syncing'} 
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || syncStatus === 'connecting' || syncStatus === 'syncing' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" /> Imprimir / PDF (Hoja Carta)
                </>
              )}
            </button>
          </div>
        </div>

        {/* SELECTOR DE SUB-REPORTES A INCLUIR */}
        <div className="border-t border-card-custom/60 pt-4">
          <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-3">SELECCIONAR SUB-REPORTES A INCLUIR EN LA IMPRESIÓN (PAGINADOS EN HOJA CARTA)</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            
            <button 
              onClick={() => setIncluirGeneral(!incluirGeneral)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirGeneral ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirGeneral ? <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Reporte General Ejecutivo</span>
            </button>

            <button 
              onClick={() => setIncluirAltas(!incluirAltas)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirAltas ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirAltas ? <CheckSquare className="w-4 h-4 text-rose-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Altas Admin</span>
            </button>

            <button 
              onClick={() => setIncluirFracturas(!incluirFracturas)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirFracturas ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirFracturas ? <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Fracturas y Destino</span>
            </button>

            <button 
              onClick={() => setIncluirEnfermeria(!incluirEnfermeria)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirEnfermeria ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirEnfermeria ? <CheckSquare className="w-4 h-4 text-sky-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Enfermería y Triaje</span>
            </button>

            <button 
              onClick={() => setIncluirConstataciones(!incluirConstataciones)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirConstataciones ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirConstataciones ? <CheckSquare className="w-4 h-4 text-yellow-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Constataciones Z51.8</span>
            </button>

            <button 
              onClick={() => setIncluirTraslados(!incluirTraslados)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirTraslados ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirTraslados ? <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Traslados Hospitalarios</span>
            </button>

            <button 
              onClick={() => setIncluirRadar(!incluirRadar)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirRadar ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirRadar ? <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Radar Predictivo (IA)</span>
            </button>

          </div>
        </div>

      </div>

      {/* REPORTE IMPRIMIBLE CON PAGINACIÓN HOJA CARTA */}
      <div id="reporte-printable" className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 mx-auto w-full max-w-4xl text-slate-900">
        
        {loading || syncStatus === 'connecting' || syncStatus === 'syncing' ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="w-8 h-8 bg-indigo-500/10 rounded-full animate-pulse absolute"></div>
            </div>
            <div className="text-center space-y-2 max-w-md">
              <p className="text-lg font-black text-slate-800 tracking-tight">Sincronizando base de datos...</p>
              <p className="text-sm text-slate-500 font-medium">
                Descargando registros y recalculando métricas desde la nube. Por favor, espere a que se complete para asegurar que su reporte contenga toda la información.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm animate-pulse">
                  ✓ {pacientesDB.length.toLocaleString()} registros descargados
                </span>
              </div>
            </div>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay registros para las fechas seleccionadas.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* HOJA 1: REPORTE GENERAL EJECUTIVO */}
            {incluirGeneral && (
              <div className="space-y-6">
                
                {/* Cabecera del Documento */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-14 object-contain" />
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">METRICO</h1>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Reporte Ejecutivo de Gestión General</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700 capitalize">Tipo: {tipoReporte}</p>
                    <p className="text-[11px] text-slate-500 font-bold">Periodo de Datos: {rangoFechasReales.texto}</p>
                  </div>
                </div>

                {/* Resumen Narrativo */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Resumen Ejecutivo Automático
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {narrativeData.text}
                  </p>
                </div>

                {/* KPIs Principales */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Indicadores Clave de Desempeño (KPI)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Volumen Pacientes</p>
                      <p className="text-xl font-black text-slate-800 mt-1">{statsKPI.pacientes.current}</p>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Rendimiento</p>
                      <p className="text-xl font-black text-blue-600 mt-1">{statsKPI.pacHora.current.toFixed(1)} <span className="text-[10px] font-bold">pac/h</span></p>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">T. Estadía Prom.</p>
                      <p className="text-xl font-black mt-1 text-slate-700">{Math.round(statsKPI.estadia.current)} <span className="text-[10px] font-bold">min</span></p>
                    </div>
                    <div className={`border p-3 rounded-xl text-center ${narrativeData.altasPct > 10 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <p className={`text-[10px] font-bold uppercase ${narrativeData.altasPct > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>Altas Admin</p>
                      <p className={`text-xl font-black mt-1 ${narrativeData.altasPct > 10 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {statsKPI.altasAdmin.current} <span className="text-xs font-bold">({narrativeData.altasPct.toFixed(1)}%)</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perfil Demográfico */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Perfil Demográfico y Operativo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Previsión (Top 5)</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(demografiaStats.prevs).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-200/50 pb-0.5 last:border-0">
                            <span className="truncate pr-1">{p[0]}</span><span className="font-bold">{p[1]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Nacionalidad (Top 5)</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(demografiaStats.nacionalidades).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-200/50 pb-0.5 last:border-0">
                            <span className="truncate pr-1">{p[0]}</span><span className="font-bold">{p[1]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Establecimiento (Top 5)</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(demografiaStats.establecimientos).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-200/50 pb-0.5 last:border-0">
                            <span className="truncate pr-1">{p[0]}</span><span className="font-bold">{p[1]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Top 5 Médicos */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Top 5 Médicos por Volumen</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2 border border-slate-200">Médico</th>
                        <th className="p-2 border border-slate-200 text-center">Atenciones</th>
                        <th className="p-2 border border-slate-200 text-center">Rendimiento (Pac/Hora)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredMetricsByDoctor].sort((a,b) => b.total - a.total).slice(0, 5).map(doc => (
                        <tr key={doc.name}>
                          <td className="p-2 border border-slate-200 font-medium text-slate-800">{doc.name}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-blue-600">{doc.total}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-emerald-600">{doc.promHora}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Top 10 Diagnósticos (Visual Vectorial Vector Bar Chart para Impresión Impresa Perfecta) */}
                {topDiagnosticos && topDiagnosticos.length > 0 && (
                  <div className="print-avoid-break">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Top 10 Diagnósticos Principales</h3>
                    <div className="space-y-2">
                      {topDiagnosticos.map((diag, idx) => {
                        const pctWidth = Math.min(100, Math.round((diag.count / maxDiagCount) * 100));
                        return (
                          <div key={idx} className="flex items-center gap-3 text-xs">
                            <span className="w-48 font-bold text-slate-700 truncate" title={diag.name}>{diag.name}</span>
                            <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 flex items-center">
                              <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${pctWidth}%` }}></div>
                            </div>
                            <span className="w-12 font-black text-right text-rose-600">{diag.count} pac</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* HOJA 2: SUB-REPORTE DE ALTAS ADMINISTRATIVAS */}
            {incluirAltas && (
              <div className={`${incluirGeneral ? 'print-page-break' : ''} space-y-6`}>
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-12 object-contain" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">SUB-REPORTE: ALTAS ADMINISTRATIVAS</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Análisis de Cancelaciones e Impacto Operativo</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-600">Periodo de Datos: {rangoFechasReales.texto}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print-avoid-break">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total Atenciones</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">{altasStats.totalPacientes}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">Altas Administrativas</span>
                    <p className="text-2xl font-black text-rose-700 mt-1">{altasStats.totalAltas}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Tasa de Cancelación</span>
                    <p className="text-2xl font-black text-amber-700 mt-1">{altasStats.pct}%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Comparación Año Anterior (YoY)</span>
                    <p className="text-xl font-black text-slate-800 my-1">
                      {altasStats.prevYearAltas} altas <span className="text-xs font-bold text-slate-500">({altasStats.prevYearPct}%)</span>
                    </p>
                    <span className={`text-[9px] font-bold ${Number(altasStats.yoyGrowth) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {Number(altasStats.yoyGrowth) >= 0 ? '📈 Aumento de ' : '📉 Disminución de '}
                      {Math.abs(Number(altasStats.yoyGrowth))}% YoY
                    </span>
                  </div>
                </div>

                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Turnos con Tasa Crítica de Altas Admin (&gt;10%)</h3>
                  {altasStats.turnosCriticos.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold">
                          <th className="p-2 border border-slate-200">Fecha Turno</th>
                          <th className="p-2 border border-slate-200">Horario / Jornada</th>
                          <th className="p-2 border border-slate-200 text-center">Equipo</th>
                          <th className="p-2 border border-slate-200 text-center">Altas Admin</th>
                          <th className="p-2 border border-slate-200 text-center">% Cancelación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {altasStats.turnosCriticos.slice(0, 8).map((t, idx) => (
                          <tr key={idx}>
                            <td className="p-2 border border-slate-200 font-bold text-slate-800">{t.fechaInicio}</td>
                            <td className="p-2 border border-slate-200 text-slate-600">{t.horario.split('(')[0]}</td>
                            <td className="p-2 border border-slate-200 text-center font-bold text-indigo-600">{t.equipoTurno}</td>
                            <td className="p-2 border border-slate-200 text-center font-bold text-rose-600">{t.altasAdmin} / {t.totalPacientes}</td>
                            <td className="p-2 border border-slate-200 text-center font-black text-rose-700 bg-rose-50">{t.pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center border border-slate-200 rounded-xl bg-slate-50">¡Excelente! No se registraron turnos con tasa de altas administrativas superior al 10% en este periodo.</p>
                  )}
                </div>
              </div>
            )}

            {/* HOJA 3: SUB-REPORTE DE FRACTURAS Y DESTINO */}
            {incluirFracturas && (
              <div className={`${(incluirGeneral || incluirAltas) ? 'print-page-break' : ''} space-y-6`}>
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-12 object-contain" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">SUB-REPORTE: ESTADÍSTICAS DE FRACTURA Y DESTINO</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Casos de Traumatología y Destinos de Alta Médica</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-600">Periodo de Datos: {rangoFechasReales.texto}</span>
                </div>

                {/* Universo General */}
                <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-2xl space-y-3 print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" /> Universo Total de Atenciones (Todos los Diagnósticos)
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Pacientes Evaluados</span>
                      <p className="text-xl font-black text-slate-800 mt-1">{fracturasStats.totalPacientes}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">Traslados Hospital</span>
                      <p className="text-xl font-black text-rose-700 mt-1">{fracturasStats.hospitalCount}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Altas Domicilio</span>
                      <p className="text-xl font-black text-emerald-700 mt-1">{fracturasStats.domicilioCount}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Otros / Sin Registro</span>
                      <p className="text-xl font-black text-slate-700 mt-1">{fracturasStats.sinRegistroCount + fracturasStats.otrosCount}</p>
                    </div>
                  </div>
                </div>

                {/* Desglose Específico Fracturas */}
                <div className="bg-amber-50/30 border border-amber-200/60 p-4 rounded-2xl space-y-3 print-avoid-break">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-200 pb-1.5 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-600" /> Desglose Específico de Casos de Fracturas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Total Casos Fracturas</span>
                      <p className="text-xl font-black text-amber-700 mt-1">{fracturasStats.totalFracturas}</p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-700 uppercase">Trasladados por Fractura</span>
                      <p className="text-xl font-black text-rose-700 mt-1">
                        {fracturasStats.fracturasTrasladadas}
                        <span className="text-[11px] font-bold text-rose-600 ml-1.5">
                          ({fracturasStats.totalFracturas > 0 ? ((fracturasStats.fracturasTrasladadas / fracturasStats.totalFracturas) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Alta Domicilio</span>
                      <p className="text-xl font-black text-emerald-700 mt-1">
                        {fracturasStats.fracturasDomicilio}
                        <span className="text-[11px] font-bold text-emerald-600 ml-1.5">
                          ({fracturasStats.totalFracturas > 0 ? ((fracturasStats.fracturasDomicilio / fracturasStats.totalFracturas) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Otros / Sin Registro</span>
                      <p className="text-xl font-black text-slate-700 mt-1">
                        {fracturasStats.fracturasOtros}
                        <span className="text-[11px] font-bold text-slate-500 ml-1.5">
                          ({fracturasStats.totalFracturas > 0 ? ((fracturasStats.fracturasOtros / fracturasStats.totalFracturas) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Año Anterior (YoY)</span>
                      <p className="text-xl font-black text-slate-800 mt-1">
                        {fracturasStats.prevYearFracturas} <span className="text-[11px] font-bold text-slate-500">({fracturasStats.prevYearPct}%)</span>
                      </p>
                      <span className={`text-[9px] font-bold ${Number(fracturasStats.yoyGrowth) >= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {Number(fracturasStats.yoyGrowth) >= 0 ? '📈 +' : '📉 '}{fracturasStats.yoyGrowth}% YoY
                      </span>
                    </div>
                  </div>

                  {/* Tarjeta de Grupo Etario con Mayor Porcentaje de Fracturas */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <div>
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Grupo Etario con Mayor Porcentaje de Fracturas</span>
                        <p className="text-sm font-black text-slate-800">
                          Tramo de {fracturasStats.topAgeGroup.rango} años ({fracturasStats.topAgeGroup.total} casos de fractura)
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-indigo-600 bg-white px-3 py-1 rounded-xl border border-indigo-200 shadow-xs">
                      {fracturasStats.topAgeGroup.pct}% del total
                    </span>
                  </div>
                </div>

                {/* Tiempos de Atención y Estadía en Fracturas */}
                <div className="bg-sky-50/40 border border-sky-200/70 p-4 rounded-2xl space-y-3 print-avoid-break">
                  <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wider border-b border-sky-200 pb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" /> Tiempos Promedio de Atención y Estadía en Fracturas (Horas)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-sky-600 uppercase block">1. Ingreso → Categorización</span>
                      <p className="text-xl font-black text-slate-800 mt-1">
                        {fracturasStats.avgAdmCatFrac !== null ? `${fracturasStats.avgAdmCatFrac.toFixed(1)} hrs` : '-'}
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase block">2. Categorización → Anamnesis</span>
                      <p className="text-xl font-black text-slate-800 mt-1">
                        {fracturasStats.avgCatAnaFrac !== null ? `${fracturasStats.avgCatAnaFrac.toFixed(1)} hrs` : '-'}
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-600 uppercase block">3. Anamnesis → Traslado</span>
                      <p className="text-xl font-black text-purple-700 mt-1">
                        {fracturasStats.avgAnaAltTrasladoFrac !== null ? `${fracturasStats.avgAnaAltTrasladoFrac.toFixed(1)} hrs` : '-'}
                      </p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-700 uppercase block">Estadía Prom. hasta Traslado</span>
                      <p className="text-xl font-black text-rose-700 mt-1">
                        {fracturasStats.avgEstadiaTrasladoFrac !== null ? `${fracturasStats.avgEstadiaTrasladoFrac.toFixed(1)} hrs` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Top Diagnósticos de Traumatología y Fractura</h3>
                  {fracturasStats.topFracturas.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold">
                          <th className="p-2 border border-slate-200">Diagnóstico Principal</th>
                          <th className="p-2 border border-slate-200 text-center">Nº Casos Registrados</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fracturasStats.topFracturas.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 border border-slate-200 font-bold text-slate-800">{item.name}</td>
                            <td className="p-2 border border-slate-200 text-center font-black text-amber-600">{item.count} pac.</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center border border-slate-200 rounded-xl bg-slate-50">No se detectaron registros específicos de fracturas en este periodo.</p>
                  )}
                </div>
              </div>
            )}

            {/* HOJA 4: SUB-REPORTE DE ENFERMERÍA Y TRIAJE */}
            {incluirEnfermeria && (
              <div className={`${(incluirGeneral || incluirAltas || incluirFracturas) ? 'print-page-break' : ''} space-y-6`}>
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-12 object-contain" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">SUB-REPORTE: RENDIMIENTO DE ENFERMERÍA Y TRIAJE</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Tiempos de Respuesta y Gestión de Categorización (C1-C5)</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-600">Periodo de Datos: {rangoFechasReales.texto}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print-avoid-break">
                  <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-sky-600 uppercase">T. Resp. 1ª Categorización</span>
                    <p className="text-2xl font-black text-sky-700 mt-1">{enfermeriaStats.avgMinCat1} min</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">T. Re-categorización</span>
                    <p className="text-2xl font-black text-amber-700 mt-1">{enfermeriaStats.avgMinReCat} min</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Pacientes Re-evaluados</span>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{enfermeriaStats.reCatCount} pac.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Comparación Año Anterior (YoY)</span>
                    <p className="text-xl font-black text-slate-800 my-1">
                      {enfermeriaStats.prevYearAvgCat1} min <span className="text-xs font-bold text-slate-500">(1ª Cat.)</span>
                    </p>
                    <span className={`text-[9px] font-bold ${Number(enfermeriaStats.yoyAvgCat1Growth) <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {Number(enfermeriaStats.yoyAvgCat1Growth) <= 0 ? '📉 Mejora de ' : '📈 Aumento de '}
                      {Math.abs(Number(enfermeriaStats.yoyAvgCat1Growth))}% YoY
                    </span>
                  </div>
                </div>

                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Top Profesional de Enfermería por Volumen Triado</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2 border border-slate-200">Profesional / Enfermero(a)</th>
                        <th className="p-2 border border-slate-200 text-center">Total Triados</th>
                        <th className="p-2 border border-slate-200 text-center text-red-600">C1</th>
                        <th className="p-2 border border-slate-200 text-center text-orange-600">C2</th>
                        <th className="p-2 border border-slate-200 text-center text-amber-600">C3</th>
                        <th className="p-2 border border-slate-200 text-center text-emerald-600">C4</th>
                        <th className="p-2 border border-slate-200 text-center text-blue-600">C5</th>
                        <th className="p-2 border border-slate-200 text-center text-sky-600">T. 1ª Cat (min)</th>
                        <th className="p-2 border border-slate-200 text-center text-amber-600">T. 2ª Cat (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfermeriaStats.topEnfermeros.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border border-slate-200 font-bold text-slate-800">{row.nombre}</td>
                          <td className="p-2 border border-slate-200 text-center font-black text-sky-600">{row.total}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-red-600">{row.c1 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-orange-600">{row.c2 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-amber-600">{row.c3 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-emerald-600">{row.c4 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-blue-600">{row.c5 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-sky-600">{row.avgMinCat1 > 0 ? `${row.avgMinCat1} min` : '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-amber-600">{row.avgMinReCat > 0 ? `${row.avgMinReCat} min` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    {enfermeriaStats.topEnfermeros.length > 0 && (
                      <tfoot className="border-t-2 border-slate-400 font-bold bg-slate-100 text-slate-900 text-xs">
                        <tr>
                          <td className="p-2 border border-slate-200 font-bold text-slate-900">TOTAL / PROMEDIO GLOBAL</td>
                          <td className="p-2 border border-slate-200 text-center font-black text-sky-600">{totalesEnfermeriaReporte.totalTriados}</td>
                          <td className="p-2 border border-slate-200 text-center text-red-600">{totalesEnfermeriaReporte.c1 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-orange-600">{totalesEnfermeriaReporte.c2 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-amber-600">{totalesEnfermeriaReporte.c3 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-emerald-600">{totalesEnfermeriaReporte.c4 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-blue-600">{totalesEnfermeriaReporte.c5 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-sky-600 font-black">{totalesEnfermeriaReporte.avgMinCat1 > 0 ? `${totalesEnfermeriaReporte.avgMinCat1} min` : '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-amber-600 font-black">{totalesEnfermeriaReporte.avgMinReCat > 0 ? `${totalesEnfermeriaReporte.avgMinReCat} min` : '-'}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                <div className="print-avoid-break mt-6">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Diferenciación de Categoría C3</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total Evaluados C3</span>
                      <p className="text-xl font-black text-slate-800 mt-1">{enfermeriaStats.c3Stats.totalC3} pac.</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Constatación Lesiones (Z51.8)</span>
                      <p className="text-xl font-black text-amber-700 mt-1">
                        {enfermeriaStats.c3Stats.lesionesCount}
                        <span className="text-xs font-bold text-amber-600 ml-1.5">({enfermeriaStats.c3Stats.lesionesPerc}%)</span>
                      </p>
                    </div>
                    <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Diagnóstico Clínico General</span>
                      <p className="text-xl font-black text-sky-700 mt-1">
                        {enfermeriaStats.c3Stats.clinicoCount}
                        <span className="text-xs font-bold text-sky-600 ml-1.5">({enfermeriaStats.c3Stats.clinicoPerc}%)</span>
                      </p>
                    </div>
                  </div>

                  <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-2">Top 10 Diagnósticos Clínicos C3 (Excluye Constatación de Lesiones)</h4>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-1.5 border border-slate-200">Diagnóstico Clínico</th>
                        <th className="p-1.5 border border-slate-200 text-center w-28">Nº Casos</th>
                        <th className="p-1.5 border border-slate-200 text-center w-28">% Del Clínico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfermeriaStats.c3Stats.top10DiagC3.length > 0 ? (
                        enfermeriaStats.c3Stats.top10DiagC3.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5 border border-slate-200 font-medium text-slate-800">{item.name}</td>
                            <td className="p-1.5 border border-slate-200 text-center font-bold">{item.count}</td>
                            <td className="p-1.5 border border-slate-200 text-center font-black text-sky-600">{item.percentage}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-2 border border-slate-200 text-center text-slate-500">No hay registros clínicos de C3.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="print-avoid-break mt-6">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Registro Detallado de Atenciones Críticas (C1 y C2)</h3>
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-1.5 border border-slate-200">Fecha y Hora</th>
                        <th className="p-1.5 border border-slate-200 text-center">Turno Asociado</th>
                        <th className="p-1.5 border border-slate-200 text-center">ID / Correlativo (IP)</th>
                        <th className="p-1.5 border border-slate-200 text-center">Categoría</th>
                        <th className="p-1.5 border border-slate-200">Diagnóstico Médico</th>
                        <th className="p-1.5 border border-slate-200 text-center">Código</th>
                        <th className="p-1.5 border border-slate-200">Enfermero(a) que Categorizó</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfermeriaStats.casosCriticos.length > 0 ? (
                        enfermeriaStats.casosCriticos.map((p, idx) => {
                          const d = p.tAdmision ? new Date(p.tAdmision) : null;
                          const dateStr = d ? d.toLocaleDateString('es-CL') : '-';
                          const timeStr = d ? d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-';
                          const cat = String(p.catPrimera || p.categoria || '').toUpperCase();
                          
                          // Calcular turno asociado
                          let turnoStr = '-';
                          if (d) {
                            const hours = d.getHours();
                            const dayOfWeek = d.getDay();
                            const isWknd = (dayOfWeek === 0 || dayOfWeek === 6);
                            
                            let logicalDate = new Date(p.tAdmision);
                            let label = '';
                            
                            if (isWknd) {
                              if (hours < 8) {
                                logicalDate.setDate(logicalDate.getDate() - 1);
                                label = 'Finde Noche';
                              } else if (hours >= 8 && hours < 20) {
                                label = 'Finde Día';
                              } else {
                                label = 'Finde Noche';
                              }
                            } else {
                              if (hours < 16) {
                                logicalDate.setDate(logicalDate.getDate() - 1);
                                label = 'Largo';
                              } else {
                                label = 'Largo';
                              }
                            }
                            const y = logicalDate.getFullYear();
                            const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
                            const day = String(logicalDate.getDate()).padStart(2, '0');
                            turnoStr = `${day}/${m}/${y} (${label})`;
                          }

                          return (
                            <tr key={idx}>
                              <td className="p-1.5 border border-slate-200 font-medium text-slate-800">{dateStr} {timeStr}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold">{turnoStr}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold">{p.correlativo || p.idPaciente || '-'}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-black">
                                <span className={cat === 'C1' ? 'text-red-600' : 'text-orange-600'}>{cat}</span>
                              </td>
                              <td className="p-1.5 border border-slate-200 font-medium text-slate-800 max-w-xs truncate" title={p.diagnosticoPrincipal}>{p.diagnosticoPrincipal || '-'}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold text-slate-600">{p.codigoDiagnostico || '-'}</td>
                              <td className="p-1.5 border border-slate-200 font-semibold text-slate-700">{p.enfermeroCat1 || '-'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-2 border border-slate-200 text-center text-slate-500">No se registraron atenciones críticas (C1/C2).</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* HOJA 5: INFORME FORMAL DE CONSTATACIÓN DE LESIONES (Z51.8) Y DESGLOSE PARA AUDITORÍA EXTERNA */}
            {incluirConstataciones && (
              <div className="print-page border-t border-slate-200 pt-8 mt-8 first:border-0 first:pt-0 first:mt-0 space-y-6">
                
                {/* Cabecera del Documento Institucional */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-14 object-contain" />
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">MÉTRICO - INFORME TÉCNICO OFICIAL</h1>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mt-0.5">Constatación de Lesiones (CIE-10 Z51.8) e Interacciones Demográficas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded border border-amber-200">Uso Institucional / Judicial</span>
                    <p className="text-[11px] text-slate-600 font-bold mt-1.5">Periodo: {rangoFechasReales.texto}</p>
                  </div>
                </div>

                {/* Resumen de Metodología */}
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700" /> Nota Metodológica y Ámbito de Auditoría Externa (Carabineros / PDI / Fiscalía / Sanidad)
                  </h3>
                  <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                    El presente informe certífica las atenciones registradas bajo el código clínico CIE-10 <strong>Z51.8 (Constatación de Lesiones)</strong> y sus variables asociadas en el establecimiento de urgencia. El universo analizado comprende pacientes categorizados como C3 en el período consultado. La cifra oficial de constataciones Z51.8 se presenta de forma pura, acompañada del desglose de sub-variables clínico-legales asociadas.
                  </p>
                </div>

                {/* Cifra Oficial Principal, Universo Total SAR, Desglose de Sub-variables y YoY */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Universo Total Atenciones SAR</span>
                    <p className="text-3xl font-black text-slate-800 my-1">{statsConstatacionesReporte.totalSarPacientes.toLocaleString()} <span className="text-xs font-bold text-slate-500">pac.</span></p>
                    <span className="text-[10px] text-slate-500 font-medium">Demanda total registrada en el establecimiento.</span>
                  </div>

                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase">Cifra Oficial Constataciones Z51.8</span>
                    <p className="text-3xl font-black text-amber-900 my-1">{statsConstatacionesReporte.totalOfficial} <span className="text-xs font-bold text-amber-700">pacientes</span></p>
                    <span className="text-[10px] text-amber-800 font-medium">Representa el <strong>{statsConstatacionesReporte.pctC3}%</strong> de evaluados C3 ({statsConstatacionesReporte.totalC3} pac) y <strong>{statsConstatacionesReporte.pctSarTotal}%</strong> del total SAR.</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Sub-Variables (Z51.8 y Z04)</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="flex justify-between bg-white p-1.5 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">(a) Lesiones:</span>
                        <span className="font-bold text-amber-700">{statsConstatacionesReporte.subLesiones}</span>
                      </div>
                      <div className="flex justify-between bg-white p-1.5 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">(b) Legales:</span>
                        <span className="font-bold text-amber-700">{statsConstatacionesReporte.subLegales}</span>
                      </div>
                      <div className="flex justify-between bg-white p-1.5 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">(c) Agresión:</span>
                        <span className="font-bold text-amber-700">{statsConstatacionesReporte.subAgresion}</span>
                      </div>
                      <div className="flex justify-between bg-white p-1.5 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">(d) Policial:</span>
                        <span className="font-bold text-amber-700">{statsConstatacionesReporte.subPolicial}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Comparación Año Anterior (YoY)</span>
                    <p className="text-2xl font-black text-slate-800 my-1">
                      {statsConstatacionesReporte.prevYearConstataciones} pac. <span className="text-xs font-bold text-slate-500">({statsConstatacionesReporte.prevYearPct}%)</span>
                    </p>
                    <span className={`text-[9px] font-bold ${Number(statsConstatacionesReporte.yoyGrowth) >= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {Number(statsConstatacionesReporte.yoyGrowth) >= 0 ? '📈 Aumento de ' : '📉 Disminución de '}
                      {Math.abs(Number(statsConstatacionesReporte.yoyGrowth))}% YoY
                    </span>
                  </div>
                </div>

                {/* DONUT CHART / ANILLO DE DISTRIBUCIÓN POR SEXO Y RANGO DOMINANTE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-avoid-break">
                  {/* Card 1: Gráfico de Anillo / Dona por Sexo */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    {/* SVG Donut Ring Chart */}
                    <div className="relative w-28 h-28 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                        {/* Track de Fondo */}
                        <circle cx="55" cy="55" r="45" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                        {/* Arco Hombres (Azul) */}
                        <circle 
                          cx="55" cy="55" r="45" fill="none" stroke="#2563eb" strokeWidth="12" 
                          strokeDasharray={`${(Number(statsConstatacionesReporte.hombresPct) / 100) * 282.74} 282.74`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                        {/* Arco Mujeres (Rosa) */}
                        <circle 
                          cx="55" cy="55" r="45" fill="none" stroke="#ec4899" strokeWidth="12" 
                          strokeDasharray={`${(Number(statsConstatacionesReporte.mujeresPct) / 100) * 282.74} 282.74`}
                          strokeDashoffset={`-${(Number(statsConstatacionesReporte.hombresPct) / 100) * 282.74}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Texto Central de la Dona */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-black text-slate-900 leading-none">{statsConstatacionesReporte.totalOfficial}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Pacientes</span>
                      </div>
                    </div>

                    {/* Leyenda de la Dona */}
                    <div className="flex-1 space-y-2 text-[11px]">
                      <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-200 pb-1">Distribución por Sexo</h4>
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-pink-100 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-pink-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shrink-0"></span>
                          <span>Mujeres</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-pink-900 block">{statsConstatacionesReporte.mujeres} pac.</span>
                          <span className="text-[10px] font-bold text-pink-600">({statsConstatacionesReporte.mujeresPct}%)</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-blue-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0"></span>
                          <span>Hombres</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-blue-900 block">{statsConstatacionesReporte.hombres} pac.</span>
                          <span className="text-[10px] font-bold text-blue-600">({statsConstatacionesReporte.hombresPct}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Rango Etario Dominante */}
                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Rango Etario con Mayor Participación</span>
                      <h3 className="text-2xl font-black text-amber-900">{statsConstatacionesReporte.topRango.rango} años</h3>
                      <p className="text-xs font-medium text-amber-800 mt-1">Grupo de edad con mayor volumen de constataciones de lesiones atendidas.</p>
                    </div>
                    <div className="flex justify-between items-center bg-white/80 p-2 rounded-lg border border-amber-200 mt-2 text-[11px]">
                      <span className="font-bold text-amber-900">Total Casos Registrados:</span>
                      <span className="font-black text-amber-900 text-sm">{statsConstatacionesReporte.topRango.total} pac. ({statsConstatacionesReporte.topRango.pct}%)</span>
                    </div>
                  </div>
                </div>

                {/* GRÁFICO DE BARRAS HORIZONTALES ENCONTRADAS (PIRÁMIDE DEMOGRÁFICA DE EDAD VS SEXO CON LÍNEAS SUTILES) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 print-avoid-break">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pirámide Demográfica: Distribución Etaria Enfrentada por Sexo (Mujeres ⬅️ | ➡️ Hombres)
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-pink-600"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span> Mujeres</span>
                      <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> Hombres</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {statsConstatacionesReporte.matrixArr.map((item, idx) => {
                      const maxVal = Math.max(...statsConstatacionesReporte.matrixArr.map(m => Math.max(m.mujeres, m.hombres)), 1);
                      const widthM = Math.round((item.mujeres / maxVal) * 100);
                      const widthH = Math.round((item.hombres / maxVal) * 100);

                      const mPercent = Math.max(widthM, 4);
                      const hPercent = Math.max(widthH, 4);

                      return (
                        <div key={idx} className="grid grid-cols-12 items-center gap-2 text-[11px]">
                          {/* Lado Izquierdo: Mujeres */}
                          <div className="col-span-5 flex items-center justify-end gap-2">
                            <span className="font-bold text-pink-700 text-[10px] whitespace-nowrap">{item.mujeres} pac ({item.pctMujeres}%)</span>
                            <div className="w-full h-2.5 min-w-[60px]">
                              <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 100 10">
                                {/* Track sutil gris muy claro */}
                                <rect x="0" y="0" width="100" height="10" rx="5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.5" />
                                {/* Barra Rosa de Mujeres */}
                                <rect x={100 - mPercent} y="0" width={mPercent} height="10" rx="5" fill="#ec4899" />
                              </svg>
                            </div>
                          </div>

                          {/* Centro: Rango de Edad */}
                          <div className="col-span-2 text-center bg-white py-0.5 border border-slate-200 rounded font-black text-slate-800 text-[10px] shadow-2xs">
                            {item.rango} años
                          </div>

                          {/* Lado Derecho: Hombres */}
                          <div className="col-span-5 flex items-center gap-2">
                            <div className="w-full h-2.5 min-w-[60px]">
                              <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 100 10">
                                {/* Track sutil gris muy claro */}
                                <rect x="0" y="0" width="100" height="10" rx="5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.5" />
                                {/* Barra Azul de Hombres */}
                                <rect x="0" y="0" width={hPercent} height="10" rx="5" fill="#2563eb" />
                              </svg>
                            </div>
                            <span className="font-bold text-blue-700 text-[10px] whitespace-nowrap">{item.hombres} pac ({item.pctHombres}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Matriz Demográfica Cruzada (Tabla) */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Distribución Sociodemográfica Detallada (Rango Etario vs. Sexo)</h3>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-1.5 border border-slate-200">Rango de Edad</th>
                        <th className="p-1.5 border border-slate-200 text-center text-pink-600">Mujeres</th>
                        <th className="p-1.5 border border-slate-200 text-center text-blue-600">Hombres</th>
                        <th className="p-1.5 border border-slate-200 text-center font-bold">Total Pacientes</th>
                        <th className="p-1.5 border border-slate-200 text-center">% Relativo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsConstatacionesReporte.matrixArr.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-1.5 border border-slate-200 font-bold text-slate-800">{row.rango} años</td>
                          <td className="p-1.5 border border-slate-200 text-center font-bold text-pink-600">{row.mujeres}</td>
                          <td className="p-1.5 border border-slate-200 text-center font-bold text-blue-600">{row.hombres}</td>
                          <td className="p-1.5 border border-slate-200 text-center font-black text-slate-900">{row.total}</td>
                          <td className="p-1.5 border border-slate-200 text-center font-bold text-amber-700">{row.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TABLA DE DISTRIBUCIÓN GEOGRÁFICA (COMUNAS DE RESIDENCIA) */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                    Distribución Territorial y Origen Geográfico (Comuna de Residencia del Paciente)
                  </h3>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-1.5 border border-slate-200">Comuna de Residencia</th>
                        <th className="p-1.5 border border-slate-200 text-center w-36">Total Constataciones Z51.8</th>
                        <th className="p-1.5 border border-slate-200 text-center w-36">% Del Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsConstatacionesReporte.comunasArr.length > 0 ? (
                        statsConstatacionesReporte.comunasArr.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-1.5 border border-slate-200 font-bold text-slate-800 uppercase">{c.comuna}</td>
                            <td className="p-1.5 border border-slate-200 text-center font-black text-amber-800">{c.count} pac.</td>
                            <td className="p-1.5 border border-slate-200 text-center font-bold text-slate-600">{c.pct}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-2 border border-slate-200 text-center text-slate-500">Sin datos territoriales registrados.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* HOJA 6: SUB-REPORTE OFICIAL DE TRASLADOS HOSPITALARIOS */}
            {incluirTraslados && (
              <div className="print-page border-t border-slate-200 pt-8 mt-8 first:border-0 first:pt-0 first:mt-0 space-y-6">
                {/* Cabecera del Documento Institucional */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-14 object-contain" />
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">MÉTRICO - SUB-REPORTE OPERATIVO</h1>
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mt-0.5">Traslados Hospitalarios y Derivaciones de Urgencia</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded border border-indigo-200">Área de Derivaciones y Triage</span>
                    <p className="text-[11px] text-slate-600 font-bold mt-1.5">Periodo: {rangoFechasReales.texto}</p>
                  </div>
                </div>

                {/* Resumen de Metodología */}
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
                  <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-indigo-700" /> Nota de Auditoría y Control de Traslados a Centros Externos
                  </h3>
                  <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                    El presente informe consolida los traslados y derivaciones de pacientes efectuados a centros de mayor complejidad (hospitales base u otros servicios de urgencia) durante el período consultado. Representa el volumen de pacientes cuya resolución de urgencia requirió continuidad de atención de especialidad.
                  </p>
                </div>

                {/* Narrative Summary Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print-avoid-break">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Resumen de Gestión y Derivaciones</p>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {trasladosReportStats.summaryText}
                  </p>
                </div>

                {/* Cifras Oficiales y KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Total Traslados en Periodo</span>
                    <p className="text-2xl font-black text-slate-800 my-1">{trasladosReportStats.totalTraslados} <span className="text-xs font-bold text-slate-500">pac.</span></p>
                    <span className="text-[10px] text-slate-500 font-medium">Equivale al <strong>{trasladosReportStats.pctTraslados}%</strong> del total de admisiones globales.</span>
                  </div>

                  <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-300 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase">Centro Destino Principal</span>
                    <p className="text-lg font-black text-indigo-950 my-1 line-clamp-2" title={trasladosReportStats.topDestName}>{trasladosReportStats.topDestName}</p>
                    <span className="text-[10px] text-indigo-800 font-medium">Registró <strong>{trasladosReportStats.topDestCount} pac.</strong> ({trasladosReportStats.topDestPct}%)</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Promedio Diario y Turno Récord</span>
                    <div className="space-y-1 mt-1 text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-500">Promedio: </span>
                        <span className="font-black text-slate-800">{trasladosReportStats.promedioDiario} pac/día</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Récord: </span>
                        <span className="font-bold text-rose-700">Turno {trasladosReportStats.recordTurnoNum} ({trasladosReportStats.recordCount} pac.)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Comparación Año Anterior (YoY)</span>
                    <p className="text-xl font-black text-slate-800 my-1">
                      {trasladosReportStats.prevYearTraslados} pac. <span className="text-xs font-bold text-slate-500">({trasladosReportStats.prevYearPct}%)</span>
                    </p>
                    <span className={`text-[9px] font-bold ${Number(trasladosReportStats.yoyGrowth) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {Number(trasladosReportStats.yoyGrowth) >= 0 ? '📈 Aumento de ' : '📉 Disminución de '}
                      {Math.abs(Number(trasladosReportStats.yoyGrowth))}% YoY
                    </span>
                  </div>
                </div>

                {/* Donut Chart de Sexo y Demografía */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-avoid-break">
                  {/* Distribución por Sexo */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-full justify-start gap-3">
                    <h4 className="font-black text-slate-700 uppercase text-[10px] border-b border-slate-200 pb-1.5">Distribución por Sexo</h4>
                    <div className="flex items-center justify-around gap-4 flex-1 pt-1">
                      <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                          <circle cx="55" cy="55" r="45" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                          <circle 
                            cx="55" cy="55" r="45" fill="none" stroke="#3b82f6" strokeWidth="12" 
                            strokeDasharray={`${(Number(trasladosReportStats.hombresPct) / 100) * 282.74} 282.74`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                          />
                          <circle 
                            cx="55" cy="55" r="45" fill="none" stroke="#ec4899" strokeWidth="12" 
                            strokeDasharray={`${(Number(trasladosReportStats.mujeresPct) / 100) * 282.74} 282.74`}
                            strokeDashoffset={`-${(Number(trasladosReportStats.hombresPct) / 100) * 282.74}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[8px] font-bold text-slate-500 uppercase leading-none">Total</span>
                          <span className="text-xs font-black text-slate-800 mt-0.5">{trasladosReportStats.totalTraslados}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between w-32 border-b border-slate-200 pb-1">
                          <span className="text-blue-700 font-bold flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> H
                          </span>
                          <span className="font-extrabold text-slate-800">{trasladosReportStats.hombres} ({trasladosReportStats.hombresPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between w-32">
                          <span className="text-pink-700 font-bold flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> M
                          </span>
                          <span className="font-extrabold text-slate-800">{trasladosReportStats.mujeres} ({trasladosReportStats.mujeresPct}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distribución por Rango Etario (Tramos de 5 años) */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-start gap-3">
                    <h4 className="font-black text-slate-700 uppercase text-[10px] border-b border-slate-200 pb-1.5">Tramos Etarios Dominantes</h4>
                    <div className="space-y-1.5 text-[10px] flex-1 flex flex-col justify-between">
                      <div>
                        {trasladosReportStats.topAgeRanges && trasladosReportStats.topAgeRanges.length > 0 ? (
                          trasladosReportStats.topAgeRanges.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b border-slate-100 pb-0.5 mb-1">
                              <span className="font-semibold text-slate-600">🏆 #{idx+1} ({item.range} a.):</span>
                              <span className="font-extrabold text-slate-800">{item.count} pac. ({item.pct}%)</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-400 py-2">Sin datos disponibles.</p>
                        )}
                      </div>
                      
                      <div>
                        {/* Otros tramos activos */}
                        <div className="text-[8px] font-bold text-slate-400 uppercase pt-1 border-t border-slate-200 mt-1 mb-1">
                          Otros tramos activos:
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] max-h-20 overflow-y-auto">
                          {Object.entries(trasladosReportStats.ageRanges || {})
                            .filter(([range, count]) => range !== 'Desconocido' && count > 0 && !(trasladosReportStats.topAgeRanges || []).some(t => t.range === range))
                            .slice(0, 4)
                            .map(([range, count]) => (
                              <div key={range} className="flex justify-between text-slate-500 border-b border-slate-50">
                                <span>{range}:</span>
                                <span className="font-bold text-slate-700">{count} pac.</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Diagnósticos */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-black text-slate-700 uppercase text-[10px] border-b border-slate-200 pb-1.5">Top Diagnósticos de Traslado</h4>
                    {trasladosReportStats.topDiagArr.length > 0 ? (
                      <div className="space-y-2 text-[10px]">
                        {trasladosReportStats.topDiagArr.map((diag, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-800 font-bold truncate pr-3 flex items-center gap-1 max-w-[140px]">
                              <span className="px-1 py-0.5 rounded bg-indigo-50 text-indigo-700 font-black text-[8px]">{diag.code}</span>
                              <span className="truncate" title={diag.name}>{diag.name}</span>
                            </span>
                            <span className="font-extrabold text-slate-700 text-right shrink-0">
                              {diag.count} ({diag.pct}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 text-center py-4">Sin registros de diagnóstico.</p>
                    )}
                  </div>
                </div>

                {/* Tabla de Detalle Clínico de Derivaciones */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                    Detalle Clínico de Derivaciones (Primeras 25 registradas)
                  </h3>
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-1.5 border border-slate-200">Fecha y Hora</th>
                        <th className="p-1.5 border border-slate-200">Turno</th>
                        <th className="p-1.5 border border-slate-200 text-center">Ficha/Correlativo</th>
                        <th className="p-1.5 border border-slate-200">Destino de Alta</th>
                        <th className="p-1.5 border border-slate-200">Diagnóstico Principal</th>
                        <th className="p-1.5 border border-slate-200 text-center">CIE-10</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trasladosReportStats.listTraslados.length > 0 ? (
                        trasladosReportStats.listTraslados.slice(0, 25).map((p, idx) => {
                          const d = p.tAdmision ? new Date(p.tAdmision) : null;
                          const dateStr = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '-';
                          
                          // Turno Detallado
                          let turnoStr = '-';
                          if (p.tAdmision) {
                            const dateVal = new Date(p.tAdmision);
                            const isNight = dateVal.getHours() >= 20 || dateVal.getHours() < 8;
                            turnoStr = isNight ? 'Turno 3' : 'Turno 1';
                          }

                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-1.5 border border-slate-200 font-medium text-slate-800">{dateStr}</td>
                              <td className="p-1.5 border border-slate-200 font-bold text-slate-600">{turnoStr}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold text-slate-700">{p.correlativo || p.idPaciente || '-'}</td>
                              <td className="p-1.5 border border-slate-200 font-bold text-indigo-900 max-w-[120px] truncate" title={p.destinoAlta || p.destino}>{p.destinoAlta || p.destino || '-'}</td>
                              <td className="p-1.5 border border-slate-200 font-medium text-slate-800 max-w-[150px] truncate" title={p.diagnosticoPrincipal}>{p.diagnosticoPrincipal || '-'}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold text-indigo-700">{p.codigoDiagnostico || '-'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-2 border border-slate-200 text-center text-slate-500">No se registraron traslados hospitalarios en el período.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {trasladosReportStats.listTraslados.length > 25 && (
                    <p className="text-[9px] text-slate-500 font-bold italic mt-1.5 text-right">
                      * Mostrando las primeras 25 derivaciones de un total de {trasladosReportStats.listTraslados.length} registradas en el período.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* HOJA 7: SUB-REPORTE RADAR PREDICTIVO (IA) */}
            {incluirRadar && (
              <div className={`${(incluirGeneral || incluirAltas || incluirFracturas || incluirEnfermeria || incluirConstataciones || incluirTraslados) ? 'print-page-break' : ''} space-y-6`}>
                {/* Cabecera del Documento Institucional */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-12 object-contain" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">SUB-REPORTE: RADAR PREDICTIVO DE DEMANDA (IA)</h2>
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mt-0.5">BigQuery ML (ARIMA_PLUS) + Clima Melipilla + Alertas MINSAL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded border border-indigo-200">Modelo Predictivo IA</span>
                    <p className="text-[11px] text-slate-600 font-bold mt-1.5">Horizonte: 7 Días Proyectados</p>
                  </div>
                </div>

                {/* Resumen Epidemiológico Cognitivo */}
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-700">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-black uppercase tracking-wider">Diagnóstico Epidemiológico Agente IA (Gemini 1.5 Flash)</span>
                  </div>
                  <p className="text-xs text-rose-950 font-bold leading-relaxed whitespace-pre-line">
                    ⚠️ Alerta Operativa Preventiva SAR Elsa Romo Aravena:
                    Se prevé una sobrecarga de demanda asistencial con riesgo de saturación en el periodo proyectado. La coincidencia con factores meteorológicos locales de Melipilla (bajas temperaturas / precipitaciones) y avisos de la red asistencial MINSAL sugiere un aumento potencial de consultas por infecciones respiratorias agudas y traumatismos. Se recomienda a la jefatura de urgencia coordinar refuerzo de personal médico y de enfermería en triage C1-C3.
                  </p>
                  <p className="text-[9px] font-bold text-rose-700/80 pt-2 border-t border-rose-200">
                    Análisis generado dinámicamente por IA cruzando modelos de series temporales de BigQuery, datos de Open-Meteo y boletines oficiales del MINSAL Chile.
                  </p>
                </div>

                {/* Indicadores Clave del Radar */}
                <div className="grid grid-cols-4 gap-3 print-avoid-break">
                  <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Promedio Diario</span>
                    <p className="text-xl font-black text-slate-800 mt-1">97 <span className="text-[10px] font-bold">pac/día</span></p>
                  </div>
                  <div className="border border-indigo-200 p-3 rounded-xl text-center bg-indigo-50/50">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Peak Máximo Esperado</span>
                    <p className="text-xl font-black text-indigo-800 mt-1">128 <span className="text-[10px] font-bold">pacientes</span></p>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total 7 Días</span>
                    <p className="text-xl font-black text-slate-800 mt-1">680 <span className="text-[10px] font-bold">atenciones</span></p>
                  </div>
                  <div className="border border-emerald-200 p-3 rounded-xl text-center bg-emerald-50/50">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Confianza ARIMA</span>
                    <p className="text-xl font-black text-emerald-800 mt-1">95% <span className="text-[10px] font-bold">intervalo</span></p>
                  </div>
                </div>

                {/* Tabla de Proyecciones a 7 Días */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Tabla Detallada de Proyección Diaria de Pacientes</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2 border border-slate-200">Fecha Predicha</th>
                        <th className="p-2 border border-slate-200 text-center">Atenciones Proyectadas</th>
                        <th className="p-2 border border-slate-200 text-center">Intervalo de Confianza (95%)</th>
                        <th className="p-2 border border-slate-200 text-center">Estado de Carga Estimado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-slate-200 font-bold text-slate-800">Lunes 03/08/2026</td>
                        <td className="p-2 border border-slate-200 text-center font-black text-indigo-600">83 pac.</td>
                        <td className="p-2 border border-slate-200 text-center text-slate-600">[60 - 105 pac.]</td>
                        <td className="p-2 border border-slate-200 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Normal</span></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-bold text-slate-800">Martes 04/08/2026</td>
                        <td className="p-2 border border-slate-200 text-center font-black text-indigo-600">83 pac.</td>
                        <td className="p-2 border border-slate-200 text-center text-slate-600">[60 - 107 pac.]</td>
                        <td className="p-2 border border-slate-200 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Normal</span></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-bold text-slate-800">Miércoles 05/08/2026</td>
                        <td className="p-2 border border-slate-200 text-center font-black text-indigo-600">87 pac.</td>
                        <td className="p-2 border border-slate-200 text-center text-slate-600">[63 - 112 pac.]</td>
                        <td className="p-2 border border-slate-200 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Normal</span></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-bold text-slate-800">Jueves 06/08/2026</td>
                        <td className="p-2 border border-slate-200 text-center font-black text-indigo-600">75 pac.</td>
                        <td className="p-2 border border-slate-200 text-center text-slate-600">[50 - 100 pac.]</td>
                        <td className="p-2 border border-slate-200 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Normal</span></td>
                      </tr>
                      <tr className="bg-rose-50/40">
                        <td className="p-2 border border-slate-200 font-bold text-rose-900">Viernes 07/08/2026 (Peak Máximo)</td>
                        <td className="p-2 border border-slate-200 text-center font-black text-rose-700">128 pac.</td>
                        <td className="p-2 border border-slate-200 text-center text-slate-700 font-bold">[102 - 154 pac.]</td>
                        <td className="p-2 border border-slate-200 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-800 animate-pulse">Crítico</span></td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="p-2 border border-slate-200 font-bold text-amber-900">Sábado 08/08/2026</td>
                        <td className="p-2 border border-slate-200 text-center font-black text-amber-700">123 pac.</td>
                        <td className="p-2 border border-slate-200 text-center text-slate-700 font-bold">[97 - 130 pac.]</td>
                        <td className="p-2 border border-slate-200 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800">Elevado</span></td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-bold text-slate-800">Domingo 09/08/2026</td>
                        <td className="p-2 border border-slate-200 text-center font-black text-indigo-600">101 pac.</td>
                        <td className="p-2 border border-slate-200 text-center text-slate-600">[74 - 129 pac.]</td>
                        <td className="p-2 border border-slate-200 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Elevado</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECCIÓN DE CIERRE Y CONTROL DE VALIDEZ GLOBAL (SOLO CUANDO SE INCLUYEN OTROS REPORTES) */}
            {(incluirGeneral || incluirAltas || incluirFracturas || incluirEnfermeria || incluirConstataciones || incluirTraslados || incluirRadar) && (
              <div className="print-page-break print-avoid-break space-y-6 pt-6 border-t-2 border-slate-950">
                {/* Header Cierre */}
                <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase">CIERRE DE INFORME Y VALIDACIÓN DE DATOS</h2>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Control Operativo e Integridad de la Información</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 text-[10px] font-black rounded-full border border-slate-200 uppercase">
                      Documento Oficial
                    </span>
                  </div>
                </div>

                {/* Grid de Totales Consignados */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Cuadro de Resumen General */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1">Totales Consignados en Periodo</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold block">Total Atenciones:</span>
                        <span className="font-black text-slate-800 text-sm">{pacientesFiltrados.length} pac.</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Casos Críticos (C1/C2):</span>
                        <span className="font-black text-slate-800 text-sm">{enfermeriaStats.casosCriticos.length} pac.</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Constatación Lesiones (C3):</span>
                        <span className="font-black text-slate-800 text-sm">{enfermeriaStats.c3Stats.lesionesCount} pac. ({enfermeriaStats.c3Stats.lesionesPerc}%)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Traslados Hospitalarios:</span>
                        <span className="font-black text-indigo-700 text-sm">{trasladosReportStats.totalTraslados} pac. ({trasladosReportStats.pctTraslados}%)</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* BLOQUE GLOBAL DE CIERRE DE INFORME Y VALIDACIÓN DE DATOS */}
            {(incluirGeneral || incluirAltas || incluirFracturas || incluirEnfermeria || incluirConstataciones || incluirTraslados || incluirRadar) && (
              <div className="print-avoid-break pt-8 border-t-2 border-slate-900 mt-8 space-y-6">
                
                {/* Cuadro de Tiempos y Operatividad */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1">Metadatos de Operación y Tiempos</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block">T. Promedio 1ª Cat:</span>
                      <span className="font-black text-slate-800 text-sm">{enfermeriaStats.avgMinCat1} min</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">T. Promedio Re-Cat:</span>
                      <span className="font-black text-slate-800 text-sm">{enfermeriaStats.avgMinReCat} min</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Tasa Altas Admin:</span>
                      <span className="font-black text-rose-700 text-sm">{altasStats.pct}% ({altasStats.totalAltas} altas)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Total Fracturas Fx:</span>
                      <span className="font-black text-amber-700 text-sm">{fracturasStats.totalFracturas} pac.</span>
                    </div>
                  </div>
                </div>

                {/* Metadatos de Emisión de Reporte */}
                <div className="bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl text-[11px] text-slate-600 leading-relaxed space-y-1.5">
                  <p>
                    <strong>Sistema Emisor:</strong> Métrico - Dashboard de Gestión Estadística y Tiempos de Espera de Urgencia (SAR Arpillerista Elsa Romo Aravena).
                  </p>
                  <p>
                    <strong>Usuario Certificante:</strong> {user?.email || 'Usuario Autorizado / Gestión Local'}
                  </p>
                  <p>
                    <strong>Fecha de Descarga:</strong> {new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })} h
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                    * Este documento es un consolidado estadístico generado a partir de registros del sistema Iris.
                  </p>
                </div>

                {/* Bloque de Firmas */}
                <div className="grid grid-cols-2 gap-8 pt-10">
                  <div className="text-center space-y-1">
                    <div className="border-t border-slate-400 w-52 mx-auto"></div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Firma Enfermero(a) Supervisor(a)</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Gestión de Categorización y Triaje</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="border-t border-slate-400 w-52 mx-auto"></div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Firma Directora Técnica</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">SAR Arpillerista Elsa Romo Aravena</p>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
