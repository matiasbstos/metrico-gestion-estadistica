import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { COLORS } from '../../config/constants';

export default function PanelKPIs({ statsKPI }) {
  if (!statsKPI) return null;

  const renderKPICard = (title, value, growthMonth, growthYear, prefix = '', suffix = '') => (
    <div className="bg-card-custom p-5 flex flex-col justify-between h-full min-h-[140px] relative theme-transition">
        <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-80">{title}</span>
        <div className="flex justify-between items-end mt-1 mb-2">
            <span className="text-3xl font-black text-primary-custom">
              {prefix}{value}
              {suffix ? <span className="text-sm font-bold ml-1 text-secondary-custom">{suffix}</span> : null}
            </span>
        </div>
        <div className="flex flex-col gap-1 mt-auto">
          {growthMonth !== undefined && (
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
              <span className="text-[9px] font-bold text-secondary-custom">Vs Mes Ant.</span>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${growthMonth > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {growthMonth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {growthMonth > 0 ? '+' : ''}{growthMonth.toFixed(1)}%
              </span>
            </div>
          )}
          {growthYear !== undefined && (
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
              <span className="text-[9px] font-bold text-secondary-custom">Vs Año Ant.</span>
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
      <div className={`p-5 flex flex-col justify-between h-full min-h-[140px] relative theme-transition bg-card-custom ${isAlert ? (isAnnual ? 'border-rose-400/50 bg-rose-500/10' : 'border-rose-500 bg-rose-500/10 animate-pulse') : ''}`}>
         <div className="flex items-center gap-2">
           <span className={`text-[10px] font-bold tracking-wider uppercase ${isAlert ? 'text-rose-500' : 'text-secondary-custom opacity-80'}`}>Altas Admin</span>
           <InfoTooltip text="Meta institucional: Mantener por debajo del 5% del volumen total." />
           {isAlert && <AlertTriangle className="w-3 h-3 text-rose-500" />}
         </div>
         <div className="flex justify-between items-end mt-1 mb-2">
             <span className={`text-3xl font-black ${isAlert ? 'text-rose-600 dark:text-rose-400' : 'text-rose-500'}`}>{altas}</span>
         </div>
         <div className="flex flex-col gap-1 mt-auto">
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                <span className={`text-[10px] font-bold ${isAlert ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-500'}`}>{pct.toFixed(1)}% del total</span>
            </div>
            {growthMonth !== undefined && (
              <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                <span className="text-[9px] font-bold text-secondary-custom">Vs Mes Ant.</span>
                <span className={`text-[10px] font-bold flex items-center gap-1 ${growthMonth > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {growthMonth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {growthMonth > 0 ? '+' : ''}{growthMonth.toFixed(1)}%
                </span>
              </div>
            )}
            {growthYear !== undefined && (
              <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                <span className="text-[9px] font-bold text-secondary-custom">Vs Año Ant.</span>
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
        <h3 className="text-xs font-bold text-secondary-custom tracking-wider uppercase mb-3 opacity-80">Global Anual (Year-to-Date)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {renderKPICard('Atenciones (Total)', statsKPI.anual.pacientes.current, undefined, undefined, '', '')}
          {renderKPICard('Rendimiento Global', statsKPI.anual.pacHora.current.toFixed(1), undefined, undefined, '', 'pac/h')}
          {renderKPICard('Estadía Promedio Global', statsKPI.anual.estadia.current > 0 ? `${Math.round(statsKPI.anual.estadia.current)}` : '0', undefined, undefined, '', 'min')}
          {renderAltasAdminCard(true)}
        </div>

        {/* Récords Diarios YTD */}
        {statsKPI.anual.recordPacWkdy && statsKPI.anual.recordPacWknd && statsKPI.anual.recordAltasWkdy && statsKPI.anual.recordAltasWknd && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-sky-500/10 dark:bg-sky-500/15 p-4 rounded-2xl border border-sky-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition">
              <div>
                <span className="text-[9px] md:text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wider uppercase">Récord Pac. Hábil (YTD)</span>
                <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">Fecha: {statsKPI.anual.recordPacWkdy.date}</p>
              </div>
              <span className="text-xl font-black text-sky-600 dark:text-sky-400 bg-sky-500/20 px-2.5 py-1 rounded-xl border border-sky-500/30 shadow-inner whitespace-nowrap">
                {statsKPI.anual.recordPacWkdy.count} <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 ml-0.5">pac.</span>
              </span>
            </div>

            <div className="bg-indigo-500/10 dark:bg-indigo-500/15 p-4 rounded-2xl border border-indigo-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition">
              <div>
                <span className="text-[9px] md:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Récord Pac. Finde/Fest (YTD)</span>
                <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">Fecha: {statsKPI.anual.recordPacWknd.date}</p>
              </div>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-xl border border-indigo-500/30 shadow-inner whitespace-nowrap">
                {statsKPI.anual.recordPacWknd.count} <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 ml-0.5">pac.</span>
              </span>
            </div>
            
            <div className="bg-amber-500/10 dark:bg-amber-500/15 p-4 rounded-2xl border border-amber-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition">
              <div>
                <span className="text-[9px] md:text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">Récord Altas Hábil (YTD)</span>
                <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">Fecha: {statsKPI.anual.recordAltasWkdy.date}</p>
              </div>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-inner whitespace-nowrap">
                {statsKPI.anual.recordAltasWkdy.count} <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-0.5">altas</span>
              </span>
            </div>

            <div className="bg-rose-500/10 dark:bg-rose-500/15 p-4 rounded-2xl border border-rose-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition">
              <div>
                <span className="text-[9px] md:text-[10px] font-bold text-rose-500 dark:text-rose-400 tracking-wider uppercase">Récord Altas Finde/Fest (YTD)</span>
                <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">Fecha: {statsKPI.anual.recordAltasWknd.date}</p>
              </div>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-xl border border-rose-500/30 shadow-inner whitespace-nowrap">
                {statsKPI.anual.recordAltasWknd.count} <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 ml-0.5">altas</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <hr className="border-card-custom/60 my-6 theme-transition" />

      {/* 2. KPIs PERIODO ACTUAL */}
      <div className="mb-6">
        <h3 className="text-xs font-bold accent-text-custom tracking-wider uppercase mb-3 bg-black/5 dark:bg-white/5 inline-block px-3 py-1 rounded-full border border-card-custom theme-transition">Periodo Seleccionado</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {renderKPICard('Atenciones', statsKPI.pacientes.current, statsKPI.pacientes.growthMonth, statsKPI.pacientes.growthYear)}
          {renderKPICard('Pac / Hora', statsKPI.pacHora.current.toFixed(1), statsKPI.pacHora.growthMonth, statsKPI.pacHora.growthYear)}
          {renderKPICard('Prom. Estadía', statsKPI.estadia.current > 0 ? `${Math.round(statsKPI.estadia.current)}` : '0', statsKPI.estadia.growthMonth, statsKPI.estadia.growthYear, '', 'min')}
          {renderAltasAdminCard()}
          {renderKPICard('Promedio Edad', statsKPI.demo.avgEdad, undefined, undefined, '', ' a.')}
          {renderKPICard('Pac. Fonasa', statsKPI.demo.fonasaPercent.toFixed(1), undefined, undefined, '', '%')}
        </div>
      </div>

      {/* 3. TRIAJE */}
      <div className="bg-card-custom p-6 flex flex-col md:flex-row items-center gap-6 mb-6 theme-transition">
        <span className="text-xs font-bold text-secondary-custom opacity-80 tracking-wider whitespace-nowrap uppercase">DISTRIBUCIÓN DE TRIAJE</span>
        <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-2 w-full">
          {statsKPI.categorias.map(c => {
             const colorKey = c.name === 'C3 (L)' ? 'c3_z518' : c.name.toLowerCase();
             return (
                <div key={c.name} className="border border-card-custom rounded-xl py-3 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                  <span className="text-xl font-black" style={{color: COLORS[colorKey]}}>{c.current}</span>
                  <span className="text-[10px] font-bold text-secondary-custom mt-1">{c.name}</span>
                  <div className="mt-2 w-full px-2 flex flex-col gap-1">
                    {c.growthMonth !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-secondary-custom opacity-70">M:</span>
                        <span className={`text-[9px] font-bold ${c.growthMonth > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {c.growthMonth > 0 ? '+' : ''}{c.growthMonth.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {c.growthYear !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-secondary-custom opacity-70">A:</span>
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
