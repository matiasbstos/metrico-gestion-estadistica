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
  applyDatePreset
}) {
  const [activePreset, setActivePreset] = useState('hoy');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (filtroFechaInicio === today && filtroFechaFin === today) setActivePreset('hoy');
    else setActivePreset('');
  }, [filtroFechaInicio, filtroFechaFin]);

  const handlePreset = (preset) => {
    setActivePreset(preset);
    applyDatePreset(preset);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Compass className="w-6 h-6 text-sky-500" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Explorador Global de Urgencias</h1>
        </div>
        <p className="text-sm text-slate-500">Análisis operativo y clínico en tiempo real.</p>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400 mx-2" />
          <input type="date" value={filtroFechaInicio} onChange={e => setFiltroFechaInicio(e.target.value)} className="text-xs font-medium text-slate-600 outline-none bg-transparent cursor-pointer" />
          <span className="text-slate-400 mx-2">-</span>
          <input type="date" value={filtroFechaFin} onChange={e => setFiltroFechaFin(e.target.value)} className="text-xs font-medium text-slate-600 outline-none bg-transparent cursor-pointer" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button onClick={() => handlePreset('dia')} className={`px-4 py-1 text-xs rounded-md transition-colors ${activePreset === 'hoy' || activePreset === 'dia' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'font-medium text-slate-500 hover:bg-slate-50'}`}>Hoy</button>
            <button onClick={() => handlePreset('semana')} className={`px-4 py-1 text-xs rounded-md transition-colors ${activePreset === 'semana' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'font-medium text-slate-500 hover:bg-slate-50'}`}>Semana</button>
            <button onClick={() => handlePreset('mes')} className={`px-4 py-1 text-xs rounded-md transition-colors ${activePreset === 'mes' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'font-medium text-slate-500 hover:bg-slate-50'}`}>Mes</button>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${modoComparativo ? 'text-indigo-600' : 'text-slate-400'}`}>Comparar</span>
            <button onClick={() => setModoComparativo(!modoComparativo)} className={`w-8 h-4 rounded-full relative transition-colors ${modoComparativo ? 'bg-indigo-500' : 'bg-slate-200'}`}>
              <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-transform ${modoComparativo ? 'left-[18px]' : 'left-[2px]'}`}></div>
            </button>
          </div>
        </div>

        {modoComparativo && (
          <div className="flex justify-end mt-1 animate-fade-in w-full">
            <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-lg p-1.5 shadow-sm w-full justify-between">
              <Calendar className="w-4 h-4 text-indigo-400 mx-2" />
              <input type="date" value={filtroFechaInicioB} onChange={e => setFiltroFechaInicioB(e.target.value)} className="text-xs font-bold text-indigo-700 outline-none bg-transparent cursor-pointer" />
              <span className="text-indigo-400 mx-2">-</span>
              <input type="date" value={filtroFechaFinB} onChange={e => setFiltroFechaFinB(e.target.value)} className="text-xs font-bold text-indigo-700 outline-none bg-transparent cursor-pointer" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
