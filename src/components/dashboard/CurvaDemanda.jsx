import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, Tooltip, Legend, Area, Line, ResponsiveContainer, CartesianGrid, ComposedChart 
} from 'recharts';
import { Zap, Calendar, Clock, Activity } from 'lucide-react';
import { DOC_COLORS } from '../../config/constants';
import InfoTooltip from '../InfoTooltip';

export default function CurvaDemanda({
  peakHoursData,
  demandaFechaInicio,
  setDemandaFechaInicio,
  demandaFechaFin,
  setDemandaFechaFin,
  demandaViewMode,
  modoComparativo,
  docsToCompare
}) {
  const stats = useMemo(() => {
    let diasSeleccionados = 1;
    if (demandaFechaInicio && demandaFechaFin) {
      const d1 = new Date(demandaFechaInicio + 'T00:00:00');
      const d2 = new Date(demandaFechaFin + 'T00:00:00');
      const diff = Math.abs(d2.getTime() - d1.getTime());
      const days = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
      diasSeleccionados = Math.max(1, isNaN(days) ? 1 : days);
    }

    const totalPacientes = peakHoursData.reduce((acc, d) => acc + (d.atenciones || 0), 0);
    const promedioDiario = (totalPacientes / diasSeleccionados).toFixed(1);
    const promedioPorHora = (totalPacientes / (diasSeleccionados * 24)).toFixed(1);
    
    let maxHourObj = null;
    let maxVal = -1;
    peakHoursData.forEach(d => {
      if (d.atenciones > maxVal) {
        maxVal = d.atenciones;
        maxHourObj = d;
      }
    });
    
    const horaPico = maxHourObj ? maxHourObj.horaTooltip : '-';
    const maxPacientes = maxVal > 0 ? maxVal : 0;
    const maxPacientesPromedio = diasSeleccionados > 1 ? (maxPacientes / diasSeleccionados).toFixed(1) : maxPacientes;
    
    let mananaSum = 0;
    let tardeSum = 0;
    let nocheSum = 0;
    
    peakHoursData.forEach(d => {
      const h = d.hora !== undefined ? Number(d.hora) : parseInt(d.horaFiltro || 0, 10);
      if (h >= 8 && h < 14) mananaSum += (d.atenciones || 0);
      else if (h >= 14 && h < 20) tardeSum += (d.atenciones || 0);
      else nocheSum += (d.atenciones || 0); // 20:00 a 07:59
    });
    
    let blockMaxName = 'Noche';
    let blockMaxVal = nocheSum;
    let blockMaxHours = '20:00 - 07:59';
    
    if (mananaSum > blockMaxVal) {
      blockMaxName = 'Mañana';
      blockMaxVal = mananaSum;
      blockMaxHours = '08:00 - 13:59';
    }
    if (tardeSum > blockMaxVal) {
      blockMaxName = 'Tarde';
      blockMaxVal = tardeSum;
      blockMaxHours = '14:00 - 19:59';
    }
    
    const blockMaxPct = totalPacientes > 0 ? ((blockMaxVal / totalPacientes) * 100).toFixed(1) : 0;
    
    return {
      diasSeleccionados,
      totalPacientes,
      promedioDiario,
      promedioPorHora,
      horaPico,
      maxPacientes,
      maxPacientesPromedio,
      blockMaxName,
      blockMaxHours,
      blockMaxPct,
      blockMaxVal
    };
  }, [peakHoursData, demandaFechaInicio, demandaFechaFin]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 mt-6 w-full flex flex-col min-h-[480px] theme-transition">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
         <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 animate-pulse"/>
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              Curva de Demanda Continua (00:00 - 23:59)
              <InfoTooltip title="Curva de Demanda" text="Analiza los 'Peak Hours' o franjas de máxima congestión a lo largo del día o período seleccionado." />
            </h2>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-sm">
                <Calendar className="w-4 h-4 text-slate-400 ml-2"/>
                <input type="date" value={demandaFechaInicio} onChange={e => setDemandaFechaInicio(e.target.value)} className="text-xs border-none focus:ring-0 text-slate-600 dark:text-slate-300 bg-transparent p-1 outline-none"/>
                <span className="text-slate-300">-</span>
                <input type="date" value={demandaFechaFin} onChange={e => setDemandaFechaFin(e.target.value)} className="text-xs border-none focus:ring-0 text-slate-600 dark:text-slate-300 bg-transparent p-1 outline-none"/>
            </div>
         </div>
      </div>

      {/* Tarjetas Indicadoras de la Curva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Tarjeta 1: Volumen Total */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm theme-transition">
          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Volumen Total Acumulado</span>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{stats.totalPacientes} <span className="text-xs font-bold text-slate-500">pac.</span></p>
          <span className="text-[9px] font-bold text-slate-400 block mt-1">{stats.diasSeleccionados} {stats.diasSeleccionados === 1 ? 'día seleccionado' : 'días evaluados'}</span>
        </div>
        
        {/* Tarjeta 2: Hora Peak */}
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 shadow-sm theme-transition">
          <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider block">Peak Máximo de Demanda</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.horaPico}</p>
          <span className="text-[9px] font-bold text-rose-400 dark:text-rose-500/60 block mt-1">
            {stats.diasSeleccionados > 1 ? `${stats.maxPacientes} pac. total (~${stats.maxPacientesPromedio} pac/día)` : `${stats.maxPacientes} admisiones`}
          </span>
        </div>

        {/* Tarjeta 3: Bloque Mayor Flujo */}
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 shadow-sm theme-transition">
          <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">Bloque Más Congestionado</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.blockMaxName} <span className="text-xs font-bold text-indigo-500">{stats.blockMaxPct}%</span></p>
          <span className="text-[9px] font-bold text-indigo-400 dark:text-indigo-500/60 block mt-1">{stats.blockMaxHours} • {stats.blockMaxVal} pac.</span>
        </div>

        {/* Tarjeta 4: Promedio Diario & Horario */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 shadow-sm theme-transition">
          <span className="text-[9px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider block">Promedio Diario de Admisión</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.promedioDiario} <span className="text-xs font-bold text-amber-500">pac./día</span></p>
          <span className="text-[9px] font-bold text-amber-400 dark:text-amber-500/60 block mt-1">~{stats.promedioPorHora} pac./hr de servicio ({stats.diasSeleccionados} d)</span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[300px] w-full mt-2">
        {peakHoursData.some(d => d.atenciones > 0 || (modoComparativo && d.periodoB > 0)) ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemanda" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="horaCorta" fontSize={10} tickMargin={5} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize:'11px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} labelFormatter={(label, payload) => String((payload && payload.length > 0) ? payload[0].payload.horaTooltip : label)} />
              <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold'}} />
              
              {demandaViewMode === 'total' ? (
                  <Area type="monotone" dataKey="atenciones" name="Total Pacientes" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorDemanda)" />
              ) : null}
              
              {demandaViewMode === 'periodos' ? (
                  <Line type="monotone" dataKey="atenciones" name="Periodo A" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{r: 5}} />
              ) : null}
              
              {demandaViewMode === 'periodos' ? (
                  <Line type="monotone" dataKey="periodoB" name="Periodo B" stroke="#fbbf24" strokeWidth={3} dot={false} activeDot={{r: 5}} />
              ) : null}
              
              {demandaViewMode === 'doctores' ? (
                  docsToCompare.map((doc, idx) => (
                      <Line key={doc} type="monotone" dataKey={doc} name={doc} stroke={DOC_COLORS[idx % DOC_COLORS.length]} strokeWidth={2} dot={false} activeDot={{r: 5}} />
                  ))
              ) : null}

            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">Sin datos de admisión registrados en este periodo.</div>
        )}
      </div>
    </div>
  );
}
