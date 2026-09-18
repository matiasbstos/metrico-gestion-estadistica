import React, { useState, useMemo } from 'react';
import { 
  Building2, Calendar, TrendingUp, TrendingDown, ShieldAlert, 
  Activity, ArrowRight, Layers, Sparkles, Filter, Info, AlertCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { calcularImpactoHitoHospitalario } from '../../utils/turnosSarDemanda';

const COLORS_COMPLEJIDAD = {
  c1: '#ef4444', // Rojo - C1 Emergencia
  c2: '#f97316', // Naranja - C2 Muy Urgente
  c3: '#eab308'  // Amarillo - C3 Urgente
};

export default function AnalisisImpactoHito({ pacientesPool = [] }) {
  // Fecha hito por defecto: 15 de Junio de 2026 (hito de contingencia invernal y saturación de camas)
  const [fechaHito, setFechaHito] = useState('2026-06-15');
  const [tipoVistaVisual, setTipoVistaVisual] = useState('donut'); // 'donut' | 'barras'

  // Presets representativos de hitos hospitalarios y contingencias
  const presetsHitos = [
    { label: '15/06 - Peak Campaña Invierno', fecha: '2026-06-15' },
    { label: '01/07 - Contingencia Hospitalaria UEH', fecha: '2026-07-01' },
    { label: '15/08 - Feriado Asunción', fecha: '2026-08-15' },
    { label: '01/05 - Feriado Día del Trabajo', fecha: '2026-05-01' }
  ];

  const resultadoHito = useMemo(() => {
    return calcularImpactoHitoHospitalario(pacientesPool, fechaHito);
  }, [pacientesPool, fechaHito]);

  const {
    ventanaPre,
    ventanaPost,
    deltaAltaComplejidad,
    deltaAltaComplejidadPct,
    donutDataPre,
    donutDataPost,
    stackedData
  } = resultadoHito;

  const esIncremento = deltaAltaComplejidadPct >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm theme-transition mt-6">
      {/* Cabecera del Componente */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Análisis de Impacto Externo (Derivación)
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                Hito Hospitalario (±15 Días)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluación del comportamiento de categorizaciones de alta complejidad (C1, C2 y C3) antes y después de un hito asistencial.
            </p>
          </div>
        </div>

        {/* Selector DatePicker & Presets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <label htmlFor="fecha-hito-picker" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Fecha Hito:
            </label>
            <input 
              id="fecha-hito-picker"
              type="date"
              value={fechaHito}
              onChange={(e) => setFechaHito(e.target.value)}
              className="text-xs font-black bg-transparent text-slate-800 dark:text-slate-100 border-none outline-none focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Toggle de Visualización */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
            <button
              onClick={() => setTipoVistaVisual('donut')}
              className={`px-3 py-1 rounded-lg transition-all ${
                tipoVistaVisual === 'donut' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Donut (Pre vs Post)
            </button>
            <button
              onClick={() => setTipoVistaVisual('barras')}
              className={`px-3 py-1 rounded-lg transition-all ${
                tipoVistaVisual === 'barras' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              100% Apiladas
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Presets Rápidos */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto text-[11px] font-bold">
        <span className="text-[10px] uppercase font-black text-slate-400 whitespace-nowrap">Hitos Clave:</span>
        {presetsHitos.map(preset => (
          <button
            key={preset.fecha}
            onClick={() => setFechaHito(preset.fecha)}
            className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
              fechaHito === preset.fecha
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Fila de Tarjetas de Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* KPI 1: Variación de Alta Complejidad (C1+C2+C3) */}
        <div className={`rounded-2xl p-5 border transition-all ${
          esIncremento 
            ? 'bg-rose-500/5 border-rose-500/20' 
            : 'bg-emerald-500/5 border-emerald-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Variación Alta Complejidad
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
              esIncremento 
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            }`}>
              {esIncremento ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {esIncremento ? `+${deltaAltaComplejidadPct}%` : `${deltaAltaComplejidadPct}%`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${esIncremento ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {esIncremento ? `+${deltaAltaComplejidad}` : deltaAltaComplejidad}
            </span>
            <span className="text-xs font-bold text-slate-500">pac. complejos (C1-C3)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pre-Hito: <span className="font-bold">{ventanaPre.altaComplejidad} pac.</span> → Post-Hito: <span className="font-bold">{ventanaPost.altaComplejidad} pac.</span>
          </p>
        </div>

        {/* KPI 2: Ventana Pre-Hito (-15 días) */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ventana Pre-Hito (-15d)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {ventanaPre.inicio} al {ventanaPre.fin}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {ventanaPre.altaComplejidad}
            </span>
            <span className="text-xs font-bold text-slate-500">pacientes C1/C2/C3</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span><strong className="text-rose-500">C1:</strong> {ventanaPre.c1}</span>
            <span><strong className="text-orange-500">C2:</strong> {ventanaPre.c2}</span>
            <span><strong className="text-amber-500">C3:</strong> {ventanaPre.c3}</span>
            <span className="ml-auto font-black text-slate-700 dark:text-slate-200">
              Ratio: {ventanaPre.ratioSeveridadPct}%
            </span>
          </div>
        </div>

        {/* KPI 3: Ventana Post-Hito (+15 días) */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ventana Post-Hito (+15d)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {ventanaPost.inicio} al {ventanaPost.fin}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {ventanaPost.altaComplejidad}
            </span>
            <span className="text-xs font-bold text-slate-500">pacientes C1/C2/C3</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span><strong className="text-rose-500">C1:</strong> {ventanaPost.c1}</span>
            <span><strong className="text-orange-500">C2:</strong> {ventanaPost.c2}</span>
            <span><strong className="text-amber-500">C3:</strong> {ventanaPost.c3}</span>
            <span className="ml-auto font-black text-slate-700 dark:text-slate-200">
              Ratio: {ventanaPost.ratioSeveridadPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos Visuales de Distribución Exclusiva C1, C2 y C3 */}
      {tipoVistaVisual === 'donut' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          {/* Donut Pre-Hito */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1">
              Distribución Pre-Hito (-15 Días)
            </span>
            <span className="text-[10px] text-slate-400 font-bold mb-3">
              Total C1-C3: {ventanaPre.altaComplejidad} pacientes
            </span>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutDataPre}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {donutDataPre.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name, item) => [
                      `${val} pacientes (${item.payload.pct}%)`, 
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Post-Hito */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1">
              Distribución Post-Hito (+15 Días)
            </span>
            <span className="text-[10px] text-slate-400 font-bold mb-3">
              Total C1-C3: {ventanaPost.altaComplejidad} pacientes
            </span>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutDataPost}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {donutDataPost.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name, item) => [
                      `${val} pacientes (${item.payload.pct}%)`, 
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Barras Apiladas al 100% */
        <div className="bg-slate-50/50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Proporción Relativa de Alta Complejidad (100% Stacked)
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              Comparativa Directa Pre vs Post Hito
            </span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis type="number" domain={[0, 'auto']} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis dataKey="periodo" type="category" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-primary)' }} width={120} />
                <Tooltip 
                  formatter={(val, name) => [
                    `${val} pac.`, 
                    name === 'c1' ? 'C1 (Emergencia)' : name === 'c2' ? 'C2 (Muy Urgente)' : 'C3 (Urgente)'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="c1" name="C1 (Emergencia)" stackId="alta" fill={COLORS_COMPLEJIDAD.c1} radius={[0, 0, 0, 0]} />
                <Bar dataKey="c2" name="C2 (Muy Urgente)" stackId="alta" fill={COLORS_COMPLEJIDAD.c2} radius={[0, 0, 0, 0]} />
                <Bar dataKey="c3" name="C3 (Urgente)" stackId="alta" fill={COLORS_COMPLEJIDAD.c3} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Nota Clínica y Dictamen de Auditoría */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          <strong>Dictamen Asistencial:</strong> {esIncremento 
            ? `Tras el hito hospitalario del ${fechaHito}, se evidencia un incremento de +${deltaAltaComplejidadPct}% en la demanda de alta complejidad (C1 a C3), lo que refleja mayor retención en box de reanimación y observación médica en el SAR.`
            : `El período post-hito registra una reducción de ${deltaAltaComplejidadPct}% en pacientes categorizados C1 a C3, reflejando estabilización en la derivación hospitalaria externa.`}
        </p>
      </div>
    </div>
  );
}
