import React from 'react';
import { Clock } from 'lucide-react';
import { COLORS } from '../../config/constants';
import { formatTime } from '../../utils/helpers';
import InfoTooltip from '../InfoTooltip';

// Metas institucionales en minutos para comparación
const METAS = {
  admCat: 10, // Meta de categorización general: 10 minutos
  catAna: {
    c1: 0,
    c2: 15,
    c3: 30,
    c3_z518: 30,
    c4: 60,
    c5: 120,
    sincat: 60
  },
  anaAlt: {
    c1: 60,
    c2: 120,
    c3: 150,
    c3_z518: 150,
    c4: 120,
    c5: 90,
    sincat: 120
  },
  admAlt: {
    c1: 60,
    c2: 180,
    c3: 240,
    c3_z518: 240,
    c4: 300,
    c5: 360,
    sincat: 240
  }
};

export default function TablaTiemposEspera({ metricsByCategory, promediosGlobales }) {
  if (!metricsByCategory || !promediosGlobales) return null;

  const renderMetaCell = (value, meta, textColClass = 'text-primary-custom') => {
    if (value === null || value === undefined || isNaN(value)) {
      return <td className="p-3 text-center text-secondary-custom font-medium opacity-50">-</td>;
    }
    
    if (meta === 0) {
      return (
        <td className="p-3 text-center font-bold text-emerald-500 rounded-lg bg-emerald-500/10 border border-emerald-500/20 relative group cursor-help">
          <span className="relative z-10 flex items-center justify-center gap-1 text-[11px]">
            {formatTime(value)}
            <span className="text-[7px] font-black px-1 py-0.5 rounded bg-emerald-500 text-white animate-pulse">Meta</span>
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-xl">
            Atención Crítica Inmediata
          </div>
        </td>
      );
    }

    const pct = (value / meta) * 100;
    const isExceeded = value > meta;
    
    let barColorClass = 'bg-emerald-500/10 dark:bg-emerald-500/15';
    let labelColorClass = 'text-emerald-600 dark:text-emerald-400';
    let badgeColorClass = 'bg-emerald-500 text-white';
    let badgeText = 'Meta';
    
    if (isExceeded) {
      barColorClass = 'bg-rose-500/10 dark:bg-rose-500/15';
      labelColorClass = 'text-rose-600 dark:text-rose-400';
      badgeColorClass = 'bg-rose-500 text-white';
      badgeText = `+${Math.round(pct - 100)}%`;
    } else if (pct > 80) {
      barColorClass = 'bg-amber-500/10 dark:bg-amber-500/15';
      labelColorClass = 'text-amber-600 dark:text-amber-400';
      badgeColorClass = 'bg-amber-500 text-white';
      badgeText = 'Límite';
    }

    return (
      <td className="p-3 text-center font-bold transition-all relative overflow-hidden group cursor-help">
        <div 
          className={`absolute left-0 top-0 bottom-0 ${barColorClass} transition-all duration-500`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        <span className={`relative z-10 flex items-center justify-center gap-1 text-[11px] ${labelColorClass}`}>
          {formatTime(value)}
          <span className={`text-[7px] font-black px-1 py-0.5 rounded shadow-sm opacity-90 ${badgeColorClass}`}>
            {badgeText}
          </span>
        </span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-xl">
          Meta: <span className="font-bold">{meta}m</span> | Promedio: <span className="font-bold">{value.toFixed(1)}m</span> ({Math.round(pct)}%)
        </div>
      </td>
    );
  };

  return (
    <div className="bg-card-custom rounded-2xl border border-card-custom p-6 mt-6 overflow-visible theme-transition z-10 relative">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="accent-text-custom w-5 h-5"/>
        <h2 className="text-base font-bold text-primary-custom flex items-center gap-2">
          Tiempos de Espera y Estadía por Triaje
          <InfoTooltip title="Tiempos de Espera" text="Detalle en minutos del viaje del paciente según su categoría de riesgo. Las celdas comparan los tiempos contra metas institucionales utilizando barras de progreso de fondo." />
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-secondary-custom font-bold uppercase text-[10px] tracking-wider border-b border-card-custom">
              <th className="p-3 pb-2 rounded-tl-lg font-bold">Categoría</th>
              <th className="p-3 pb-2 text-center font-bold">Pacientes</th>
              <th className="p-3 pb-2 text-center font-bold">T. Admisión - Triaje</th>
              <th className="p-3 pb-2 text-center font-bold">T. Triaje - Atención</th>
              <th className="p-3 pb-2 text-center font-bold">T. Atención - Alta</th>
              <th className="p-3 pb-2 text-center rounded-tr-lg font-bold">Estadía Total</th>
            </tr>
          </thead>
          <tbody>
            {['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5', 'sincat'].map(cat => {
              const data = metricsByCategory ? metricsByCategory[cat] : null;
              if (!data || (data.total === 0 && cat === 'sincat')) return null; 
              
              return (
                <tr key={cat} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all group rounded-lg">
                  <td className="p-3 font-bold uppercase text-[11px] rounded-l-lg" style={{ color: COLORS[cat] }}>
                    {cat === 'sincat' ? 'Sin Categorizar' : (cat === 'c3_z518' ? 'C3 (LESIONES)' : `CATEGORÍA ${cat.toUpperCase()}`)}
                  </td>
                  <td className="p-3 text-center font-bold text-primary-custom">{data.total}</td>
                  {renderMetaCell(data.avgAdmCat, METAS.admCat)}
                  {renderMetaCell(data.avgCatAna, METAS.catAna[cat])}
                  {renderMetaCell(data.avgAnaAlt, METAS.anaAlt[cat])}
                  {renderMetaCell(data.avgAdmAlt, METAS.admAlt[cat])}
                </tr>
              );
            })}
            <tr><td colSpan="6" className="h-4"></td></tr>
            <tr className="bg-black/5 dark:bg-white/5 rounded-xl font-black text-xs">
              <td className="p-4 text-primary-custom rounded-l-xl uppercase">Total / Promedio Global</td>
              <td className="p-4 text-center text-primary-custom">{promediosGlobales?.totalPacientes || 0}</td>
              {renderMetaCell(promediosGlobales?.avgAdmCat, METAS.admCat)}
              {renderMetaCell(promediosGlobales?.avgCatAna, 45)} {/* Promedio ponderado estimado */}
              {renderMetaCell(promediosGlobales?.avgAnaAlt, 120)}
              {renderMetaCell(promediosGlobales?.avgAdmAlt, 180)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Glosario / Leyenda de Tiempos de Espera */}
      <div className="mt-6 pt-4 border-t border-card-custom grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex gap-2.5 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 text-xs font-semibold text-secondary-custom">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 flex-shrink-0 mt-0.5 animate-pulse"></span>
          <div>
            <p className="font-black text-emerald-600 dark:text-emerald-400">Verde: Meta Cumplida</p>
            <p className="text-[10px] text-secondary-custom opacity-80 mt-0.5">El promedio de espera/estadía se encuentra por debajo o igual al 80% del límite meta establecido.</p>
          </div>
        </div>
        <div className="flex gap-2.5 items-start bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 text-xs font-semibold text-secondary-custom">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 flex-shrink-0 mt-0.5"></span>
          <div>
            <p className="font-black text-amber-600 dark:text-amber-400">Amarillo: Nivel Límite</p>
            <p className="text-[10px] text-secondary-custom opacity-80 mt-0.5">El promedio está en zona de advertencia, superando el 80% pero manteniéndose bajo el 100% de la meta.</p>
          </div>
        </div>
        <div className="flex gap-2.5 items-start bg-red-500/5 p-3 rounded-xl border border-red-500/20 text-xs font-semibold text-secondary-custom">
          <span className="w-3.5 h-3.5 rounded bg-red-500 flex-shrink-0 mt-0.5 animate-pulse"></span>
          <div>
            <p className="font-black text-red-500">Rojo: Meta Excedida</p>
            <p className="text-[10px] text-secondary-custom opacity-80 mt-0.5">El promedio supera el 100% de la meta de tiempo institucional (se indica el % de desviación).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
