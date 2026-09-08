import React, { useState, useMemo } from 'react';
import { 
  Calendar, TrendingUp, TrendingDown, Minus, Clock, Activity, 
  AlertTriangle, Hospital, ShieldCheck, Users, ArrowRight, 
  Tag, Edit3, CheckCircle2, ChevronRight, Gauge, Zap, FileText
} from 'lucide-react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatLocalDate, resolverEquipoTurno } from '../../utils/helpers';

export default function AnalisisComparativoTriple({ 
  pacientesDB, 
  turnosDB, 
  pautasDB,
  setFiltroFechaInicio, 
  setFiltroFechaFin, 
  setActiveTab 
}) {
  const subtractDays = (dateStr, days) => {
    const d = new Date(dateStr + "T12:00:00"); 
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];
  const [fechaA, setFechaA] = useState(today);
  const [fechaB, setFechaB] = useState(subtractDays(today, 7));
  const [fechaC, setFechaC] = useState(subtractDays(today, 364));

  // Función para resolver el nombre sugerido del equipo
  const getSuggestedEquipo = (dateStr, fallbackNumber) => {
    if (!dateStr) return `Turno Equipo ${fallbackNumber}`;
    try {
      const resolved = resolverEquipoTurno(dateStr, '08:00 a 20:00 hrs', pautasDB, null);
      if (resolved && resolved.toLowerCase().includes('turno')) {
        return resolved;
      }
    } catch (e) {}
    return `Turno Equipo ${fallbackNumber}`;
  };

  // Fase 3: Alias Visuales de Equipos
  const [aliasA, setAliasA] = useState(() => getSuggestedEquipo(today, 1));
  const [aliasB, setAliasB] = useState(() => getSuggestedEquipo(subtractDays(today, 7), 2));
  const [aliasC, setAliasC] = useState(() => getSuggestedEquipo(subtractDays(today, 364), 3));

  const [isEditingAliasA, setIsEditingAliasA] = useState(false);
  const [isEditingAliasB, setIsEditingAliasB] = useState(false);
  const [isEditingAliasC, setIsEditingAliasC] = useState(false);

  const equipoPresets = ['Turno Equipo 1', 'Turno Equipo 2', 'Turno Equipo 3', 'Turno Equipo 4'];

  const datesToCompare = [
    { 
      label: 'Jornada Principal (Periodo A)', 
      date: fechaA, 
      setter: (val) => {
        setFechaA(val);
        setAliasA(getSuggestedEquipo(val, 1));
      }, 
      short: 'Periodo A', 
      color: '#3b82f6',
      lineColor: '#1d4ed8',
      alias: aliasA,
      setAlias: setAliasA,
      isEditing: isEditingAliasA,
      setIsEditing: setIsEditingAliasA
    },
    { 
      label: 'Jornada Comparativa (Periodo B)', 
      date: fechaB, 
      setter: (val) => {
        setFechaB(val);
        setAliasB(getSuggestedEquipo(val, 2));
      }, 
      short: 'Periodo B', 
      color: '#8b5cf6',
      lineColor: '#6d28d9',
      alias: aliasB,
      setAlias: setAliasB,
      isEditing: isEditingAliasB,
      setIsEditing: setIsEditingAliasB
    },
    { 
      label: 'Jornada Histórica (Periodo C)', 
      date: fechaC, 
      setter: (val) => {
        setFechaC(val);
        setAliasC(getSuggestedEquipo(val, 3));
      }, 
      short: 'Periodo C', 
      color: '#10b981',
      lineColor: '#047857',
      alias: aliasC,
      setAlias: setAliasC,
      isEditing: isEditingAliasC,
      setIsEditing: setIsEditingAliasC
    }
  ];

  // Fase 1: Cálculo de Métricas enfocado 100% en Equipos de Triage y Admisión
  const metrics = useMemo(() => {
    const getStatsForDate = (date) => {
      const turnosDelDia = (turnosDB || []).filter(t => t.fechaInicio === date);
      
      const pacs = (pacientesDB || []).filter(p => {
        if (!p.tAdmision) return false;
        const pDate = formatLocalDate(p.tAdmision);
        return pDate === date;
      });

      let total = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
      let altas = 0, traslados = 0, constataciones = 0;
      let sumEspera = 0, countEspera = 0;
      let sumEstadia = 0, countEstadia = 0;
      
      // Tiempos de espera a triage específicos por categoría
      const waitTimesCat = {
        c1: { sum: 0, count: 0 },
        c2: { sum: 0, count: 0 },
        c3: { sum: 0, count: 0 },
        c4: { sum: 0, count: 0 },
        c5: { sum: 0, count: 0 }
      };

      const centrosMap = {};

      pacs.forEach(p => {
        let catKey = null;
        const c = String(p.categoria || p.catPrimera || 'sincat').toLowerCase();
        if (c.includes('c1')) { c1++; catKey = 'c1'; }
        else if (c.includes('c2')) { c2++; catKey = 'c2'; }
        else if (c.includes('c3')) { c3++; catKey = 'c3'; }
        else if (c.includes('c4')) { c4++; catKey = 'c4'; }
        else if (c.includes('c5')) { c5++; catKey = 'c5'; }
        
        if (p.estado === 'Cancelada') altas++;
        
        const d = String(p.destinoAlta || p.destino || '').toLowerCase();
        if (d.includes('hospital') || d.includes('emergencia') || d.includes('derivac')) {
          traslados++;
        }
        
        if (p.categoria === 'c3_z518') {
          constataciones++;
        } else {
          const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
          const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
          if (cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC')) {
            constataciones++;
          }
        }

        if (p.establecimiento && p.establecimiento !== 'DESCONOCIDO' && p.establecimiento !== 'UNDEFINED' && p.establecimiento.trim() !== '') {
          const cName = p.establecimiento.trim().toUpperCase();
          centrosMap[cName] = (centrosMap[cName] || 0) + 1;
        }

        // Medición de latencia al triage (tCat1 - tAdmision)
        if (p.tAdmision && p.tCat1 && p.tCat1 >= p.tAdmision) {
          const diffMin = (p.tCat1 - p.tAdmision) / 60000;
          if (diffMin < 1440) {
            sumEspera += diffMin;
            countEspera++;
            if (catKey && waitTimesCat[catKey]) {
              waitTimesCat[catKey].sum += diffMin;
              waitTimesCat[catKey].count++;
            }
          }
        }
        
        // Medición de estadía total de alta
        if (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) {
          const diffMin = (p.tAlta - p.tAdmision) / 60000;
          if (diffMin < 2880) {
            sumEstadia += diffMin;
            countEstadia++;
          }
        }
      });

      // Si no hay pacientes crudos locales para ese día, usar los turnos agregados de la DB
      if (pacs.length === 0 && turnosDelDia.length > 0) {
        turnosDelDia.forEach(t => {
          total += Number(t.totalPacientes || 0);
          c1 += Number(t.c1 || 0);
          c2 += Number(t.c2 || 0);
          c3 += Number(t.c3 || 0) + Number(t.c3_z518 || 0);
          c4 += Number(t.c4 || 0);
          c5 += Number(t.c5 || 0);
          altas += Number(t.altasAdmin || 0);
          traslados += Number(t.trasladosCount || 0);
          constataciones += Number(t.constatacionesCount || 0);
          if (t.tEsperaPromedio) {
            sumEspera += Number(t.tEsperaPromedio);
            countEspera++;
          }
        });
      } else {
        total = pacs.length;
      }

      const promEspera = countEspera > 0 ? Math.round(sumEspera / countEspera) : 0;
      const promEstadia = countEstadia > 0 ? Math.round(sumEstadia / countEstadia) : 0;

      // Tiempos promedio de espera a triage por categoría en minutos
      const esperaC1 = waitTimesCat.c1.count > 0 ? Math.round(waitTimesCat.c1.sum / waitTimesCat.c1.count) : 0;
      const esperaC2 = waitTimesCat.c2.count > 0 ? Math.round(waitTimesCat.c2.sum / waitTimesCat.c2.count) : 0;
      const esperaC3 = waitTimesCat.c3.count > 0 ? Math.round(waitTimesCat.c3.sum / waitTimesCat.c3.count) : 0;
      const esperaC4 = waitTimesCat.c4.count > 0 ? Math.round(waitTimesCat.c4.sum / waitTimesCat.c4.count) : 0;
      const esperaC5 = waitTimesCat.c5.count > 0 ? Math.round(waitTimesCat.c5.sum / waitTimesCat.c5.count) : 0;

      // Criterio de Alta Complejidad del Equipo (C1 + C2 + C3)
      const altaComplejidadVol = c1 + c2 + c3;
      const altaComplejidadPct = total > 0 ? ((altaComplejidadVol / total) * 100) : 0;

      // Encontrar centro principal
      let topCentro = '-';
      let topCentroPct = 0;
      const centrosEntries = Object.entries(centrosMap);
      if (centrosEntries.length > 0) {
        centrosEntries.sort((a, b) => b[1] - a[1]);
        topCentro = centrosEntries[0][0];
        topCentroPct = (centrosEntries[0][1] / pacs.length) * 100;
      }

      return { 
        total, c1, c2, c3, c4, c5, 
        altaComplejidadVol, altaComplejidadPct,
        promEspera, promEstadia, 
        esperaC1, esperaC2, esperaC3, esperaC4, esperaC5,
        altas, traslados, constataciones, 
        topCentro, topCentroPct 
      };
    };

    const res = {};
    datesToCompare.forEach(d => {
      res[d.date] = getStatsForDate(d.date);
    });
    return res;
  }, [fechaA, fechaB, fechaC, turnosDB, pacientesDB]);

  // Fase 2: ComposedChart Data con volumen y tiempo de espera por categoría
  const chartData = useMemo(() => {
    const sA = metrics[fechaA] || {};
    const sB = metrics[fechaB] || {};
    const sC = metrics[fechaC] || {};

    const keyVolA = `${aliasA} (Volumen)`;
    const keyVolB = `${aliasB} (Volumen)`;
    const keyVolC = `${aliasC} (Volumen)`;

    const keyWaitA = `${aliasA} (T. Espera min)`;
    const keyWaitB = `${aliasB} (T. Espera min)`;
    const keyWaitC = `${aliasC} (T. Espera min)`;

    return [
      { 
        name: 'C1', 
        desc: 'Reanimación / Paro',
        [keyVolC]: sC.c1 || 0, 
        [keyVolB]: sB.c1 || 0, 
        [keyVolA]: sA.c1 || 0,
        [keyWaitC]: sC.esperaC1 || 0,
        [keyWaitB]: sB.esperaC1 || 0,
        [keyWaitA]: sA.esperaC1 || 0,
      },
      { 
        name: 'C2', 
        desc: 'Emergencia / Alta Gravedad',
        [keyVolC]: sC.c2 || 0, 
        [keyVolB]: sB.c2 || 0, 
        [keyVolA]: sA.c2 || 0,
        [keyWaitC]: sC.esperaC2 || 0,
        [keyWaitB]: sB.esperaC2 || 0,
        [keyWaitA]: sA.esperaC2 || 0,
      },
      { 
        name: 'C3', 
        desc: 'Urgencia Mediana',
        [keyVolC]: sC.c3 || 0, 
        [keyVolB]: sB.c3 || 0, 
        [keyVolA]: sA.c3 || 0,
        [keyWaitC]: sC.esperaC3 || 0,
        [keyWaitB]: sB.esperaC3 || 0,
        [keyWaitA]: sA.esperaC3 || 0,
      },
      { 
        name: 'C4', 
        desc: 'Urgencia Menor',
        [keyVolC]: sC.c4 || 0, 
        [keyVolB]: sB.c4 || 0, 
        [keyVolA]: sA.c4 || 0,
        [keyWaitC]: sC.esperaC4 || 0,
        [keyWaitB]: sB.esperaC4 || 0,
        [keyWaitA]: sA.esperaC4 || 0,
      },
      { 
        name: 'C5', 
        desc: 'No Urgente / Consulta General',
        [keyVolC]: sC.c5 || 0, 
        [keyVolB]: sB.c5 || 0, 
        [keyVolA]: sA.c5 || 0,
        [keyWaitC]: sC.esperaC5 || 0,
        [keyWaitB]: sB.esperaC5 || 0,
        [keyWaitA]: sA.esperaC5 || 0,
      },
    ];
  }, [metrics, fechaA, fechaB, fechaC, aliasA, aliasB, aliasC]);

  // Indicador de tendencia genérico
  const getTrendIcon = (current, previous, invertGood = false) => {
    if (current === previous) return <Minus className="w-4 h-4 text-secondary-custom opacity-70" />;
    const isHigher = current > previous;
    // Si invertGood es true (como en tiempo de espera), mayor tiempo es malo (rojo) y menor es bueno (verde)
    const isPositive = invertGood ? !isHigher : isHigher;
    
    if (isPositive) {
      return <TrendingDown className="w-4 h-4 text-emerald-500 animate-pulse" />;
    }
    return <TrendingUp className="w-4 h-4 text-rose-500 animate-pulse" />;
  };

  const getPercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const diff = current - previous;
    const perc = (diff / previous) * 100;
    return `${perc > 0 ? '+' : ''}${perc.toFixed(1)}%`;
  };

  const handleCardClick = (date) => {
    if (setFiltroFechaInicio && setFiltroFechaFin && setActiveTab) {
      setFiltroFechaInicio(date);
      setFiltroFechaFin(date);
      setActiveTab('resumen');
    }
  };

  // Nombres de series para Recharts ComposedChart
  const seriesVolC = `${aliasC} (Volumen)`;
  const seriesVolB = `${aliasB} (Volumen)`;
  const seriesVolA = `${aliasA} (Volumen)`;

  const seriesWaitC = `${aliasC} (T. Espera min)`;
  const seriesWaitB = `${aliasB} (T. Espera min)`;
  const seriesWaitA = `${aliasA} (T. Espera min)`;

  return (
    <div className="space-y-6 animate-fade-in w-full px-2 md:px-6 pb-8 theme-transition">
      {/* Header y Descripción del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 rounded-3xl shadow-sm border border-card-custom">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-primary-custom">Rendimiento de Turnos — Evaluación de Equipos de Triage</h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Flujo & Admisión
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-semibold mt-0.5">
              Evaluación comparativa del rendimiento de los Equipos de Guardia (1, 2 y 3) en el flujo de admisión, latencia de categorización clínica y criterio de triaje sin distorsión de métricas médicas.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de las 3 Jornadas / Equipos Comparativos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {datesToCompare.map((d, i) => {
          const stats = metrics[d.date] || {};
          // El Periodo A se compara contra el Periodo B; el Periodo B contra el Periodo C
          const prevStats = i === 0 ? metrics[datesToCompare[1].date] : i === 1 ? metrics[datesToCompare[2].date] : null;
          const pctAltas = stats.total > 0 ? ((stats.altas / stats.total) * 100).toFixed(1) : '0.0';

          return (
            <div 
              key={d.short} 
              className="bg-card-custom rounded-[2rem] shadow-sm border-t-4 p-6 md:p-7 relative overflow-hidden border border-card-custom hover:shadow-xl transition-all duration-300 flex flex-col justify-between" 
              style={{ borderTopColor: d.color }}
            >
              <div>
                {/* Cabecera Tarjeta con Alias Visual del Equipo */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-[10px] font-black text-secondary-custom uppercase tracking-widest">
                      {d.short}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCardClick(d.date)}
                    className="flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-600 bg-indigo-500/5 hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    title="Ver detalle completo de este turno"
                  >
                    Detalle <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Fase 3: Editor de Alias Visual del Equipo */}
                <div className="mb-4 p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    {d.isEditing ? (
                      <input
                        type="text"
                        value={d.alias}
                        onChange={(e) => d.setAlias(e.target.value)}
                        onBlur={() => d.setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && d.setIsEditing(false)}
                        autoFocus
                        className="bg-input-custom text-xs font-black text-primary-custom px-2 py-1 rounded-lg border border-indigo-500 w-full outline-none"
                        placeholder="Ej: Turno Equipo 1"
                      />
                    ) : (
                      <span 
                        onClick={() => d.setIsEditing(true)}
                        className="text-xs font-black text-primary-custom truncate cursor-pointer hover:text-indigo-500 transition-colors"
                        title="Clic para editar el nombre del equipo"
                      >
                        {d.alias}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <select
                      value={equipoPresets.includes(d.alias) ? d.alias : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          d.setAlias(e.target.value);
                          d.setIsEditing(false);
                        } else {
                          d.setIsEditing(true);
                        }
                      }}
                      className="text-[10px] font-bold bg-transparent text-secondary-custom border-none outline-none cursor-pointer hover:text-primary-custom"
                    >
                      {equipoPresets.map(preset => (
                        <option key={preset} value={preset}>{preset}</option>
                      ))}
                      {!equipoPresets.includes(d.alias) && (
                        <option value="custom">Personalizado</option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => d.setIsEditing(!d.isEditing)}
                      className="p-1 text-secondary-custom hover:text-indigo-500 rounded-md transition-colors cursor-pointer"
                      title="Editar alias de equipo"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Selector de Fecha de la Jornada */}
                <div className="mb-5">
                  <label className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block mb-1">
                    Fecha de Jornada Asistencial:
                  </label>
                  <input 
                    type="date" 
                    value={d.date} 
                    onChange={(e) => d.setter(e.target.value)}
                    className="w-full border-2 rounded-xl p-2.5 text-sm font-black text-primary-custom outline-none focus:border-indigo-500 bg-input-custom transition-all cursor-pointer shadow-sm"
                    style={{ borderColor: `${d.color}35` }}
                  />
                </div>
                
                {/* FASE 1: LOS 3 KPIS PRINCIPALES DE EVALUACIÓN DE EQUIPO */}
                <div className="space-y-4 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Métricas de Desempeño del Equipo
                  </span>

                  {/* KPI 1: Volumen Total Ingresado */}
                  <div className="bg-slate-50/70 dark:bg-white/5 p-3 rounded-2xl border border-card-custom/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                        1. Volumen Total Ingresado
                      </span>
                      {prevStats && (
                        <div className={`flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-lg ${
                          stats.total < prevStats.total 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                            : stats.total > prevStats.total 
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-slate-100 text-secondary-custom'
                        }`}>
                          {getTrendIcon(stats.total, prevStats.total)}
                          <span className="ml-0.5">{getPercentChange(stats.total, prevStats.total)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-3xl font-black text-primary-custom leading-none mt-1.5">
                      {stats.total} <span className="text-xs font-bold text-secondary-custom">pacientes</span>
                    </p>
                    <span className="text-[9px] text-secondary-custom font-medium mt-1 block">
                      Carga global procesada por el equipo de admisión
                    </span>
                  </div>

                  {/* KPI 2: Tiempo Promedio a Triage (Latencia del Equipo) */}
                  <div className="bg-slate-50/70 dark:bg-white/5 p-3 rounded-2xl border border-card-custom/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                        2. Latencia Promedio a Triage
                      </span>
                      {prevStats && (
                        <div className={`flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-lg ${
                          stats.promEspera < prevStats.promEspera 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : stats.promEspera > prevStats.promEspera 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                            : 'bg-slate-100 text-secondary-custom'
                        }`}>
                          {/* Invertido: Menor tiempo de espera es positivo (verde) */}
                          {getTrendIcon(stats.promEspera, prevStats.promEspera, true)}
                          <span className="ml-0.5">{getPercentChange(stats.promEspera, prevStats.promEspera)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <Clock className="w-5 h-5 text-amber-500 self-center" />
                      <p className="text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
                        {stats.promEspera} <span className="text-xs font-bold text-secondary-custom">min</span>
                      </p>
                    </div>
                    <span className="text-[9px] text-secondary-custom font-medium mt-1 block">
                      Tiempo desde admisión a categorización clínica
                    </span>
                  </div>

                  {/* KPI 3: % de Alta Complejidad (C1 + C2 + C3) (Criterio del Equipo) */}
                  <div className="bg-slate-50/70 dark:bg-white/5 p-3 rounded-2xl border border-card-custom/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                        3. Criterio Alta Complejidad (C1+C2+C3)
                      </span>
                      {prevStats && (
                        <div className={`flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-lg ${
                          stats.altaComplejidadPct > prevStats.altaComplejidadPct 
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                            : stats.altaComplejidadPct < prevStats.altaComplejidadPct 
                            ? 'bg-slate-500/10 text-slate-600' 
                            : 'bg-slate-100 text-secondary-custom'
                        }`}>
                          {getTrendIcon(stats.altaComplejidadPct, prevStats.altaComplejidadPct)}
                          <span className="ml-0.5">{getPercentChange(stats.altaComplejidadPct, prevStats.altaComplejidadPct)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                        {stats.altaComplejidadPct.toFixed(1)}%
                      </p>
                      <span className="text-xs font-black text-primary-custom">
                        {stats.altaComplejidadVol} <span className="text-[10px] text-secondary-custom font-bold">pac.</span>
                      </span>
                    </div>
                    <span className="text-[9px] text-secondary-custom font-medium mt-1 block">
                      Proporción de demanda categorizada como urgente/crítica
                    </span>
                  </div>
                </div>

                {/* SECCIÓN 2: TIEMPOS DE FLUJO ASISTENCIAL */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                    Tiempos de Flujo
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-card-custom rounded-xl p-3 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[8px] font-black text-secondary-custom uppercase tracking-wider block">T. Espera Triaje</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1 mt-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {stats.promEspera > 0 ? `${stats.promEspera} min` : '0 min'}
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-xl p-3 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[8px] font-black text-secondary-custom uppercase tracking-wider block">T. Estadía Total</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-500 flex items-center justify-center gap-1 mt-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        {stats.promEstadia > 0 ? `${stats.promEstadia} min` : '0 min'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: DESENLACES ESPECIALES DE FLUJO */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                    Desenlaces Especiales
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-card-custom rounded-xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">Altas Admin</span>
                      <span className="text-xs font-black text-rose-500 block mt-1">
                        {stats.altas} ({pctAltas}%)
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">Traslados</span>
                      <span className="text-xs font-black text-violet-500 block mt-1">
                        {stats.traslados} pac.
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">Constat.</span>
                      <span className="text-xs font-black text-teal-600 dark:text-teal-500 block mt-1">
                        {stats.constataciones} pac.
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 4: CESFAM DE ORIGEN PRINCIPAL */}
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                    Principal CESFAM de Origen
                  </span>
                  <div className="flex justify-between items-center text-xs font-bold text-secondary-custom mt-2">
                    <span className="truncate max-w-[170px]" title={stats.topCentro}>{stats.topCentro}</span>
                    <span className="font-black text-primary-custom">{stats.topCentroPct > 0 ? `${stats.topCentroPct.toFixed(0)}%` : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Detalle de Categorización C1 a C5 y Latencia Específica */}
              <div className="space-y-2 border-t border-card-custom/20 pt-4 mt-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-secondary-custom uppercase tracking-widest block">
                    Detalle C1 - C5
                  </span>
                  <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase">
                    Volumen (Latencia min)
                  </span>
                </div>
                {[
                  { key: 'c1', waitKey: 'esperaC1', color: 'bg-red-500' },
                  { key: 'c2', waitKey: 'esperaC2', color: 'bg-orange-500' },
                  { key: 'c3', waitKey: 'esperaC3', color: 'bg-yellow-500' },
                  { key: 'c4', waitKey: 'esperaC4', color: 'bg-emerald-500' },
                  { key: 'c5', waitKey: 'esperaC5', color: 'bg-blue-500' }
                ].map(cat => (
                  <div key={cat.key} className="flex items-center justify-between border-b border-card-custom/10 pb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                      <span className="font-bold text-secondary-custom uppercase">{cat.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-primary-custom">
                        {stats[cat.key]} <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({stats[cat.waitKey]}m)</span>
                      </span>
                      {prevStats && (
                        <span className={`text-[9px] font-bold w-12 text-right ${stats[cat.key] < prevStats[cat.key] ? 'text-rose-400' : stats[cat.key] > prevStats[cat.key] ? 'text-emerald-400' : 'text-secondary-custom opacity-55'}`}>
                          {getPercentChange(stats[cat.key], prevStats[cat.key])}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FASE 2: GRÁFICO COMPOSEDCHART DE CLASIFICACIÓN Y LATENCIA POR CATEGORÍA */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-card-custom/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-primary-custom tracking-tight">
                Comparación Gráfica de Clasificación (Triaje) y Latencia por Categoría
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                ComposedChart Doble Eje
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Barras agrupadas: volumen de pacientes clasificados (Eje Y Izq.). Líneas continuas: tiempo promedio de espera a triage en minutos (Eje Y Der. ⏱️), permitiendo identificar cuellos de botella en C3 y C4.
            </p>
          </div>

          {/* Leyenda Visual de Ejes */}
          <div className="flex items-center gap-4 text-[11px] font-bold self-start md:self-auto bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-card-custom">
            <span className="flex items-center gap-1.5 text-primary-custom">
              <span className="w-3 h-3 rounded bg-indigo-500"></span> Barras: Pacientes (Volumen)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-3.5 h-0.5 bg-amber-500 inline-block"></span> Líneas: Latencia (Minutos)
            </span>
          </div>
        </div>

        <div className="h-[480px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 'bold' }} 
              />
              
              {/* Eje Y Izquierdo: Volumen de Pacientes */}
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold' }}
                unit=" pac"
              />

              {/* Eje Y Derecho: Tiempo de Espera a Triage en Minutos */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#d97706', fontSize: 12, fontWeight: 'bold' }}
                unit=" min"
              />

              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload;
                  return (
                    <div className="bg-card-custom p-4 rounded-2xl shadow-xl border border-card-custom space-y-3 min-w-[280px]">
                      <div className="border-b border-card-custom/40 pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">{label}</span>
                          <span className="text-[10px] text-secondary-custom font-bold">{item?.desc}</span>
                        </div>
                      </div>

                      {/* Sección Volumen */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">Volumen Ingresado</span>
                        {payload.filter(p => p.dataKey.includes('(Volumen)')).map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-bold text-secondary-custom">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                              {entry.name.replace(' (Volumen)', '')}
                            </span>
                            <span className="font-black text-primary-custom">{entry.value} pac.</span>
                          </div>
                        ))}
                      </div>

                      {/* Sección Tiempo de Espera */}
                      <div className="space-y-1.5 pt-2 border-t border-card-custom/30">
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Latencia de Triage Promedio
                        </span>
                        {payload.filter(p => p.dataKey.includes('(T. Espera min)')).map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-bold text-secondary-custom">
                              <span className="w-2.5 h-1 rounded" style={{ backgroundColor: entry.color }}></span>
                              {entry.name.replace(' (T. Espera min)', '')}
                            </span>
                            <span className="font-black text-amber-600 dark:text-amber-400">{entry.value} min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />

              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} 
              />

              {/* BARRAS DE VOLUMEN (EJE Y IZQUIERDO) */}
              <Bar 
                yAxisId="left"
                dataKey={seriesVolC} 
                name={seriesVolC} 
                fill={datesToCompare[2].color} 
                radius={[6, 6, 0, 0]} 
                barSize={24}
              />
              <Bar 
                yAxisId="left"
                dataKey={seriesVolB} 
                name={seriesVolB} 
                fill={datesToCompare[1].color} 
                radius={[6, 6, 0, 0]} 
                barSize={24}
              />
              <Bar 
                yAxisId="left"
                dataKey={seriesVolA} 
                name={seriesVolA} 
                fill={datesToCompare[0].color} 
                radius={[6, 6, 0, 0]} 
                barSize={24}
              />

              {/* LÍNEAS DE TIEMPO DE ESPERA PROMEDIO POR CATEGORÍA (EJE Y DERECHO) */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={seriesWaitC} 
                name={seriesWaitC} 
                stroke={datesToCompare[2].lineColor} 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: datesToCompare[2].lineColor }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={seriesWaitB} 
                name={seriesWaitB} 
                stroke={datesToCompare[1].lineColor} 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: datesToCompare[1].lineColor }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={seriesWaitA} 
                name={seriesWaitA} 
                stroke={datesToCompare[0].lineColor} 
                strokeWidth={3.5}
                dot={{ r: 5, fill: datesToCompare[0].lineColor }} 
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
