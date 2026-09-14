import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, Calendar, Clock, TrendingUp, TrendingDown, ArrowRightLeft, 
  Sparkles, Copy, Check, RefreshCw, Layers, ShieldCheck, Activity, 
  AlertTriangle, Filter, ChevronRight, BarChart2, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../config/firebase';
import InfoTooltip from '../InfoTooltip';
import { generarAnalisisComportamientoGemini } from '../../utils/geminiCurvaDemanda';
import { deduplicarPacientes, formatLocalDate } from '../../utils/helpers';

export default function AnalisisCurvaDemanda({
  pacientesDB = [],
  allPacientesDB = [],
  turnosDB = [],
  filtroFechaInicio,
  filtroFechaFin,
  kpisBigQuery
}) {
  // 1. Estados de Períodos (Base y Contraste)
  const [presetSeleccionado, setPresetSeleccionado] = useState('semana_anterior');
  const [vistaTemporal, setVistaTemporal] = useState('hora'); // 'hora' (24 hrs) | 'dia' (7 días sem.)

  // Fechas Período Base (por defecto rango del filtro global o última semana completa)
  const [baseInicio, setBaseInicio] = useState(filtroFechaInicio || '2026-09-07');
  const [baseFin, setBaseFin] = useState(filtroFechaFin || '2026-09-13');

  // Fechas Período Contraste
  const [contrasteInicio, setContrasteInicio] = useState('2026-08-31');
  const [contrasteFin, setContrasteFin] = useState('2026-09-06');

  // Estados de datos y carga
  const [curvaData, setCurvaData] = useState({ hourly: [], daily: [] });
  const [kpisContraste, setKpisContraste] = useState({
    totalBase: 0,
    totalContraste: 0,
    deltaPct: 0,
    peakBase: { horaTooltip: '-', atenciones: 0, esperaTriaje: 0 },
    peakContraste: { horaTooltip: '-', atenciones: 0, esperaTriaje: 0 },
    deltaEsperaPeak: 0
  });

  // Estados de IA Gemini
  const [analisisIa, setAnalisisIa] = useState('');
  const [loadingIa, setLoadingIa] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [loadingBq, setLoadingBq] = useState(false);

  // Pool de pacientes consolidados y desduplicados SSOT
  const pacientesPool = useMemo(() => {
    const raw = (allPacientesDB && allPacientesDB.length > 0) ? allPacientesDB : pacientesDB;
    return deduplicarPacientes(raw || []);
  }, [allPacientesDB, pacientesDB]);

  // Aplicar Presets Automáticos
  const handleApplyPreset = (presetKey) => {
    setPresetSeleccionado(presetKey);

    const parseDate = (dStr) => {
      const parts = String(dStr).split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const toIsoStr = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const bStart = parseDate(baseInicio);
    const bEnd = parseDate(baseFin);

    if (presetKey === 'semana_anterior') {
      // 7 días exactos hacia atrás
      const cStart = new Date(bStart);
      cStart.setDate(cStart.getDate() - 7);
      const cEnd = new Date(bEnd);
      cEnd.setDate(cEnd.getDate() - 7);
      setContrasteInicio(toIsoStr(cStart));
      setContrasteFin(toIsoStr(cEnd));
    } else if (presetKey === 'mes_anterior') {
      // 1 mes calendario hacia atrás
      const cStart = new Date(bStart);
      cStart.setMonth(cStart.getMonth() - 1);
      const cEnd = new Date(bEnd);
      cEnd.setMonth(cEnd.getMonth() - 1);
      setContrasteInicio(toIsoStr(cStart));
      setContrasteFin(toIsoStr(cEnd));
    } else if (presetKey === 'ano_anterior') {
      // Mismo rango del año anterior (YoY)
      const cStart = new Date(bStart);
      cStart.setFullYear(cStart.getFullYear() - 1);
      const cEnd = new Date(bEnd);
      cEnd.setFullYear(cEnd.getFullYear() - 1);
      setContrasteInicio(toIsoStr(cStart));
      setContrasteFin(toIsoStr(cEnd));
    }
  };

  // Motor de agregación de datos (BigQuery Master View con fallback local determinista SSOT)
  const calcularCurvasYMetricas = useCallback(async () => {
    setLoadingBq(true);

    let fetchedFromBq = false;
    let baseRes = null;
    let contrasteRes = null;

    // Intentar consultar BigQuery Master View a través de la Cloud Function
    if (app) {
      try {
        const functionsInstance = getFunctions(app, 'us-central1');
        const callCurvaMaster = httpsCallable(functionsInstance, 'obtenerCurvaDemandaMaster');
        const res = await callCurvaMaster({
          periodoBase: { fechaInicio: baseInicio, fechaFin: baseFin },
          periodoContraste: { fechaInicio: contrasteInicio, fechaFin: contrasteFin }
        });

        if (res?.data?.success && res.data.base) {
          baseRes = res.data.base;
          contrasteRes = res.data.contraste;
          fetchedFromBq = true;
        }
      } catch (err) {
        console.info("Consulta BigQuery no disponible o timeout, procesando localmente en pacientesPool SSOT:", err?.message || err);
      }
    }

    // Si BigQuery no devolvió datos, calculamos directamente sobre pacientesPool local
    if (!fetchedFromBq) {
      const filtrarPacientesRango = (fIni, fFin) => {
        const dIni = new Date(`${fIni}T00:00:00-04:00`).getTime();
        const dFin = new Date(`${fFin}T23:59:59-04:00`).getTime();

        return pacientesPool.filter(p => {
          const tAdm = p.tAdmision ? (typeof p.tAdmision === 'number' ? p.tAdmision : new Date(p.tAdmision).getTime()) : null;
          if (!tAdm) return false;
          return tAdm >= dIni && tAdm <= dFin;
        });
      };

      const procesarPool = (pacs) => {
        const hourlyMap = Array(24).fill(0).map((_, i) => ({
          hora: i,
          horaCorta: `${String(i).padStart(2, '0')}:00`,
          horaTooltip: `${String(i).padStart(2, '0')}:00 - ${String(i).padStart(2, '0')}:59`,
          cantidad: 0,
          esperasSum: 0,
          esperasCount: 0
        }));

        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dailyMap = [2, 3, 4, 5, 6, 7, 1].map(dNum => ({
          diaNum: dNum,
          diaNombre: dayNames[dNum - 1],
          diaCorto: dayNames[dNum - 1].substring(0, 3),
          cantidad: 0,
          esperasSum: 0,
          esperasCount: 0
        }));

        const diagMap = {};

        pacs.forEach(p => {
          const tAdm = p.tAdmision ? new Date(p.tAdmision) : null;
          if (!tAdm || isNaN(tAdm.getTime())) return;

          const h = tAdm.getHours();
          const dayWeek = tAdm.getDay() + 1; // 1=Dom, 2=Lun...

          // Tiempo espera a triage
          let esperaMin = 14;
          if (p.tCat1 && p.tAdmision) {
            const diffMin = Math.round((new Date(p.tCat1).getTime() - new Date(p.tAdmision).getTime()) / 60000);
            if (diffMin >= 0 && diffMin <= 300) esperaMin = diffMin;
          }

          if (hourlyMap[h]) {
            hourlyMap[h].cantidad++;
            hourlyMap[h].esperasSum += esperaMin;
            hourlyMap[h].esperasCount++;
          }

          const dailyItem = dailyMap.find(d => d.diaNum === dayWeek);
          if (dailyItem) {
            dailyItem.cantidad++;
            dailyItem.esperasSum += esperaMin;
            dailyItem.esperasCount++;
          }

          const diag = String(p.diagnostico || p.diagnosticoPrincipal || '').trim().toUpperCase();
          if (diag && !diag.includes('SIN REGISTRO') && diag !== '-') {
            diagMap[diag] = (diagMap[diag] || 0) + 1;
          }
        });

        const hourlyCurve = hourlyMap.map(h => ({
          hora: h.hora,
          horaCorta: h.horaCorta,
          horaTooltip: h.horaTooltip,
          atenciones: h.cantidad,
          esperaTriaje: h.esperasCount > 0 ? Math.round(h.esperasSum / h.esperasCount) : 14
        }));

        const dailyCurve = dailyMap.map(d => ({
          diaNum: d.diaNum,
          diaNombre: d.diaNombre,
          diaCorto: d.diaCorto,
          atenciones: d.cantidad,
          esperaTriaje: d.esperasCount > 0 ? Math.round(d.esperasSum / d.esperasCount) : 14
        }));

        const totalPacientes = pacs.length;

        let peakHour = null;
        let maxVal = -1;
        hourlyCurve.forEach(h => {
          if (h.atenciones > maxVal) {
            maxVal = h.atenciones;
            peakHour = h;
          }
        });

        const topDiagnosticos = Object.entries(diagMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([diagnostico, total]) => ({ codigo: '', diagnostico, total }));

        return {
          totalPacientes,
          peakHour,
          hourlyCurve,
          dailyCurve,
          topDiagnosticos
        };
      };

      const pacsBase = filtrarPacientesRango(baseInicio, baseFin);
      const pacsContraste = filtrarPacientesRango(contrasteInicio, contrasteFin);

      baseRes = procesarPool(pacsBase);
      contrasteRes = procesarPool(pacsContraste);
    }

    // Ensamblar datasets superpuestos para Recharts
    const hourlyOverlay = (baseRes?.hourlyCurve || []).map((h, i) => {
      const c = contrasteRes?.hourlyCurve?.[i];
      return {
        key: h.horaCorta,
        horaCorta: h.horaCorta,
        horaTooltip: h.horaTooltip,
        base: h.atenciones,
        contraste: c ? c.atenciones : 0,
        esperaBase: h.esperaTriaje,
        esperaContraste: c ? c.esperaTriaje : 0,
        delta: h.atenciones - (c ? c.atenciones : 0)
      };
    });

    const dailyOverlay = (baseRes?.dailyCurve || []).map((d, i) => {
      const c = contrasteRes?.dailyCurve?.[i];
      return {
        key: d.diaCorto,
        diaCorto: d.diaCorto,
        diaNombre: d.diaNombre,
        base: d.atenciones,
        contraste: c ? c.atenciones : 0,
        esperaBase: d.esperaTriaje,
        esperaContraste: c ? c.esperaTriaje : 0,
        delta: d.atenciones - (c ? c.atenciones : 0)
      };
    });

    setCurvaData({ hourly: hourlyOverlay, daily: dailyOverlay });

    // Métricas y KPIs
    const totBase = baseRes?.totalPacientes || 0;
    const totContraste = contrasteRes?.totalPacientes || 0;
    const deltaVolPct = totContraste > 0 ? (((totBase - totContraste) / totContraste) * 100) : 0;

    const pBase = baseRes?.peakHour || { horaTooltip: '-', atenciones: 0, esperaTriaje: 0 };
    const pContraste = contrasteRes?.peakHour || { horaTooltip: '-', atenciones: 0, esperaTriaje: 0 };
    const deltaEspPeak = (pBase.esperaTriaje || 0) - (pContraste.esperaTriaje || 0);

    setKpisContraste({
      totalBase: totBase,
      totalContraste: totContraste,
      deltaPct: deltaVolPct,
      peakBase: pBase,
      peakContraste: pContraste,
      deltaEsperaPeak: deltaEspPeak
    });

    setLoadingBq(false);

    // Disparar motor de análisis de IA Gemini
    generarAnalisisOperativo(baseRes, contrasteRes, deltaVolPct, hourlyOverlay, dailyOverlay);
  }, [baseInicio, baseFin, contrasteInicio, contrasteFin, pacientesPool]);

  // Ejecución de la IA Gemini
  const generarAnalisisOperativo = async (baseData, contrasteData, deltaPct, hourlyData, dailyData) => {
    setLoadingIa(true);

    // Encontrar brecha máxima
    const activeOverlay = vistaTemporal === 'hora' ? hourlyData : dailyData;
    let maxDeltaItem = null;
    let maxAbsDelta = -1;

    (activeOverlay || []).forEach(item => {
      const absD = Math.abs(item.delta || 0);
      if (absD > maxAbsDelta) {
        maxAbsDelta = absD;
        maxDeltaItem = item;
      }
    });

    const payload = {
      periodoBase: {
        rango: `${baseInicio} al ${baseFin}`,
        totalPacientes: baseData?.totalPacientes || 0,
        peakHour: baseData?.peakHour,
        topDiagnosticos: baseData?.topDiagnosticos || []
      },
      periodoContraste: {
        rango: `${contrasteInicio} al ${contrasteFin}`,
        totalPacientes: contrasteData?.totalPacientes || 0,
        peakHour: contrasteData?.peakHour,
        topDiagnosticos: contrasteData?.topDiagnosticos || []
      },
      deltaVolumenPct: deltaPct,
      vistaTemporal,
      brechaPrincipal: {
        etiqueta: maxDeltaItem ? (maxDeltaItem.horaTooltip || maxDeltaItem.diaNombre) : 'en horario vespertino',
        delta: maxDeltaItem ? maxDeltaItem.delta : 0
      }
    };

    const textoGenerado = await generarAnalisisComportamientoGemini(payload);
    setAnalisisIa(textoGenerado);
    setLoadingIa(false);
  };

  // Re-calcular al montar o cambiar fechas
  useEffect(() => {
    calcularCurvasYMetricas();
  }, [calcularCurvasYMetricas]);

  // Función para copiar texto al portapapeles
  const handleCopiarTexto = () => {
    if (!analisisIa) return;
    navigator.clipboard.writeText(analisisIa);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Dataset para el gráfico según vista seleccionada
  const chartData = vistaTemporal === 'hora' ? curvaData.hourly : curvaData.daily;

  return (
    <div className="space-y-6 animate-fadeIn theme-transition">
      {/* ========================================================================= */}
      {/* CABECERA: TÍTULO, SELECTOR DUAL DE PERIODOS Y PRESETS                     */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Curva de Demanda Continua & Análisis de Contraste
                  <InfoTooltip 
                    title="Curva de Demanda & Contraste" 
                    text="Compara el comportamiento dinámico de admisiones entre dos períodos clínicos distintos consumiendo la vista maestra SSOT de BigQuery y sintetiza hipótesis operativas con IA Gemini." 
                  />
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparativa de flujo dinámico de pacientes entre período activo y línea base de referencia.
                </p>
              </div>
            </div>
          </div>

          {/* Selector de Granularidad Temporal */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 self-start lg:self-auto">
            <button
              onClick={() => setVistaTemporal('hora')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                vistaTemporal === 'hora'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Curva 24 Horas
            </button>
            <button
              onClick={() => setVistaTemporal('dia')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                vistaTemporal === 'dia'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Flujo Semanal (Lun - Dom)
            </button>
          </div>
        </div>

        {/* SELECTOR DUAL: PERÍODO BASE VS PERÍODO DE CONTRASTE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5 items-center">
          {/* Período Base */}
          <div className="md:col-span-5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                Período Base (Activo)
              </span>
              <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/60">Línea de Análisis</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5">
              <input 
                type="date" 
                value={baseInicio} 
                onChange={(e) => setBaseInicio(e.target.value)}
                className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none w-full"
              />
              <span className="text-slate-400 text-xs font-bold">-</span>
              <input 
                type="date" 
                value={baseFin} 
                onChange={(e) => setBaseFin(e.target.value)}
                className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none w-full"
              />
            </div>
          </div>

          {/* Indicador VS */}
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 mt-1 uppercase">Contraste</span>
          </div>

          {/* Período de Contraste */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block border border-dashed border-slate-600"></span>
                Período de Contraste (Referencia)
              </span>
              <span className="text-[10px] font-bold text-slate-400">Línea Histórica</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5">
              <input 
                type="date" 
                value={contrasteInicio} 
                onChange={(e) => {
                  setContrasteInicio(e.target.value);
                  setPresetSeleccionado('personalizado');
                }}
                className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none w-full"
              />
              <span className="text-slate-400 text-xs font-bold">-</span>
              <input 
                type="date" 
                value={contrasteFin} 
                onChange={(e) => {
                  setContrasteFin(e.target.value);
                  setPresetSeleccionado('personalizado');
                }}
                className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Presets Rápidos de Comparación */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] font-black text-slate-400 uppercase mr-1">Presets Rápidos:</span>
          <button
            onClick={() => handleApplyPreset('semana_anterior')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              presetSeleccionado === 'semana_anterior'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Semana Anterior (-7 días)
          </button>
          <button
            onClick={() => handleApplyPreset('mes_anterior')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              presetSeleccionado === 'mes_anterior'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Mes Anterior (-30 días)
          </button>
          <button
            onClick={() => handleApplyPreset('ano_anterior')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              presetSeleccionado === 'ano_anterior'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Misma Semana Año Anterior (YoY)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILA DE KPIS RÁPIDOS DE IMPACTO                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Variación de Volumen Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Variación Volumen Total
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
              kpisContraste.deltaPct >= 0 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}>
              {kpisContraste.deltaPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {kpisContraste.deltaPct >= 0 ? `+${kpisContraste.deltaPct.toFixed(1)}%` : `${kpisContraste.deltaPct.toFixed(1)}%`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {kpisContraste.totalBase.toLocaleString('es-CL')}
            </span>
            <span className="text-xs font-bold text-slate-500">pac. actual</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            vs. {kpisContraste.totalContraste.toLocaleString('es-CL')} pac. en período de contraste
          </p>
        </div>

        {/* KPI 2: Hora de Mayor Peak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hora de Mayor Peak
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {kpisContraste.peakBase?.atenciones || 0} admisiones
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {kpisContraste.peakBase?.horaTooltip || '-'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Contraste: {kpisContraste.peakContraste?.horaTooltip || '-'} ({kpisContraste.peakContraste?.atenciones || 0} pac.)
          </p>
        </div>

        {/* KPI 3: Diferencia de Espera en Peak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Espera en Peak a Box
            </span>
            <span className={`inline-flex items-center text-xs font-black px-2 py-0.5 rounded-md ${
              kpisContraste.deltaEsperaPeak <= 0 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}>
              {kpisContraste.deltaEsperaPeak > 0 ? `+${kpisContraste.deltaEsperaPeak} min` : `${kpisContraste.deltaEsperaPeak} min`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {kpisContraste.peakBase?.esperaTriaje || 14}
            </span>
            <span className="text-xs font-bold text-slate-500">min. promedio</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            vs. {kpisContraste.peakContraste?.esperaTriaje || 14} min. en período de contraste
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRÁFICO PRINCIPAL DE CURVA (RECHARTS OVERLAY)                             */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Superposición de Curva Asistencial
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({vistaTemporal === 'hora' ? 'Consolidado 24 Horas' : 'Ciclo Semanal'})
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Área verde sólida: Período Base | Línea violeta punteada: Período de Contraste
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block shadow-sm"></span>
              <span className="text-slate-700 dark:text-slate-300">Base</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-indigo-400 inline-block"></span>
              <span className="text-slate-500 dark:text-slate-400">Contraste</span>
            </div>
          </div>
        </div>

        <div className="h-[380px] w-full">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="curvaBaseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis 
                  dataKey="key" 
                  fontSize={10} 
                  tickMargin={8} 
                  axisLine={false} 
                  tickLine={false} 
                  interval="preserveStartEnd" 
                  minTickGap={15} 
                  tick={{ fill: 'var(--text-secondary)' }} 
                />
                <YAxis 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)' }} 
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)'
                  }}
                  formatter={(value, name) => [
                    `${value} pacientes`, 
                    name === 'base' ? 'Período Base' : 'Período Contraste'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? (item.horaTooltip || item.diaNombre || label) : label;
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} 
                  formatter={(value) => value === 'base' ? 'Período Base (Activo)' : 'Período Contraste (Referencia)'}
                />
                {/* Serie Base: Línea Sólida con Área Translúcida */}
                <Area 
                  type="monotone" 
                  dataKey="base" 
                  name="base" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#curvaBaseGradient)" 
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                {/* Serie Contraste: Línea Punteada Neutra/Violeta */}
                <Line 
                  type="monotone" 
                  dataKey="contraste" 
                  name="contraste" 
                  stroke="#818cf8" 
                  strokeWidth={2.5} 
                  strokeDasharray="5 5" 
                  dot={false} 
                  activeDot={{ r: 5, fill: '#818cf8' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No hay datos disponibles para los rangos seleccionados.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL: ANÁLISIS DE COMPORTAMIENTO OPERATIVO (IA GEMINI)                    */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-purple-900/10 dark:from-indigo-950/40 dark:via-slate-950 dark:to-purple-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Análisis de Comportamiento Operativo
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Gemini 1.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Síntesis analítica gerencial automatizada con hipótesis de saturación y descalces de guardia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => calcularCurvasYMetricas()}
              disabled={loadingIa}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Regenerar Análisis con IA"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingIa ? 'animate-spin' : ''}`} />
              Regenerar
            </button>
            <button
              onClick={handleCopiarTexto}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Copiar Análisis para Informes"
            >
              {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiado ? 'Copiado' : 'Copiar Texto'}
            </button>
          </div>
        </div>

        {/* Cuerpo del Análisis Generativo */}
        {loadingIa ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
            <span className="text-xs font-bold text-indigo-500 dark:text-indigo-300">
              Analizando curvas de demanda y formulando hipótesis operativa con Gemini 1.5 Flash...
            </span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
            {analisisIa ? (
              analisisIa.split('\n\n').map((parrafo, idx) => (
                <p key={idx} className="bg-white/60 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                  {parrafo}
                </p>
              ))
            ) : (
              <p className="text-slate-400 italic">No se ha podido generar la síntesis en este momento.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
