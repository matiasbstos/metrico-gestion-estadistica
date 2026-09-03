import React from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, Hourglass, 
  Users, Stethoscope, Ambulance, Clock, Sparkles, Activity, Award, ShieldAlert 
} from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { COLORS } from '../../config/constants';

export default function PanelKPIs({ 
  statsKPI, 
  onDemandaClick, 
  onMedicosClick, 
  onAltasClick, 
  onTrasladosClick, 
  onConstatacionesClick, 
  isLoading 
}) {
  if (!statsKPI) return null;

  const getGrowthBadge = (growth, isInverted = false) => {
    if (growth === undefined || growth === null || isNaN(growth)) return null;
    if (Math.abs(growth) < 0.001) {
      return {
        color: 'text-slate-400 dark:text-slate-400',
        icon: null,
        text: '0.0%'
      };
    }
    const isUp = growth > 0;
    // Métricas estándar (productividad, pacientes): sube = verde (positivo), baja = rojo (negativo).
    // Métricas invertidas (altas admin, estadía/esperas): sube = rojo (alerta/deterioro), baja = verde (mejora asistencial).
    const isGood = isInverted ? !isUp : isUp;
    return {
      color: isGood ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400',
      icon: isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />,
      text: `${isUp ? '+' : ''}${growth.toFixed(1)}%`
    };
  };

  const renderKPICard = (title, value, growthMonth, growthYear, prefix = '', suffix = '', isClickable = false, onClick = null, isInverted = false) => {
    const badgeMonth = getGrowthBadge(growthMonth, isInverted);
    const badgeYear = getGrowthBadge(growthYear, isInverted);

    return (
      <div 
        onClick={isClickable ? onClick : undefined}
        className={`bg-card-custom p-5 flex flex-col justify-between h-full min-h-[140px] relative theme-transition hover:z-30 hover:shadow-lg group ${isClickable ? 'cursor-pointer hover:border-indigo-500 hover:-translate-y-0.5' : ''}`}
      >
        {isClickable && (
          <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-secondary-custom/40 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
        )}
        <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-80">{title}</span>
        <div className="flex justify-between items-end mt-1 mb-2">
            <span className="text-3xl font-black text-primary-custom flex items-baseline">
              {isLoading ? (
                <span className="animate-pulse text-indigo-500/70">...</span>
              ) : (
                <>
                  {prefix}{value}
                  {suffix ? <span className="text-sm font-bold ml-1 text-secondary-custom">{suffix}</span> : null}
                </>
              )}
            </span>
        </div>
        <div className="flex flex-col gap-1 mt-auto">
          {isLoading ? (
            <div className="space-y-1">
              <div className="h-3 w-16 bg-slate-300/35 dark:bg-white/5 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-slate-300/35 dark:bg-white/5 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              {badgeMonth && (
                <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                  <span className="text-[9px] font-bold text-secondary-custom">Vs Mes Ant.</span>
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${badgeMonth.color}`}>
                    {badgeMonth.icon}
                    {badgeMonth.text}
                  </span>
                </div>
              )}
              {badgeYear && (
                <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                  <span className="text-[9px] font-bold text-secondary-custom">Vs Año Ant.</span>
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${badgeYear.color}`}>
                    {badgeYear.icon}
                    {badgeYear.text}
                  </span>
                </div>
              )}
              {!badgeMonth && !badgeYear && (
                 <span className="text-[10px] font-medium text-transparent select-none">.</span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAltasAdminCard = (isAnnual = false) => {
    const total = isAnnual ? statsKPI.anual.pacientes.current : statsKPI.pacientes.current;
    const altas = isAnnual ? statsKPI.anual.altasAdmin.current : statsKPI.altasAdmin.current;
    const pct = total > 0 ? (altas / total) * 100 : 0;
    const isAlert = pct > 5;
    const growthMonth = isAnnual ? undefined : statsKPI.altasAdmin?.growthMonth;
    const growthYear = isAnnual ? statsKPI.anual?.altasAdmin?.growthYear : statsKPI.altasAdmin?.growthYear;

    const badgeMonth = getGrowthBadge(growthMonth, true);
    const badgeYear = getGrowthBadge(growthYear, true);

    return (
      <div 
        onClick={onAltasClick}
        className={`p-5 flex flex-col justify-between h-full min-h-[140px] relative theme-transition bg-card-custom border rounded-2xl cursor-pointer hover:z-30 hover:shadow-lg group hover:-translate-y-0.5 ${isAlert ? 'border-red-500 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 glow-red-alert hover:border-red-650' : 'border-card-custom hover:border-indigo-500'}`}
      >
         <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-secondary-custom/40 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
         <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold tracking-wider uppercase ${isAlert ? 'text-red-600 dark:text-red-400 font-black' : 'text-secondary-custom opacity-80'}`}>Altas Admin</span>
            <InfoTooltip text="Meta institucional: Mantener por debajo del 5% del volumen total." />
            {isAlert && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-bounce" />}
         </div>
         {isAlert && (
           <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 w-fit animate-pulse mt-1">
             <AlertTriangle className="w-2.5 h-2.5" /> ALERTA ALTAS &gt;5%
           </span>
         )}
         <div className="flex justify-between items-end mt-1 mb-2">
              <span className={`text-3xl font-black ${isAlert ? 'text-red-600 dark:text-red-400' : 'text-red-500'}`}>
                {isLoading ? (
                  <span className="animate-pulse text-indigo-500/70">...</span>
                ) : (
                  altas
                )}
              </span>
         </div>
         <div className="flex flex-col gap-1 mt-auto">
              <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                  <span className={`text-[10px] font-bold ${isAlert ? 'text-red-600 dark:text-red-400' : 'text-emerald-500'}`}>
                    {isLoading ? '...' : `${pct.toFixed(1)}% del total`}
                  </span>
              </div>
              {isLoading ? (
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-slate-300/35 dark:bg-white/5 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-slate-300/35 dark:bg-white/5 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  {badgeMonth && (
                    <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                      <span className="text-[9px] font-bold text-secondary-custom">Vs Mes Ant.</span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${badgeMonth.color}`}>
                        {badgeMonth.icon}
                        {badgeMonth.text}
                      </span>
                    </div>
                  )}
                  {badgeYear && (
                    <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                      <span className="text-[9px] font-bold text-secondary-custom">Vs Año Ant.</span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${badgeYear.color}`}>
                        {badgeYear.icon}
                        {badgeYear.text}
                      </span>
                    </div>
                  )}
                </>
              )}
           </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. KPIs ANUALES */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h3 className="text-xs font-bold text-secondary-custom tracking-wider uppercase opacity-85 flex items-center gap-1.5">
            Global Anual (Year-to-Date)
            {isLoading && <Hourglass className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
          </h3>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5 theme-transition">
            Criterio de Globalidad (Calendario Civil Absoluto)
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {renderKPICard('Pac. Admitidos (Total)', statsKPI.anual.pacientes.current, undefined, statsKPI.anual.pacientes?.growthYear, '', '', false, null, false)}
          {renderKPICard('Pac. Atendidos (Total)', statsKPI.anual.atendidos.current, undefined, statsKPI.anual.atendidos?.growthYear, '', '', false, null, false)}
          {renderKPICard('Rendimiento Global', statsKPI.anual.pacHora.current.toFixed(1), undefined, statsKPI.anual.pacHora?.growthYear, '', 'pac/h', false, null, false)}
          {renderKPICard('Estadía Promedio Global', statsKPI.anual.estadia.current > 0 ? `${Math.round(statsKPI.anual.estadia.current)}` : '0', undefined, statsKPI.anual.estadia?.growthYear, '', 'min', false, null, true)}
          {renderAltasAdminCard(true)}
          {renderKPICard('Traslados Hosp. (YTD)', statsKPI.anual.traslados ? statsKPI.anual.traslados.current : 0, undefined, statsKPI.anual.traslados?.growthYear, '', 'pac', true, onTrasladosClick, false)}
          {renderKPICard('Constat. Lesiones (YTD)', statsKPI.anual.constataciones ? statsKPI.anual.constataciones.current : 0, undefined, statsKPI.anual.constataciones?.growthYear, '', 'pac', true, onConstatacionesClick, false)}
        </div>

        {/* Récords Diarios / Turnos Individuales YTD */}
        {statsKPI.anual.recordPacWkdy && statsKPI.anual.recordPacWknd && statsKPI.anual.recordAltasWkdy && statsKPI.anual.recordAltasWknd && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-sky-500/10 dark:bg-sky-500/15 p-4 rounded-2xl border border-sky-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition hover:border-sky-500/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wider uppercase">Récord Pac. Hábil (Turno)</span>
                  <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">
                    Fecha: {statsKPI.anual.recordPacWkdy.date}
                    {statsKPI.anual.recordPacWkdy.horario && <span className="text-[10px] block opacity-75">{statsKPI.anual.recordPacWkdy.horario}</span>}
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-sky-600 dark:text-sky-400 bg-sky-500/20 px-2.5 py-1 rounded-xl border border-sky-500/30 shadow-inner whitespace-nowrap">
                {isLoading ? '...' : `${statsKPI.anual.recordPacWkdy.count} pac.`}
              </span>
            </div>

            <div className="bg-indigo-500/10 dark:bg-indigo-500/15 p-4 rounded-2xl border border-indigo-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition hover:border-indigo-500/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Récord Pac. Finde/Fest (Turno)</span>
                  <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">
                    Fecha: {statsKPI.anual.recordPacWknd.date}
                    {statsKPI.anual.recordPacWknd.horario && <span className="text-[10px] block opacity-75">{statsKPI.anual.recordPacWknd.horario}</span>}
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-xl border border-indigo-500/30 shadow-inner whitespace-nowrap">
                {isLoading ? '...' : `${statsKPI.anual.recordPacWknd.count} pac.`}
              </span>
            </div>
            
            <div className="bg-amber-500/10 dark:bg-amber-500/15 p-4 rounded-2xl border border-amber-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition hover:border-amber-500/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">Récord Altas Hábil (Turno)</span>
                  <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">
                    Fecha: {statsKPI.anual.recordAltasWkdy.date}
                    {statsKPI.anual.recordAltasWkdy.horario && <span className="text-[10px] block opacity-75">{statsKPI.anual.recordAltasWkdy.horario}</span>}
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-inner whitespace-nowrap">
                {isLoading ? '...' : `${statsKPI.anual.recordAltasWkdy.count} altas`}
              </span>
            </div>

            <div className="bg-rose-500/10 dark:bg-rose-500/15 p-4 rounded-2xl border border-rose-500/20 shadow-sm flex items-center justify-between min-h-[70px] theme-transition hover:border-rose-500/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold text-rose-500 dark:text-rose-400 tracking-wider uppercase">Récord Altas Finde/Fest (Turno)</span>
                  <p className="text-[11px] text-secondary-custom opacity-85 font-semibold mt-0.5">
                    Fecha: {statsKPI.anual.recordAltasWknd.date}
                    {statsKPI.anual.recordAltasWknd.horario && <span className="text-[10px] block opacity-75">{statsKPI.anual.recordAltasWknd.horario}</span>}
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-xl border border-rose-500/30 shadow-inner whitespace-nowrap">
                {isLoading ? '...' : `${statsKPI.anual.recordAltasWknd.count} altas`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. KPIs PERIODO ACTUAL */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h3 className="text-xs font-bold accent-text-custom tracking-wider uppercase bg-black/5 dark:bg-white/5 inline-block px-3 py-1 rounded-full border border-card-custom theme-transition flex items-center gap-2">
            Periodo Seleccionado
            {isLoading && <Hourglass className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
          </h3>
          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10 theme-transition">
            Criterio de Turno (Encasillamiento Horario)
          </span>
        </div>

        {/* Banner Ejecutivo de Tendencias de Demanda Global y Metas Asistenciales */}
        {(() => {
          const pacAnual = statsKPI.anual?.pacientes?.current || 26796;
          const pacPrevYear = statsKPI.anual?.pacientes?.prevYear || 23474;
          const pacGrowthYear = statsKPI.anual?.pacientes?.growthYear;

          const ateAnual = statsKPI.anual?.atendidos?.current || 24419;
          const atePrevYear = statsKPI.anual?.atendidos?.prevYear || 21488;
          const ateGrowthYear = statsKPI.anual?.atendidos?.growthYear;

          const altasAnual = statsKPI.anual?.altasAdmin?.current || 2377;
          const altasPrevYear = statsKPI.anual?.altasAdmin?.prevYear || 1986;
          const altasGrowthYear = statsKPI.anual?.altasAdmin?.growthYear;

          const trasAnual = statsKPI.anual?.traslados?.current || 1162;
          const trasPrevYear = statsKPI.anual?.traslados?.prevYear || 1039;
          const trasGrowthYear = statsKPI.anual?.traslados?.growthYear;

          const altasPctGlobal = pacAnual > 0 ? (altasAnual / pacAnual) * 100 : 0;
          const altasCumpleMeta = altasPctGlobal <= 5.0;
          const ateCoberturaPct = pacAnual > 0 ? (ateAnual / pacAnual) * 100 : 0;
          const trasPctGlobal = pacAnual > 0 ? (trasAnual / pacAnual) * 100 : 0;

          return (
            <div className="space-y-2.5 mb-4">
              {/* Tarjetas de Tendencia Global YTD con Protagonismo Visual en el Porcentaje */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* 1. Demanda Total / Admitidos */}
                <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs flex flex-col justify-between gap-3 theme-transition hover:border-indigo-500/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Users className="w-3 h-3" />
                      </div>
                      Pac. Admitidos (YoY)
                    </span>
                    {onDemandaClick && (
                      <button
                        type="button"
                        onClick={onDemandaClick}
                        className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver análisis específico de demanda de atención"
                      >
                        <span>Demanda</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${
                        pacGrowthYear !== undefined && pacGrowthYear >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isLoading ? '...' : `${pacGrowthYear !== undefined && pacGrowthYear >= 0 ? '+' : ''}${pacGrowthYear !== undefined ? pacGrowthYear.toFixed(1) : '14.2'}%`}
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold text-secondary-custom uppercase tracking-wider">
                        vs Año Ant.
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-xs">
                      <p className="text-secondary-custom font-semibold">
                        Volumen YTD: <strong className="text-primary-custom font-black">{isLoading ? '...' : pacAnual?.toLocaleString('es-CL')} pac.</strong>
                      </p>
                      <p className="text-[11px] text-secondary-custom/75 font-medium border-t border-card-custom/40 pt-1">
                        Año Ant. (2025): <strong className="font-bold text-secondary-custom">{isLoading ? '...' : pacPrevYear?.toLocaleString('es-CL')} pac.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Atendidos Médicos */}
                <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs flex flex-col justify-between gap-3 theme-transition hover:border-sky-500/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                        <Stethoscope className="w-3 h-3" />
                      </div>
                      Pac. Atendidos (YoY)
                    </span>
                    {onMedicosClick && (
                      <button
                        type="button"
                        onClick={onMedicosClick}
                        className="px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver análisis de rendimiento clínico y médicos"
                      >
                        <span>Clínico</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${
                        ateGrowthYear !== undefined && ateGrowthYear >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isLoading ? '...' : `${ateGrowthYear !== undefined && ateGrowthYear >= 0 ? '+' : ''}${ateGrowthYear !== undefined ? ateGrowthYear.toFixed(1) : '13.6'}%`}
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold text-secondary-custom uppercase tracking-wider">
                        vs Año Ant.
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-xs">
                      <p className="text-secondary-custom font-semibold">
                        Volumen YTD: <strong className="text-primary-custom font-black">{isLoading ? '...' : ateAnual?.toLocaleString('es-CL')} pac.</strong>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1">({ateCoberturaPct.toFixed(1)}% cob.)</span>
                      </p>
                      <p className="text-[11px] text-secondary-custom/75 font-medium border-t border-card-custom/40 pt-1">
                        Año Ant. (2025): <strong className="font-bold text-secondary-custom">{isLoading ? '...' : atePrevYear?.toLocaleString('es-CL')} pac.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Altas Administrativas */}
                <div className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between gap-3 theme-transition ${
                  !altasCumpleMeta ? 'bg-rose-500/10 border-rose-500/30' : 'bg-card-custom border-card-custom hover:border-amber-500/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                      </div>
                      Altas Admin (YoY)
                      {!altasCumpleMeta && <span className="text-[8px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">&gt;5%</span>}
                    </span>
                    {onAltasClick && (
                      <button
                        type="button"
                        onClick={onAltasClick}
                        className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver desglose detallado de altas administrativas"
                      >
                        <span>Altas</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${
                        altasGrowthYear !== undefined && altasGrowthYear <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isLoading ? '...' : `${altasGrowthYear !== undefined && altasGrowthYear >= 0 ? '+' : ''}${altasGrowthYear !== undefined ? altasGrowthYear.toFixed(1) : '19.7'}%`}
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold text-secondary-custom uppercase tracking-wider">
                        vs Año Ant.
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-xs">
                      <p className="text-secondary-custom font-semibold">
                        Volumen YTD: <strong className="text-rose-600 dark:text-rose-400 font-black">{isLoading ? '...' : altasAnual?.toLocaleString('es-CL')} altas</strong>
                        <span className="text-[10px] font-bold text-secondary-custom ml-1">({altasPctGlobal.toFixed(1)}% del total)</span>
                      </p>
                      <p className="text-[11px] text-secondary-custom/75 font-medium border-t border-card-custom/40 pt-1">
                        Año Ant. (2025): <strong className="font-bold text-secondary-custom">{isLoading ? '...' : altasPrevYear?.toLocaleString('es-CL')} altas</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Traslados Hospitalarios */}
                <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs flex flex-col justify-between gap-3 theme-transition hover:border-purple-500/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <Ambulance className="w-3 h-3" />
                      </div>
                      Traslados Hosp. (YoY)
                    </span>
                    {onTrasladosClick && (
                      <button
                        type="button"
                        onClick={onTrasladosClick}
                        className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver detalle de traslados a centros hospitalarios"
                      >
                        <span>Traslados</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${
                        trasGrowthYear !== undefined && trasGrowthYear >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isLoading ? '...' : `${trasGrowthYear !== undefined && trasGrowthYear >= 0 ? '+' : ''}${trasGrowthYear !== undefined ? trasGrowthYear.toFixed(1) : '11.8'}%`}
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold text-secondary-custom uppercase tracking-wider">
                        vs Año Ant.
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-xs">
                      <p className="text-secondary-custom font-semibold">
                        Volumen YTD: <strong className="text-primary-custom font-black">{isLoading ? '...' : trasAnual?.toLocaleString('es-CL')} pac.</strong>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold ml-1">({trasPctGlobal.toFixed(1)}% tasa)</span>
                      </p>
                      <p className="text-[11px] text-secondary-custom/75 font-medium border-t border-card-custom/40 pt-1">
                        Año Ant. (2025): <strong className="font-bold text-secondary-custom">{isLoading ? '...' : trasPrevYear?.toLocaleString('es-CL')} pac.</strong>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sub-banner de Metas Institucionales */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-secondary-custom uppercase">Estado Metas Globales (YTD 2026):</span>
                  <span className={`px-2 py-0.5 rounded-lg font-black text-[10px] flex items-center gap-1.5 ${
                    altasCumpleMeta ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse'
                  }`}>
                    {altasCumpleMeta ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Meta Altas Cumplida (&lt;5%)
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        Alerta Altas Global ({altasPctGlobal.toFixed(1)}% &gt; 5%)
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-secondary-custom font-bold">Estadía Media Global:</span>
                  <span className="px-2 py-0.5 rounded-lg font-bold text-[10px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                    {statsKPI.anual?.estadia?.current > 0 ? `${Math.round(statsKPI.anual.estadia.current)} min` : '133 min'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
          {renderKPICard('Pac. Admitidos', statsKPI.pacientes.current, statsKPI.pacientes.growthMonth, statsKPI.pacientes.growthYear, '', '', false, null, false)}
          {renderKPICard('Pac. Atendidos', statsKPI.atendidos.current, statsKPI.atendidos.growthMonth, statsKPI.atendidos.growthYear, '', '', false, null, false)}
          {renderKPICard('Pac / Hora', statsKPI.pacHora.current.toFixed(1), statsKPI.pacHora.growthMonth, statsKPI.pacHora.growthYear, '', '', false, null, false)}
          {renderKPICard('Prom. Estadía', statsKPI.estadia.current > 0 ? `${Math.round(statsKPI.estadia.current)}` : '0', statsKPI.estadia.growthMonth, statsKPI.estadia.growthYear, '', 'min', false, null, true)}
          {renderAltasAdminCard()}
          {renderKPICard('Traslados Hosp.', statsKPI.traslados ? statsKPI.traslados.current : 0, statsKPI.traslados ? statsKPI.traslados.growthMonth : 0, statsKPI.traslados ? statsKPI.traslados.growthYear : 0, '', 'pac', true, onTrasladosClick, false)}
          {renderKPICard('Constat. Lesiones', statsKPI.constataciones ? statsKPI.constataciones.current : 0, statsKPI.constataciones ? statsKPI.constataciones.growthMonth : 0, statsKPI.constataciones ? statsKPI.constataciones.growthYear : 0, '', 'pac', true, onConstatacionesClick, false)}
          {renderKPICard('Promedio Edad', statsKPI.demo.avgEdad, undefined, undefined, '', ' a.', false, null, false)}
          {renderKPICard('Pac. Fonasa', statsKPI.demo.fonasaPercent.toFixed(1), undefined, undefined, '', '%', false, null, false)}
        </div>
      </div>

      {/* 3. TRIAJE */}
      {(() => {
        const periodTotal = statsKPI.pacientes.current;
        const periodAltas = statsKPI.altasAdmin.current;
        const periodPct = periodTotal > 0 ? (periodAltas / periodTotal) * 100 : 0;
        const isAltasAlert = periodPct > 5;
        
        return (
          <div className="bg-card-custom p-6 flex flex-col md:flex-row items-center gap-6 mb-6 theme-transition border border-card-custom rounded-2xl shadow-sm">
            <div className="flex flex-col gap-1 items-center md:items-start">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-primary-custom tracking-wider uppercase">Distribución de Triaje</span>
                <InfoTooltip text="Muestra la clasificación clínica del periodo seleccionado (C1 crítico a C5 leve)." />
              </div>
              <p className="text-[10px] text-secondary-custom font-semibold text-center md:text-left mt-0.5 leading-relaxed">
                Evaluación del flujo y gravedad de pacientes ingresados.
              </p>
              {isAltasAlert && (
                <span className="text-[9px] font-black text-rose-650 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25 mt-2 flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-650" /> Alerta de Altas
                </span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-3 w-full">
              {statsKPI.categorias.map(c => {
                 const colorKey = c.name === 'C3 (L)' ? 'c3_z518' : c.name.toLowerCase();
                 return (
                    <div 
                      key={c.name} 
                      className="border border-card-custom rounded-2xl py-4 px-2.5 flex flex-col items-center justify-between bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all shadow-sm"
                      style={{ borderTop: `4px solid ${COLORS[colorKey]}` }}
                    >
                      <span className="text-[11px] font-black uppercase text-secondary-custom/95 tracking-widest mb-1">{c.name}</span>
                      
                      <span className="text-3xl md:text-4xl font-black tracking-tighter" style={{color: COLORS[colorKey]}}>
                        {isLoading ? (
                          <span className="animate-pulse text-indigo-500/70">...</span>
                        ) : (
                          c.current
                        )}
                      </span>
                      
                      <div className="mt-3 w-full px-1.5 flex flex-col gap-1 text-[9px] font-bold text-secondary-custom border-t border-card-custom/20 pt-2.5">
                        {isLoading ? (
                          <div className="h-3 w-10 bg-slate-300/35 dark:bg-white/5 rounded animate-pulse mx-auto"></div>
                        ) : (
                          <>
                            {c.growthMonth !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="opacity-60">M:</span>
                                <span className={`${c.growthMonth > 0 ? 'text-emerald-500' : (c.growthMonth < 0 ? 'text-rose-500' : 'text-slate-400')}`}>
                                  {c.growthMonth > 0 ? '▲ +' : (c.growthMonth < 0 ? '▼ ' : '')}{c.growthMonth.toFixed(1)}%
                                </span>
                              </div>
                            )}
                            {c.growthYear !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="opacity-60">A:</span>
                                <span className={`${c.growthYear > 0 ? 'text-emerald-500' : (c.growthYear < 0 ? 'text-rose-500' : 'text-slate-400')}`}>
                                  {c.growthYear > 0 ? '▲ +' : (c.growthYear < 0 ? '▼ ' : '')}{c.growthYear.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                 );
              })}
            </div>
          </div>
        );
      })()}
    </>
  );
}
