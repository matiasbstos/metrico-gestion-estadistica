import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { COLORS } from '../../config/constants';

export default function PanelKPIs({ statsKPI }) {
  if (!statsKPI) return null;

  const renderKPICard = (title, value, growthMonth, growthYear, prefix = '', suffix = '', colorClass = 'text-slate-800') => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full min-h-[140px] relative">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{title}</span>
        <div className="flex justify-between items-end mt-1 mb-2">
            <span className={`text-3xl font-black ${colorClass}`}>{prefix}{value}{suffix ? <span className="text-sm font-bold ml-1">{suffix}</span> : null}</span>
        </div>
        <div className="flex flex-col gap-1 mt-auto">
          {growthMonth !== undefined && (
            <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
              <span className="text-[9px] font-bold text-slate-500">Vs Mes Ant.</span>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${growthMonth > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {growthMonth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {growthMonth > 0 ? '+' : ''}{growthMonth.toFixed(1)}%
              </span>
            </div>
          )}
          {growthYear !== undefined && (
            <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
              <span className="text-[9px] font-bold text-slate-500">Vs Año Ant.</span>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${growthYear > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {growthYear > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {growthYear > 0 ? '+' : ''}{growthYear.toFixed(1)}%
              </span>
            </div>
          )}
          {growthMonth === undefined && growthYear === undefined && (
             <span className="text-[10px] font-medium text-transparent select-none">.</span>
          )}
        </div>
    </div>
  );

  const renderAltasAdminCard = (isAnnual = false) => {
    const total = isAnnual ? statsKPI.anual.pacientes.current : statsKPI.pacientes.current;
    const altas = isAnnual ? statsKPI.anual.altasAdmin.current : statsKPI.altasAdmin.current;
    const pct = total > 0 ? (altas / total) * 100 : 0;
    const isAlert = pct > 5;
    const growthMonth = isAnnual ? undefined : statsKPI.altasAdmin.growthMonth;
    const growthYear = isAnnual ? undefined : statsKPI.altasAdmin.growthYear;

    return (
      <div className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between h-full min-h-[140px] relative transition-colors ${isAlert ? (isAnnual ? 'bg-rose-50 border-rose-200' : 'bg-rose-50 border-rose-200 animate-pulse') : 'bg-white border-slate-100'}`}>
         <div className="flex items-center gap-2">
           <span className={`text-[10px] font-bold tracking-wider uppercase ${isAlert ? 'text-rose-600' : 'text-slate-400'}`}>Altas Admin</span>
           <InfoTooltip text="Meta institucional: Mantener por encima del 5% del volumen total." />
           {isAlert && <AlertTriangle className="w-3 h-3 text-rose-500" />}
         </div>
         <div className="flex justify-between items-end mt-1 mb-2">
             <span className={`text-3xl font-black ${isAlert ? 'text-rose-700' : 'text-rose-500'}`}>{altas}</span>
         </div>
         <div className="flex flex-col gap-1 mt-auto">
            <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                <span className={`text-[10px] font-bold ${isAlert ? 'text-rose-800' : 'text-emerald-600'}`}>{pct.toFixed(1)}% del total</span>
            </div>
            {growthMonth !== undefined && (
              <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                <span className="text-[9px] font-bold text-slate-500">Vs Mes Ant.</span>
                <span className={`text-[10px] font-bold flex items-center gap-1 ${growthMonth > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {growthMonth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {growthMonth > 0 ? '+' : ''}{growthMonth.toFixed(1)}%
                </span>
              </div>
            )}
            {growthYear !== undefined && (
              <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                <span className="text-[9px] font-bold text-slate-500">Vs Año Ant.</span>
                <span className={`text-[10px] font-bold flex items-center gap-1 ${growthYear > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {growthYear > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {growthYear > 0 ? '+' : ''}{growthYear.toFixed(1)}%
                </span>
              </div>
            )}
         </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. KPIs ANUALES */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-3">Global Anual (Year-to-Date)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {renderKPICard('Atenciones (Total)', statsKPI.anual.pacientes.current, undefined, undefined, '', '')}
          {renderKPICard('Rendimiento Global', statsKPI.anual.pacHora.current.toFixed(1), undefined, undefined, '', 'pac/h', 'text-blue-600')}
          {renderKPICard('Estadía Promedio Global', statsKPI.anual.estadia.current > 0 ? `${Math.round(statsKPI.anual.estadia.current)}` : '0', undefined, undefined, '', 'min', 'text-indigo-500')}
          {renderAltasAdminCard(true)}
        </div>
      </div>

      {/* 2. KPIs PERIODO ACTUAL */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-sky-600 tracking-wider uppercase mb-3 bg-sky-50 inline-block px-3 py-1 rounded-full border border-sky-100">Periodo Seleccionado</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {renderKPICard('Atenciones', statsKPI.pacientes.current, statsKPI.pacientes.growthMonth, statsKPI.pacientes.growthYear)}
          {renderKPICard('Pac / Hora', statsKPI.pacHora.current.toFixed(1), statsKPI.pacHora.growthMonth, statsKPI.pacHora.growthYear, '', '', 'text-blue-600')}
          {renderKPICard('Prom. Estadía', statsKPI.estadia.current > 0 ? `${Math.round(statsKPI.estadia.current)}` : '0', statsKPI.estadia.growthMonth, statsKPI.estadia.growthYear, '', 'min', 'text-indigo-500')}
          {renderAltasAdminCard()}
          {renderKPICard('Promedio Edad', statsKPI.demo.avgEdad, undefined, undefined, '', ' a.', 'text-emerald-600')}
          {renderKPICard('Pac. Fonasa', statsKPI.demo.fonasaPercent.toFixed(1), undefined, undefined, '', '%', 'text-blue-500')}
        </div>
      </div>

      {/* 3. TRIAJE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 mb-6">
        <span className="text-xs font-bold text-slate-400 tracking-wider whitespace-nowrap">DISTRIBUCIÓN DE TRIAJE</span>
        <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-2 w-full">
          {statsKPI.categorias.map(c => {
             const colorKey = c.name === 'C3 (L)' ? 'c3_z518' : c.name.toLowerCase();
             return (
                <div key={c.name} className="border border-slate-200 rounded-lg py-3 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition">
                  <span className="text-xl font-black" style={{color: COLORS[colorKey]}}>{c.current}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">{c.name}</span>
                  <div className="mt-2 w-full px-2 flex flex-col gap-1">
                    {c.growthMonth !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-slate-400">M:</span>
                        <span className={`text-[9px] font-bold ${c.growthMonth > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {c.growthMonth > 0 ? '+' : ''}{c.growthMonth.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {c.growthYear !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-slate-400">A:</span>
                        <span className={`text-[9px] font-bold ${c.growthYear > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {c.growthYear > 0 ? '+' : ''}{c.growthYear.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
             );
          })}
        </div>
      </div>
    </>
  );
}
