import React, { useState, useEffect } from 'react';
import { Calendar, Compass, RefreshCw, Info, ShieldAlert, ShieldCheck, UploadCloud } from 'lucide-react';
import CampanaNotificaciones from './CampanaNotificaciones';
import SugerenciasTurnosBar from './SugerenciasTurnosBar';
import ModalCargaRapidaDatos from './ModalCargaRapidaDatos';

function IntegrityAlertBadge({ integrityIncidencesCount, onNavigateTab }) {
  const hasAlert = integrityIncidencesCount > 0;

  return (
    <button
      type="button"
      onClick={() => onNavigateTab && onNavigateTab('auditoria')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm cursor-pointer ${
        hasAlert
          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25 animate-pulse'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
      }`}
      title={hasAlert ? "Alerta de Integridad Activa. Haga clic para ingresar directamente a la Bitácora y conciliar los datos." : "Integridad 100% OK. Haga clic para ver la Bitácora de Auditoría."}
    >
      <span className="relative flex h-2 w-2">
        {hasAlert && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${hasAlert ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
      </span>
      {hasAlert ? (
        <>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Alerta Integridad ({integrityIncidencesCount})</span>
        </>
      ) : (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="hidden sm:inline">Integridad 100% OK</span>
        </>
      )}
    </button>
  );
}

function EncasillamientoInfoBadge({ horarioPreset }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isEncasillamientoLargo = horarioPreset === 'largo';

  if (!isEncasillamientoLargo) return null;

  return (
    <div className="relative inline-block animate-fade-in">
      <button 
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-[10px] font-bold shadow-sm transition-all relative group cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="hidden sm:inline">Turno Largo: 17:00 a 08:00 hrs</span>
        <span className="sm:hidden">Turno Largo</span>
      </button>

      {showTooltip && (
        <div 
          className="absolute top-full left-0 mt-2 z-[999] w-72 p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-indigo-500/40 shadow-2xl backdrop-blur-xl animate-fade-in"
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400 uppercase tracking-wide">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Criterio de Encasillamiento</span>
            </div>
            <button onClick={() => setShowTooltip(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕</button>
          </div>
          <div className="space-y-1.5 text-[11px] font-medium leading-relaxed">
            <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded-lg">
              <span className="text-slate-400">Horario Oficial:</span>
              <span className="font-bold text-indigo-300">17:00 a 08:00 hrs</span>
            </div>
            <div className="flex items-center justify-between bg-indigo-500/15 px-2 py-1 rounded-lg border border-indigo-500/30">
              <span className="text-slate-300">Encasillamiento Interno:</span>
              <span className="font-mono font-bold text-emerald-400">16:00 a 09:00 AM</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-white/5">
              💡 <strong>¿Por qué 16:00 a 09:00 AM?</strong> Se aplica un margen extendido (+1 hora antes y después) para capturar el 100% de las admisiones del Turno Largo de Semana.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChileanDatePicker({ value, onChange, className = '', onClick }) {
  return (
    <input 
      type="date" 
      value={value || ''} 
      onChange={onChange} 
      onClick={(e) => {
        if (onClick) onClick(e);
        try {
          if (e.target.showPicker) e.target.showPicker();
        } catch (err) {}
      }}
      className={`text-xs font-bold accent-text-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0 ${className}`} 
    />
  );
}

export default function FiltrosGlobales({
  filtroFechaInicio, setFiltroFechaInicio,
  filtroFechaFin, setFiltroFechaFin,
  filtroHoraInicio, setFiltroHoraInicio,
  filtroHoraFin, setFiltroHoraFin,
  horarioPreset, setHorarioPreset,
  applyDatePreset,
  modoComparativo, setModoComparativo,
  filtroFechaInicioB, setFiltroFechaInicioB,
  filtroFechaFinB, setFiltroFechaFinB,
  onClearFilters,
  onSync,
  syncStatus,
  lastSyncTime,
  syncToast,
  integrityIncidencesCount,
  onNavigateTab,
  maxDateLabel,
  isScrolled,
  turnosDB,
  pautasDB,
  user,
  db,
  pacientesDB,
  showNotif
}) {
  const [activePreset, setActivePreset] = useState('hoy');
  const [showSuggestionsPopover, setShowSuggestionsPopover] = useState(false);
  const [isQuickUploadOpen, setIsQuickUploadOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (filtroFechaInicio === today && filtroFechaFin === today) {
      setActivePreset('hoy');
    } else if (filtroFechaInicio === '2026-06-01' && filtroFechaFin === '2026-08-31') {
      setActivePreset('invierno_2026');
    } else if (filtroFechaInicio === '2025-06-01' && filtroFechaFin === '2025-08-31') {
      setActivePreset('invierno_2025');
    } else {
      setActivePreset('');
    }
  }, [filtroFechaInicio, filtroFechaFin]);

  const handlePreset = (type) => {
    setActivePreset(type);
    if (applyDatePreset) {
      applyDatePreset(type);
    }
  };

  const handleHorarioPreset = (presetKey) => {
    setHorarioPreset(presetKey);
    if (presetKey === 'civil') {
      setFiltroHoraInicio('00:00');
      setFiltroHoraFin('23:59');
    } else if (presetKey === 'largo') {
      setFiltroHoraInicio('16:00');
      setFiltroHoraFin('09:00');
    } else if (presetKey === 'finde_dia') {
      setFiltroHoraInicio('08:00');
      setFiltroHoraFin('20:00');
    } else if (presetKey === 'finde_noche') {
      setFiltroHoraInicio('20:00');
      setFiltroHoraFin('08:00');
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full print:hidden">
      
      {/* MODAL GLOBAL DE CARGA RÁPIDA CSV/EXCEL */}
      <ModalCargaRapidaDatos 
        isOpen={isQuickUploadOpen}
        onClose={() => setIsQuickUploadOpen(false)}
        user={user}
        db={db}
        pacientesDB={pacientesDB}
        turnosDB={turnosDB}
        showNotif={showNotif}
        onSuccessRedirect={(tab) => {
          if (onNavigateTab) onNavigateTab(tab);
        }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* LADO IZQUIERDO: SELECCIÓN DE FECHA Y HORARIOS */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Rango de Fechas */}
          <div className="flex items-center gap-2 bg-card-custom border border-card-custom rounded-2xl px-3 py-2 shadow-sm theme-transition">
            <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <ChileanDatePicker 
              value={filtroFechaInicio} 
              onChange={e => setFiltroFechaInicio(e.target.value)} 
            />
            <span className="text-secondary-custom font-bold text-xs">-</span>
            <ChileanDatePicker 
              value={filtroFechaFin} 
              onChange={e => setFiltroFechaFin(e.target.value)} 
            />
          </div>

          {/* Rango de Horas */}
          <div className="relative flex items-center gap-1.5 bg-card-custom border border-card-custom rounded-2xl px-3 py-2 shadow-sm theme-transition">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <input 
              type="time" 
              value={filtroHoraInicio} 
              onFocus={() => setShowSuggestionsPopover(true)}
              onClick={() => setShowSuggestionsPopover(true)}
              onChange={e => {
                setShowSuggestionsPopover(true);
                setFiltroHoraInicio(e.target.value);
                setHorarioPreset('custom');
              }} 
              className="text-xs font-bold accent-text-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" 
            />
            <span className="text-secondary-custom font-bold text-xs">-</span>
            <input 
              type="time" 
              value={filtroHoraFin} 
              onFocus={() => setShowSuggestionsPopover(true)}
              onClick={() => setShowSuggestionsPopover(true)}
              onChange={e => {
                setShowSuggestionsPopover(true);
                setFiltroHoraFin(e.target.value);
                setHorarioPreset('custom');
              }} 
              className="text-xs font-bold accent-text-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" 
            />
          </div>

          <EncasillamientoInfoBadge horarioPreset={horarioPreset} />
        </div>

        {/* LADO DERECHO: ACCIONES RÁPIDAS, BOTÓN CARGA RÁPIDA, NOTIFICACIONES */}
        <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
          
          {/* BOTÓN RÁPIDO DE CARGA MASIVA CSV/EXCEL (ACCESIBLE GLOBALMENTE) */}
          <button
            type="button"
            onClick={() => setIsQuickUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-md bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 active:scale-95 cursor-pointer"
            title="Carga masiva rápida de datos Excel/CSV directamente desde cualquier vista con redirección automática a Gestión de Datos"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Carga Rápida CSV/Excel</span>
            <span className="sm:hidden">Carga Rápida</span>
          </button>

          {/* Presets de Fecha */}
          <div className="flex items-center bg-card-custom border border-card-custom rounded-xl p-1 shadow-sm theme-transition">
            <button onClick={() => handlePreset('dia')} className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activePreset === 'hoy' || activePreset === 'dia' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Hoy</button>
            <button onClick={() => handlePreset('semana')} className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activePreset === 'semana' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Semana</button>
            <button onClick={() => handlePreset('mes')} className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activePreset === 'mes' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Mes</button>
          </div>

          {/* Presets de Horario */}
          <div className="flex items-center gap-1.5 bg-card-custom border border-card-custom rounded-xl px-2.5 py-1.5 shadow-sm theme-transition">
            <span className="text-[10px] font-bold text-secondary-custom opacity-80 uppercase tracking-wider">Horario:</span>
            <select 
              value={horarioPreset} 
              onChange={e => handleHorarioPreset(e.target.value)} 
              className="text-xs font-bold accent-text-custom bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0 [&>option]:bg-slate-800 [&>option]:text-slate-100"
            >
              <option value="civil">Completo</option>
              <option value="largo">Largo Semana</option>
              <option value="finde_dia">Finde Día</option>
              <option value="finde_noche">Finde Noche</option>
              <option value="custom">Pers.</option>
            </select>
          </div>
          
          {/* Botón Sincronizar */}
          {onSync && (
            <button 
              onClick={onSync} 
              disabled={syncStatus === 'connecting' || syncStatus === 'syncing'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm ${
                syncStatus === 'connecting' || syncStatus === 'syncing'
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 cursor-not-allowed'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 cursor-pointer'
              }`}
              title="Sincronizar base de datos con la nube y reevaluar todos los módulos en vivo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'connecting' || syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sincronizar</span>
            </button>
          )}

          {/* Badge permanente de Alerta de Integridad de Datos */}
          <IntegrityAlertBadge 
            integrityIncidencesCount={integrityIncidencesCount}
            onNavigateTab={onNavigateTab}
          />

          {/* Campana de Notificaciones */}
          <CampanaNotificaciones 
            syncToast={syncToast}
            integrityIncidencesCount={integrityIncidencesCount}
            lastSyncTime={lastSyncTime}
            onNavigateTab={onNavigateTab}
          />

          {/* Botón Borrar Filtros */}
          {onClearFilters && (
            <button 
              onClick={onClearFilters} 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 hover:bg-rose-500/25 border border-rose-500/20 shadow-sm transition-all cursor-pointer"
            >
              Borrar
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
