import React, { useState, useEffect } from 'react';
import { Calendar, Compass } from 'lucide-react';

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
  filtroHoraInicio,
  setFiltroHoraInicio,
  filtroHoraFin,
  setFiltroHoraFin,
  horarioPreset,
  setHorarioPreset,
  maxDateLabel,
  onClearFilters
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
      setFiltroHoraInicio('17:00');
      setFiltroHoraFin('08:00');
    } else if (preset === 'finde_dia') {
      setFiltroHoraInicio('08:00');
      setFiltroHoraFin('20:00');
    } else if (preset === 'finde_noche') {
      setFiltroHoraInicio('20:00');
      setFiltroHoraFin('08:00');
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 theme-transition">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Compass className="w-6 h-6 accent-text-custom" />
          <h1 className="text-2xl font-bold text-primary-custom tracking-tight">Explorador Global de Urgencias</h1>
        </div>
        <p className="text-sm text-secondary-custom flex flex-wrap items-center gap-2">
          <span>Análisis operativo y clínico en tiempo real.</span>
          {maxDateLabel && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm animate-pulse">
              Datos cargados hasta: {maxDateLabel}
            </span>
          )}
        </p>
      </div>
      
      <div className="flex flex-col items-end gap-2 w-full md:w-auto">
        <div className="flex items-center bg-card-custom border border-card-custom rounded-xl p-1.5 shadow-sm gap-2 w-full md:w-auto theme-transition">
          <Calendar className="w-4 h-4 text-secondary-custom mx-1" />
          <input 
            type="date" 
            value={filtroFechaInicio} 
            onChange={e => setFiltroFechaInicio(e.target.value)} 
            className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" 
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
          <input 
            type="date" 
            value={filtroFechaFin} 
            onChange={e => setFiltroFechaFin(e.target.value)} 
            className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" 
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
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-card-custom border border-card-custom rounded-xl p-1 shadow-sm theme-transition">
            <button onClick={() => handlePreset('dia')} className={`px-3 py-1 text-xs rounded-lg transition-colors ${activePreset === 'hoy' || activePreset === 'dia' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Hoy</button>
            <button onClick={() => handlePreset('semana')} className={`px-3 py-1 text-xs rounded-lg transition-colors ${activePreset === 'semana' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Semana</button>
            <button onClick={() => handlePreset('mes')} className={`px-3 py-1 text-xs rounded-lg transition-colors ${activePreset === 'mes' ? 'accent-bg-custom text-white font-bold shadow-sm' : 'font-medium text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>Mes</button>
            <div className="border-l border-card-custom/50 h-4 mx-1"></div>
            <select 
              value={activePreset && activePreset.startsWith('invierno') ? activePreset : ''} 
              onChange={e => {
                if (e.target.value) {
                  handlePreset(e.target.value);
                }
              }}
              className="text-xs font-bold text-secondary-custom bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0 [&>option]:bg-slate-800 [&>option]:text-slate-100 max-w-[120px] pr-8"
            >
              <option value="">Campaña...</option>
              <option value="invierno_2026">Invierno 2026</option>
              <option value="invierno_2025">Invierno 2025</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card-custom border border-card-custom rounded-xl px-3 py-1.5 shadow-sm theme-transition">
            <span className="text-[10px] font-bold text-secondary-custom opacity-80 uppercase tracking-wider">Horario:</span>
            <select 
              value={horarioPreset} 
              onChange={e => handleHorarioPreset(e.target.value)} 
              className="text-xs font-bold accent-text-custom bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0 [&>option]:bg-slate-800 [&>option]:text-slate-100"
            >
              <option value="civil">Día Completo (00:00 - 23:59)</option>
              <option value="largo">Largo de Semana (17:00 - 08:00)</option>
              <option value="finde_dia">Finde Día (08:00 - 20:00)</option>
              <option value="finde_noche">Finde Noche (20:00 - 08:00)</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-card-custom border border-card-custom rounded-xl px-3 py-1.5 shadow-sm theme-transition">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${modoComparativo ? 'accent-text-custom' : 'text-secondary-custom opacity-85'}`}>Comparar</span>
            <button onClick={() => setModoComparativo(!modoComparativo)} className={`w-8 h-4 rounded-full relative transition-colors ${modoComparativo ? 'accent-bg-custom' : 'bg-black/10 dark:bg-white/10'}`}>
              <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-transform ${modoComparativo ? 'left-[18px]' : 'left-[2px]'}`}></div>
            </button>
          </div>

          {onClearFilters && (
            <button 
              onClick={onClearFilters} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 hover:bg-rose-500/25 border border-rose-500/20 shadow-sm transition-all"
            >
              Borrar Filtros
            </button>
          )}
        </div>

        {modoComparativo && (
          <div className="flex justify-end mt-1 animate-fade-in w-full">
            <div className="flex items-center bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-1.5 shadow-sm w-full justify-between gap-2 theme-transition">
              <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mx-2" />
              <input type="date" value={filtroFechaInicioB} onChange={e => setFiltroFechaInicioB(e.target.value)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" />
              <span className="text-indigo-500 dark:text-indigo-400 mx-2">-</span>
              <input type="date" value={filtroFechaFinB} onChange={e => setFiltroFechaFinB(e.target.value)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
