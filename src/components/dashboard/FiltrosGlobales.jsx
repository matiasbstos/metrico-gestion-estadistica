import React, { useState, useEffect } from 'react';
import { Calendar, Compass, RefreshCw, Info } from 'lucide-react';
import CampanaNotificaciones from './CampanaNotificaciones';
import SugerenciasTurnosBar from './SugerenciasTurnosBar';

function ChileanDatePicker({ value, onChange, className = '' }) {
  return (
    <input 
      type="date" 
      value={value || ''} 
      onChange={onChange} 
      onClick={(e) => {
        try {
          if (e.target.showPicker) e.target.showPicker();
        } catch (err) {}
      }}
      className={`px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-primary-custom tracking-wider cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${className}`}
    />
  );
}

export default function FiltrosGlobales({
  modoComparativo,
  setModoComparativo,
  filtroFechaInicio,
  setFiltroFechaInicio,
  filtroFechaFin,
  setFiltroFechaFin,
  filtroFechaInicioB,
  setFiltroFechaInicioB,
  filtroFechaFinB,
  setFiltroFechaFinB,
  applyDatePreset,
  tipoCorte,
  setTipoCorte,
  filtroHoraInicio,
  setFiltroHoraInicio,
  filtroHoraFin,
  setFiltroHoraFin,
  horarioPreset,
  setHorarioPreset,
  maxDateLabel,
  onClearFilters,
  isScrolled,
  onSync,
  syncStatus,
  lastSyncTime,
  syncToast,
  integrityIncidencesCount,
  onNavigateTab
}) {
  const [activePreset, setActivePreset] = useState('hoy');

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

  const handlePreset = (preset) => {
    setActivePreset(preset);
    applyDatePreset(preset);
  };

  const handleHorarioPreset = (preset) => {
    setHorarioPreset(preset);
    if (preset === 'civil') {
      setFiltroHoraInicio('00:00');
      setFiltroHoraFin('23:59');
    } else if (preset === 'largo') {
      setFiltroHoraInicio('16:00');
      setFiltroHoraFin('09:00');
    } else if (preset === 'finde_dia') {
      setFiltroHoraInicio('08:00');
      setFiltroHoraFin('20:00');
    } else if (preset === 'finde_noche') {
      setFiltroHoraInicio('20:00');
      setFiltroHoraFin('08:00');
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5 transition-all duration-300 w-full`}>
      {/* Title section - Hide when scrolled */}
      <div className={`transition-all duration-300 overflow-hidden flex items-center gap-3 ${isScrolled ? 'h-0 opacity-0 pointer-events-none scale-95' : 'h-auto opacity-100 scale-100'}`}>
        <Compass className="w-6 h-6 accent-text-custom" />
        <div>
          <h1 className="text-2xl font-bold text-primary-custom tracking-tight">Explorador Global de Urgencias</h1>
          <p className="text-sm text-secondary-custom flex flex-wrap items-center gap-2">
            <span>Análisis operativo y clínico en tiempo real.</span>
            {maxDateLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm animate-pulse">
                Datos cargados hasta: {maxDateLabel}
              </span>
            )}
          </p>
        </div>
      </div>
      
      {/* Brand indicator when scrolled */}
      {isScrolled && (
        <div className="hidden lg:flex items-center gap-2 transition-all duration-300 animate-fade-in">
          <Compass className="w-4 h-4 text-indigo-500 animate-spin-slow" />
          <span className="font-black text-xs tracking-widest text-primary-custom uppercase">MÉTRICO</span>
        </div>
      )}
      
      <div className="flex flex-col items-end gap-2 w-full lg:w-auto">
        <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto relative">
          {/* Leyenda explicativa de encasillamiento ampliado para Turno Largo Semana */}
          {(horarioPreset === 'largo' || (filtroHoraInicio === '16:00' && filtroHoraFin === '09:00')) && (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 text-[10px] font-bold shadow-sm animate-fade-in" 
              title="Horario Oficial Turno Largo: 17:00 a 08:00 hrs. Se aplica encasillamiento extendido de 16:00 a 09:00 AM para capturar todas las admisiones correspondientes a este turno."
            >
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Turno Largo: 17:00 a 08:00 hrs (Encasillamiento 16:00 - 09:00 AM)</span>
            </div>
          )}

          {/* Main date and hour picker */}
          <div className="flex items-center bg-card-custom border border-card-custom rounded-xl p-1.5 shadow-sm gap-2 theme-transition">
            <Calendar className="w-4 h-4 text-secondary-custom mx-1" />
            <ChileanDatePicker 
              value={filtroFechaInicio}
              onChange={e => {
                const newStart = e.target.value;
                setFiltroFechaInicio(newStart);
                if (!filtroFechaFin || filtroFechaFin < newStart || activePreset === 'hoy' || activePreset === 'dia') {
                  setFiltroFechaFin(newStart);
                }
              }}
            />
            <input 
              type="time" 
              value={filtroHoraInicio} 
              onChange={e => {
                setFiltroHoraInicio(e.target.value);
                setHorarioPreset('custom');
              }} 
              className="text-xs font-bold accent-text-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" 
            />
            <span className="text-secondary-custom mx-1">-</span>
            <ChileanDatePicker 
              value={filtroFechaFin}
              onChange={e => {
                const newEnd = e.target.value;
                setFiltroFechaFin(newEnd);
                if (filtroFechaInicio && newEnd < filtroFechaInicio) {
                  setFiltroFechaInicio(newEnd);
                }
              }}
            />
            <input 
              type="time" 
              value={filtroHoraFin} 
              onChange={e => {
                setFiltroHoraFin(e.target.value);
                setHorarioPreset('custom');
              }} 
              className="text-xs font-bold accent-text-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" 
            />
          </div>

          {/* POP-UP FLOTANTE DE SUGERENCIAS INTELIGENTES DE TURNOS */}
          <SugerenciasTurnosBar 
            filtroFechaInicio={filtroFechaInicio}
            filtroFechaFin={filtroFechaFin}
            filtroHoraInicio={filtroHoraInicio}
            filtroHoraFin={filtroHoraFin}
            setFiltroHoraInicio={setFiltroHoraInicio}
            setFiltroHoraFin={setFiltroHoraFin}
            setHorarioPreset={setHorarioPreset}
          />
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Date presets */}
            <div className="flex items-center bg-card-custom border border-card-custom rounded-xl p-1 shadow-sm theme-transition">
              <button onClick={() => handlePreset('dia')} className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activePreset === 'hoy' || activePreset === 'dia' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Hoy</button>
              <button onClick={() => handlePreset('semana')} className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activePreset === 'semana' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Semana</button>
              <button onClick={() => handlePreset('mes')} className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activePreset === 'mes' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Mes</button>
              <div className="border-l border-card-custom/50 h-4 mx-1"></div>
              <select 
                value={activePreset && activePreset.startsWith('invierno') ? activePreset : ''} 
                onChange={e => {
                  if (e.target.value) {
                    handlePreset(e.target.value);
                  }
                }}
                className="text-xs font-bold text-secondary-custom bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0 [&>option]:bg-slate-800 [&>option]:text-slate-100 max-w-[100px] pr-6"
              >
                <option value="">Campaña...</option>
                <option value="invierno_2026">Invierno '26</option>
                <option value="invierno_2025">Invierno '25</option>
              </select>
            </div>

            {/* Shift hours presets */}
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
            
            {/* Comparison toggle */}
            <div className="flex items-center gap-1.5 bg-card-custom border border-card-custom rounded-xl px-2.5 py-1.5 shadow-sm theme-transition">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${modoComparativo ? 'accent-text-custom' : 'text-secondary-custom opacity-85'}`}>Comp.</span>
              <button onClick={() => setModoComparativo(!modoComparativo)} className={`w-8 h-4 rounded-full relative transition-colors ${modoComparativo ? 'accent-bg-custom' : 'bg-black/10 dark:bg-white/10'}`}>
                <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-transform ${modoComparativo ? 'left-[18px]' : 'left-[2px]'}`}></div>
              </button>
            </div>

            {/* Sync button */}
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
                {lastSyncTime && (
                  <span className="hidden xl:inline text-[8px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 normal-case ml-0.5">
                    {lastSyncTime}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell Center */}
            <CampanaNotificaciones 
              syncToast={syncToast}
              integrityIncidencesCount={integrityIncidencesCount}
              lastSyncTime={lastSyncTime}
              onNavigateTab={onNavigateTab}
            />

            {/* Clear filters button */}
            {onClearFilters && (
              <button 
                onClick={onClearFilters} 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 hover:bg-rose-500/25 border border-rose-500/20 shadow-sm transition-all"
              >
                Borrar
              </button>
            )}
          </div>
        </div>

        {modoComparativo && (
          <div className="flex justify-end mt-1 animate-fade-in w-full">
            <div className="flex items-center bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-1.5 shadow-sm w-full lg:w-auto justify-between gap-2 theme-transition">
              <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mx-2" />
              <ChileanDatePicker value={filtroFechaInicioB} onChange={e => setFiltroFechaInicioB(e.target.value)} />
              <span className="text-indigo-500 dark:text-indigo-400 mx-2">-</span>
              <ChileanDatePicker value={filtroFechaFinB} onChange={e => setFiltroFechaFinB(e.target.value)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
