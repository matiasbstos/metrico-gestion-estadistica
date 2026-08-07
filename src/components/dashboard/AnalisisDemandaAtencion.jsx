import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Calendar, BarChart2, Activity, ArrowUpRight, ArrowDownRight,
  Sparkles, FileSpreadsheet, Download, RefreshCw, Filter, CheckCircle2, ShieldAlert, Info,
  Sun, Snowflake, ThermometerSun, Wind, HelpCircle, ChevronRight
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import * as XLSX from 'xlsx';

export default function AnalisisDemandaAtencion({ 
  pacientesDB = [], 
  turnosDB = [], 
  filtroFechaInicio, 
  filtroFechaFin,
  kpisBigQuery 
}) {
  const currentYearDefault = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYearDefault);
  const [compareYear, setCompareYear] = useState(currentYearDefault - 1);
  const [metricMode, setMetricMode] = useState('admitidos'); // 'admitidos' | 'atendidos' | 'altas'
  const [selectedMonthModal, setSelectedMonthModal] = useState(null);

  const mesesNombres = [
    { num: 1, key: '01', short: 'Ene', full: 'Enero', estacion: 'Verano ☀️' },
    { num: 2, key: '02', short: 'Feb', full: 'Febrero', estacion: 'Verano ☀️' },
    { num: 3, key: '03', short: 'Mar', full: 'Marzo', estacion: 'Otoño 🍂' },
    { num: 4, key: '04', short: 'Abr', full: 'Abril', estacion: 'Otoño 🍂' },
    { num: 5, key: '05', short: 'May', full: 'Mayo', estacion: 'Otoño 🍂' },
    { num: 6, key: '06', short: 'Jun', full: 'Junio', estacion: 'Invierno ❄️' },
    { num: 7, key: '07', short: 'Jul', full: 'Julio', estacion: 'Invierno ❄️' },
    { num: 8, key: '08', short: 'Ago', full: 'Agosto', estacion: 'Invierno ❄️' },
    { num: 9, key: '09', short: 'Sep', full: 'Septiembre', estacion: 'Primavera 🌸' },
    { num: 10, key: '10', short: 'Oct', full: 'Octubre', estacion: 'Primavera 🌸' },
    { num: 11, key: '11', short: 'Nov', full: 'Noviembre', estacion: 'Primavera 🌸' },
    { num: 12, key: '12', short: 'Dic', full: 'Diciembre', estacion: 'Verano ☀️' }
  ];

  // Cálculo de Métricas Mensuales para un Año Específico
  const getMonthlyStatsForYear = (targetYr) => {
    const statsByMonth = {};
    mesesNombres.forEach(m => {
      statsByMonth[m.key] = {
        monthKey: m.key,
        name: m.short,
        fullName: m.full,
        estacion: m.estacion,
        admitidos: 0,
        atendidos: 0,
        altas: 0,
        turnosCount: 0
      };
    });

    // 1. Agregar desde turnosDB (Agregado por turno)
    (turnosDB || []).forEach(t => {
      if (!t.fechaInicio) return;
      const parts = String(t.fechaInicio).split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const mKey = parts[1];
        if (y === targetYr && statsByMonth[mKey]) {
          const tot = Number(t.totalPacientes || 0);
          const altasVal = Number(t.altasAdmin || 0);
          const atend = Math.max(0, tot - altasVal);
          statsByMonth[mKey].admitidos += tot;
          statsByMonth[mKey].altas += altasVal;
          statsByMonth[mKey].atendidos += atend;
          statsByMonth[mKey].turnosCount += 1;
        }
      }
    });

    // 2. Si turnosDB está vacío para ese mes pero existen pacientesDB individuales
    if (pacientesDB && pacientesDB.length > 0) {
      const pacCountsByMonth = {};
      mesesNombres.forEach(m => { pacCountsByMonth[m.key] = { admitidos: 0, altas: 0 }; });

      pacientesDB.forEach(p => {
        if (!p.tAdmision) return;
        const d = new Date(p.tAdmision);
        if (d.getFullYear() === targetYr) {
          const mKey = String(d.getMonth() + 1).padStart(2, '0');
          if (pacCountsByMonth[mKey]) {
            pacCountsByMonth[mKey].admitidos += 1;
            const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
            if (dest.includes('alta') || dest.includes('domicilio')) {
              pacCountsByMonth[mKey].altas += 1;
            }
          }
        }
      });

      mesesNombres.forEach(m => {
        const mKey = m.key;
        if (statsByMonth[mKey].admitidos === 0 && pacCountsByMonth[mKey].admitidos > 0) {
          statsByMonth[mKey].admitidos = pacCountsByMonth[mKey].admitidos;
          statsByMonth[mKey].altas = pacCountsByMonth[mKey].altas;
          statsByMonth[mKey].atendidos = Math.max(0, pacCountsByMonth[mKey].admitidos - pacCountsByMonth[mKey].altas);
        }
      });
    }

    return statsByMonth;
  };

  const monthlyStatsCurrent = useMemo(() => getMonthlyStatsForYear(selectedYear), [selectedYear, turnosDB, pacientesDB]);
  const monthlyStatsCompare = useMemo(() => getMonthlyStatsForYear(compareYear), [compareYear, turnosDB, pacientesDB]);

  // Estructura de datos para el Gráfico Comparativo Recharts
  const chartData12Meses = useMemo(() => {
    return mesesNombres.map(m => {
      const cur = monthlyStatsCurrent[m.key] || { admitidos: 0, atendidos: 0, altas: 0 };
      const prev = monthlyStatsCompare[m.key] || { admitidos: 0, atendidos: 0, altas: 0 };

      return {
        mes: m.short,
        mesCompleto: m.full,
        [`Año ${selectedYear} (Admitidos)`]: cur.admitidos,
        [`Año ${selectedYear} (Atendidos)`]: cur.atendidos,
        [`Año ${selectedYear} (Altas)`]: cur.altas,
        [`Año ${compareYear} (Admitidos)`]: prev.admitidos,
        [`Año ${compareYear} (Atendidos)`]: prev.atendidos,
        [`Año ${compareYear} (Altas)`]: prev.altas,
        // Valores dinámicos según métrica seleccionada
        valCurrent: metricMode === 'admitidos' ? cur.admitidos : (metricMode === 'atendidos' ? cur.atendidos : cur.altas),
        valCompare: metricMode === 'admitidos' ? prev.admitidos : (metricMode === 'atendidos' ? prev.atendidos : prev.altas)
      };
    });
  }, [monthlyStatsCurrent, monthlyStatsCompare, selectedYear, compareYear, metricMode]);

  // Tarjetas procesadas con % de crecimiento interanual YoY
  const tarjetasMensuales = useMemo(() => {
    return mesesNombres.map(m => {
      const cur = monthlyStatsCurrent[m.key] || { admitidos: 0, atendidos: 0, altas: 0, turnosCount: 0 };
      const prev = monthlyStatsCompare[m.key] || { admitidos: 0, atendidos: 0, altas: 0, turnosCount: 0 };

      const calcGrowth = (c, p) => {
        if (p === 0) return c > 0 ? '+100%' : '0%';
        const diff = ((c - p) / p) * 100;
        return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
      };

      return {
        ...m,
        admitidos: cur.admitidos,
        atendidos: cur.atendidos,
        altas: cur.altas,
        turnosCount: cur.turnosCount,
        growthAdmitidos: calcGrowth(cur.admitidos, prev.admitidos),
        growthAtendidos: calcGrowth(cur.atendidos, prev.atendidos),
        growthAltas: calcGrowth(cur.altas, prev.altas),
        prevAdmitidos: prev.admitidos,
        prevAtendidos: prev.atendidos,
        prevAltas: prev.altas
      };
    });
  }, [monthlyStatsCurrent, monthlyStatsCompare]);

  // Totales Globales del Año
  const totalesYear = useMemo(() => {
    let totAdmitidos = 0;
    let totAtendidos = 0;
    let totAltas = 0;
    let peakMonth = { name: '-', val: 0 };

    tarjetasMensuales.forEach(t => {
      totAdmitidos += t.admitidos;
      totAtendidos += t.atendidos;
      totAltas += t.altas;
      if (t.admitidos > peakMonth.val) {
        peakMonth = { name: t.full, val: t.admitidos };
      }
    });

    let prevAdmitidos = 0;
    Object.values(monthlyStatsCompare).forEach(p => { prevAdmitidos += p.admitidos; });

    const totalGrowth = prevAdmitidos > 0 ? (((totAdmitidos - prevAdmitidos) / prevAdmitidos) * 100).toFixed(1) : '0.0';

    return {
      totAdmitidos,
      totAtendidos,
      totAltas,
      peakMonth,
      totalGrowth
    };
  }, [tarjetasMensuales, monthlyStatsCompare]);

  // Exportar a Excel
  const handleExportExcel = () => {
    const dataExport = tarjetasMensuales.map(t => ({
      'Mes': t.full,
      'Estación': t.estacion,
      [`Pacientes Admitidos (${selectedYear})`]: t.admitidos,
      [`Pacientes Atendidos (${selectedYear})`]: t.atendidos,
      [`Altas Administrativas (${selectedYear})`]: t.altas,
      [`Admitidos (${compareYear})`]: t.prevAdmitidos,
      'Crecimiento Admitidos YoY': t.growthAdmitidos,
      'Crecimiento Atendidos YoY': t.growthAtendidos,
      'Crecimiento Altas YoY': t.growthAltas
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Demanda_${selectedYear}`);
    XLSX.writeFile(wb, `Reporte_Demanda_Atencion_${selectedYear}_vs_${compareYear}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* HEADER PRINCIPAL Y FILTROS */}
      <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-4 theme-transition backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                Análisis Específico de Demanda
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                12 Meses Interanual
              </span>
            </div>
            <h2 className="text-2xl font-black text-primary-custom tracking-tight flex items-center gap-2">
              <BarChart2 className="w-7 h-7 text-indigo-500" />
              Módulo de Demanda de Atención Asistencial
            </h2>
            <p className="text-xs text-secondary-custom font-medium max-w-3xl">
              Comparativa interanual completa de los 12 meses del año. Interpola admisiones, pacientes atendidos y altas administrativas entre el año actual y el período anterior.
            </p>
          </div>

          {/* CONTROLES DE FILTRO DE AÑO Y EXPORTACIÓN */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div className="flex items-center gap-2 bg-input-custom px-3 py-1.5 rounded-2xl border border-card-custom">
              <span className="text-xs font-bold text-secondary-custom">Año Principal:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent font-black text-primary-custom text-xs outline-none cursor-pointer"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-input-custom px-3 py-1.5 rounded-2xl border border-card-custom">
              <span className="text-xs font-bold text-secondary-custom">Comparar vs:</span>
              <select
                value={compareYear}
                onChange={e => setCompareYear(parseInt(e.target.value))}
                className="bg-transparent font-black text-primary-custom text-xs outline-none cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* BANDERAS KPI DE RESUMEN EJECUTIVO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-card-custom/40">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-card-custom space-y-1">
            <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider">Total Admitidos ({selectedYear})</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-primary-custom">{totalesYear.totAdmitidos.toLocaleString('es-CL')} <span className="text-xs font-bold text-secondary-custom">pac.</span></span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${Number(totalesYear.totalGrowth) >= 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'}`}>
                {totalesYear.totalGrowth}% YoY
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-card-custom space-y-1">
            <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider">Total Atendidos Médicos</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{totalesYear.totAtendidos.toLocaleString('es-CL')} <span className="text-xs font-bold text-secondary-custom">pac.</span></span>
              <span className="text-xs font-bold text-emerald-600">
                {totalesYear.totAdmitidos > 0 ? ((totalesYear.totAtendidos / totalesYear.totAdmitidos) * 100).toFixed(1) : 0}% Cobertura
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-card-custom space-y-1">
            <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider">Altas Administrativas</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{totalesYear.totAltas.toLocaleString('es-CL')} <span className="text-xs font-bold text-secondary-custom">altas</span></span>
              <span className="text-xs font-bold text-amber-600">
                {totalesYear.totAdmitidos > 0 ? ((totalesYear.totAltas / totalesYear.totAdmitidos) * 100).toFixed(1) : 0}% del total
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-card-custom space-y-1">
            <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider">Mes Pico de Sobrecarga</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{totalesYear.peakMonth.name}</span>
              <span className="text-xs font-black text-rose-600">{totalesYear.peakMonth.val.toLocaleString('es-CL')} pac</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. GRÁFICO COMPARATIVO INTERANUAL DE 12 MESES */}
      <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-4 theme-transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-custom/50 pb-4">
          <div>
            <h3 className="text-lg font-black text-primary-custom flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Gráfico Comparativo Interanual (12 Meses: {selectedYear} vs {compareYear})
            </h3>
            <p className="text-xs text-secondary-custom font-medium">
              Curva de interpolación mensual para evaluar la evolución estacional de la demanda.
            </p>
          </div>

          {/* SWITCHER DE MÉTRICA PARA EL GRÁFICO */}
          <div className="flex items-center gap-1 bg-input-custom p-1 rounded-2xl border border-card-custom">
            <button
              onClick={() => setMetricMode('admitidos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${metricMode === 'admitidos' ? 'bg-indigo-600 text-white shadow-xs' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Admitidos
            </button>
            <button
              onClick={() => setMetricMode('atendidos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${metricMode === 'atendidos' ? 'bg-indigo-600 text-white shadow-xs' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Atendidos
            </button>
            <button
              onClick={() => setMetricMode('altas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${metricMode === 'altas' ? 'bg-indigo-600 text-white shadow-xs' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Altas Admin
            </button>
          </div>
        </div>

        {/* ÁREA DEL GRÁFICO RECHARTS */}
        <div className="h-[360px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData12Meses} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorYearCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorYearCompare" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="mes" tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: 'currentColor', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.92)', 
                  borderColor: 'rgba(99, 102, 241, 0.3)', 
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="valCurrent" name={`Año ${selectedYear} (${metricMode})`} stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorYearCurrent)" />
              <Line type="monotone" dataKey="valCompare" name={`Año ${compareYear} (${metricMode})`} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS MENSUALES (GRID INTERACTIVO 12 MESES) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-primary-custom flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Tarjetas de Métricas Mensuales (Desglose de los 12 Meses de {selectedYear})
            </h3>
            <p className="text-xs text-secondary-custom font-medium">
              Estructura detallada: Admitidos (principal), Atendidos (secundario), Altas Administrativas y % de crecimiento vs {compareYear}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tarjetasMensuales.map((m) => (
            <div 
              key={m.key}
              onClick={() => setSelectedMonthModal(m)}
              className="bg-card-custom rounded-3xl p-5 border border-card-custom shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-4 hover:border-indigo-500/40 relative overflow-hidden group"
            >
              {/* Encabezado del mes */}
              <div className="flex items-center justify-between border-b border-card-custom/40 pb-2.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-secondary-custom block">{m.estacion}</span>
                  <h4 className="text-base font-black text-primary-custom group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {m.full}
                  </h4>
                </div>
                <span className="text-xs font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2.5 py-1 rounded-xl">
                  {selectedYear}
                </span>
              </div>

              {/* DATO PRINCIPAL: PACIENTES ADMITIDOS */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-secondary-custom">
                  1. Pacientes Admitidos (Principal)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-primary-custom tracking-tight">
                    {m.admitidos.toLocaleString('es-CL')} <span className="text-xs font-bold text-secondary-custom">pac.</span>
                  </span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    m.growthAdmitidos.startsWith('+') ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  }`}>
                    {m.growthAdmitidos.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {m.growthAdmitidos}
                  </span>
                </div>
              </div>

              {/* DATO SECUNDARIO: PACIENTES ATENDIDOS */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl space-y-1 border border-card-custom/40">
                <div className="flex justify-between items-center text-[10px] font-bold text-secondary-custom">
                  <span>2. Pacientes Atendidos:</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">{m.atendidos.toLocaleString('es-CL')} pac.</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-medium text-secondary-custom">
                  <span>Crecimiento YoY:</span>
                  <span className={`font-bold ${m.growthAtendidos.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.growthAtendidos} vs {compareYear}
                  </span>
                </div>
              </div>

              {/* TERCER DATO: ALTAS ADMINISTRATIVAS */}
              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="text-[11px] font-bold text-secondary-custom">3. Altas Admin:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-amber-600 dark:text-amber-400">{m.altas} altas</span>
                  <span className="text-[9px] font-bold text-secondary-custom">({m.growthAltas})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. APARTADO DE ANÁLISIS AUTOMÁTICO DE COMPORTAMIENTO (MOTOR ANALÍTICO) */}
      <div className="bg-card-custom rounded-3xl border border-card-custom p-6 shadow-sm space-y-5 theme-transition">
        <div className="flex items-center gap-3 border-b border-card-custom/50 pb-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-primary-custom">
              Informe Analítico de Comportamiento Asistencial
            </h3>
            <p className="text-xs text-secondary-custom font-medium">
              Evaluación sintética y conclusiones automáticas del comportamiento de admisiones en el SAR Elsa Romo Aravena.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-card-custom space-y-2">
            <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Presión y Picos Asistenciales
            </span>
            <p className="text-xs text-primary-custom leading-relaxed font-medium">
              El mes de mayor sobrecarga asistencial en {selectedYear} corresponde a <strong className="text-indigo-600">{totalesYear.peakMonth.name}</strong> con un total de <strong>{totalesYear.peakMonth.val.toLocaleString('es-CL')} pacientes admitidos</strong>. Se recomienda concentrar la programación de turnos de reemplazo y stock de insumos en dicha franja.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-card-custom space-y-2">
            <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Tendencia Interanual (YoY)
            </span>
            <p className="text-xs text-primary-custom leading-relaxed font-medium">
              En comparación con el año {compareYear}, la demanda global registró una variación interanual del <strong className={Number(totalesYear.totalGrowth) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{totalesYear.totalGrowth}%</strong>. El flujo constante en los picos de invierno reafirma la necesidad de reforzar triage inicial.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-card-custom space-y-2">
            <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Tasa de Retiro y Altas Admin.
            </span>
            <p className="text-xs text-primary-custom leading-relaxed font-medium">
              Se acumulan <strong>{totalesYear.totAltas.toLocaleString('es-CL')} altas administrativas</strong> en el período, representando un <strong>{totalesYear.totAdmitidos > 0 ? ((totalesYear.totAltas / totalesYear.totAdmitidos) * 100).toFixed(1) : 0}%</strong> del total de admisiones. Monitorear los tiempos de espera en franjas peak para mitigar fugas de pacientes sin atención médica.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
