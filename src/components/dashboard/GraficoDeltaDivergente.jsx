import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ReferenceLine, CartesianGrid, Cell 
} from 'recharts';
import { ArrowUpDown, TrendingUp, TrendingDown, Layers, Info, Calendar } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { agruparPorBloquesTemporales } from '../../utils/turnosSarDemanda';

const CustomTooltipDelta = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isSobrecarga = data.delta > 0;
  const isAlivio = data.delta < 0;

  return (
    <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md min-w-[220px]">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-700">
        <span className="font-black text-sm text-slate-100">{data.label || data.key}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${
          isSobrecarga 
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
            : isAlivio 
            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
            : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
        }`}>
          {isSobrecarga ? 'SOBRECARGA' : isAlivio ? 'ALIVIO' : 'EQUILIBRIO'}
        </span>
      </div>

      <div className="mb-2">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
          Variación Neta (Delta)
        </div>
        <div className={`text-xl font-black ${
          isSobrecarga ? 'text-rose-400' : isAlivio ? 'text-sky-400' : 'text-slate-300'
        }`}>
          {data.delta > 0 ? `+${data.delta}` : data.delta} <span className="text-xs font-bold">pacientes</span>
          {data.deltaPct !== 0 && (
            <span className="text-xs font-normal ml-1.5 opacity-90">
              ({data.deltaPct > 0 ? `+${data.deltaPct}%` : `${data.deltaPct}%`})
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
        <div>
          <span className="text-slate-400 block text-[9px] uppercase">Base (Activo)</span>
          <span className="font-bold text-emerald-400">{data.volumenBase} pac.</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px] uppercase">Contraste (Ref.)</span>
          <span className="font-bold text-indigo-300">{data.volumenContraste} pac.</span>
        </div>
      </div>
    </div>
  );
};

export default function GraficoDeltaDivergente({
  pacientesBase = [],
  pacientesContraste = [],
  baseInicio,
  baseFin,
  contrasteInicio,
  contrasteFin
}) {
  const [modoGranularidad, setModoGranularidad] = useState('auto');

  // Procesar bloques temporales
  const deltaResult = useMemo(() => {
    return agruparPorBloquesTemporales(
      pacientesBase,
      pacientesContraste,
      baseInicio,
      baseFin,
      contrasteInicio,
      contrasteFin,
      modoGranularidad
    );
  }, [pacientesBase, pacientesContraste, baseInicio, baseFin, contrasteInicio, contrasteFin, modoGranularidad]);

  const { blocks, resumen, granularidadEfectiva } = deltaResult;

  const getGranularidadLabel = (g) => {
    if (g === 'dia') return 'Día a Día (DD/MM)';
    if (g === 'semana') return 'Semanas (Agrupación)';
    return 'Meses Calendario';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm theme-transition">
      {/* CABECERA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Gráfico de Variación Neta (Delta Divergente)
              <InfoTooltip 
                title="Delta Divergente Operativo" 
                text="Representa la diferencia neta de demanda (Base menos Contraste). Las barras rojas hacia arriba representan sobrecarga de pacientes, mientras que las barras azules hacia abajo reflejan alivio asistencial." 
              />
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {getGranularidadLabel(granularidadEfectiva)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enfoque gerencial intuitivo: resalta exclusivamente anomalías, peaks de saturación y caídas de flujo sin sobrecarga visual.
          </p>
        </div>

        {/* SELECTOR DE GRANULARIDAD */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => setModoGranularidad('auto')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              modoGranularidad === 'auto'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => setModoGranularidad('dia')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              modoGranularidad === 'dia'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setModoGranularidad('semana')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              modoGranularidad === 'semana'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setModoGranularidad('mes')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              modoGranularidad === 'mes'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* TARJETAS KPI DE IMPACTO DELTA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Mayor Sobrecarga */}
        <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
            Mayor Sobrecarga Operativa
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {resumen.mayorSobrecarga ? `+${resumen.mayorSobrecarga.delta}` : '0'}
            </span>
            <span className="text-xs font-bold text-slate-500">pacientes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {resumen.mayorSobrecarga ? (resumen.mayorSobrecarga.label || resumen.mayorSobrecarga.key) : 'Sin peaks detectados'}
          </p>
        </div>

        {/* Mayor Alivio */}
        <div className="bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
            Mayor Alivio Asistencial
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {resumen.mayorAlivio ? resumen.mayorAlivio.delta : '0'}
            </span>
            <span className="text-xs font-bold text-slate-500">pacientes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {resumen.mayorAlivio ? (resumen.mayorAlivio.label || resumen.mayorAlivio.key) : 'Sin disminuciones registradas'}
          </p>
        </div>

        {/* Balance Neto */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Balance Neto del Período
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${
              resumen.balanceNeto > 0 
                ? 'text-rose-600 dark:text-rose-400' 
                : resumen.balanceNeto < 0 
                ? 'text-sky-600 dark:text-sky-400' 
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {resumen.balanceNeto > 0 ? `+${resumen.balanceNeto}` : resumen.balanceNeto}
            </span>
            <span className="text-xs font-bold text-slate-500">pacientes netos</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Base: {resumen.totalBase.toLocaleString('es-CL')} vs Contraste: {resumen.totalContraste.toLocaleString('es-CL')}
          </p>
        </div>
      </div>

      {/* GRÁFICO RECHARTS DIVERGENTE */}
      <div className="h-[300px] min-h-[300px] w-full">
        {blocks && blocks.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={blocks} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
              <XAxis 
                dataKey="key" 
                fontSize={10} 
                tickMargin={8} 
                axisLine={false} 
                tickLine={false} 
                interval={blocks.length > 25 ? 'preserveStartEnd' : 0} 
                minTickGap={10} 
                tick={{ fill: 'var(--text-secondary)' }} 
              />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)' }} 
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} />
              <Tooltip content={<CustomTooltipDelta />} />
              <Bar dataKey="delta" name="Variación Neta (Delta)" maxBarSize={36} radius={[4, 4, 4, 4]}>
                {blocks.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.delta >= 0 ? '#f43f5e' : '#0ea5e9'} 
                    fillOpacity={0.88}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No hay suficientes datos temporales para calcular la variación neta.
          </div>
        )}
      </div>

      {/* LEYENDA EXPLICATIVA INFERIOR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Sobrecarga (Demanda Base &gt; Contraste)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Alivio (Demanda Base &lt; Contraste)</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400">
          Línea discontinua central indica punto de equilibrio (Delta = 0).
        </span>
      </div>
    </div>
  );
}
