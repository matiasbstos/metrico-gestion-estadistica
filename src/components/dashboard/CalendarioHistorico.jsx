import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Activity, FileSpreadsheet, X, Users, AlertTriangle } from 'lucide-react';

const TEAM_COLORS = {
  'Turno 1': '#10b981', // Verde
  'Turno 2': '#facc15', // Amarillo
  'Turno 3': '#3b82f6', // Azul
  'Turno 4': '#f97316', // Naranja
  'Sin Asignar': '#94a3b8' // Gris
};

const TRIAGE_COLORS = {
  'C1': '#ef4444',
  'C2': '#f97316',
  'C3': '#eab308',
  'C3 (L)': '#ca8a04',
  'C4': '#10b981',
  'C5': '#3b82f6'
};

export default function CalendarioHistorico({ turnosDB, pacientesDB }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [customStartHour, setCustomStartHour] = useState('17:00');
  const [customEndHour, setCustomEndHour] = useState('08:00');
  const [showCustomRangePanel, setShowCustomRangePanel] = useState(false);
  const [criterioVisualizacion, setCriterioVisualizacion] = useState('operativo');

  const getStrictStats = (t) => {
    if (!pacientesDB || pacientesDB.length === 0) {
      return { 
        total: t.totalPacientes, 
        altas: t.altasAdmin, 
        c1: t.c1 || 0, 
        c2: t.c2 || 0, 
        c3: t.c3 || 0, 
        c3_z518: t.c3_z518 || 0, 
        c4: t.c4 || 0, 
        c5: t.c5 || 0 
      };
    }
    
    let startMs, endMs;
    const baseDateStr = t.fechaInicio;
    const nextDate = new Date(baseDateStr + 'T12:00:00');
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    
    if (t.horario.includes('17:00')) {
      startMs = new Date(`${baseDateStr}T16:00:00-04:00`).getTime();
      endMs = new Date(`${nextDateStr}T08:00:00-04:00`).getTime();
    } else if (t.horario.includes('08:00 - 20:00')) {
      startMs = new Date(`${baseDateStr}T07:00:00-04:00`).getTime();
      endMs = new Date(`${baseDateStr}T20:00:00-04:00`).getTime();
    } else if (t.horario.includes('20:00 - 08:00')) {
      startMs = new Date(`${baseDateStr}T19:00:00-04:00`).getTime();
      endMs = new Date(`${nextDateStr}T08:00:00-04:00`).getTime();
    } else {
      return { 
        total: t.totalPacientes, 
        altas: t.altasAdmin, 
        c1: t.c1 || 0, 
        c2: t.c2 || 0, 
        c3: t.c3 || 0, 
        c3_z518: t.c3_z518 || 0, 
        c4: t.c4 || 0, 
        c5: t.c5 || 0 
      };
    }
    
    const inShift = pacientesDB.filter(p => p.tAdmision >= startMs && p.tAdmision <= endMs);
    const counts = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0 };
    inShift.forEach(p => {
      if (counts[p.categoria] !== undefined) counts[p.categoria]++;
    });

    return {
      total: inShift.length,
      altas: inShift.filter(p => p.estado === 'Cancelada').length,
      ...counts
    };
  };

  const customStats = useMemo(() => {
    if (!selectedDay || !pacientesDB || pacientesDB.length === 0) return null;
    
    const [y, m, d] = selectedDay.split('-').map(Number);
    const [sh, smin] = customStartHour.split(':').map(Number);
    const [eh, emin] = customEndHour.split(':').map(Number);
    
    const startMs = new Date(y, m - 1, d, sh, smin, 0).getTime();
    
    let endDay = d;
    if (sh > eh || (sh === eh && smin >= emin)) {
      endDay = d + 1;
    }
    const endMs = new Date(y, m - 1, endDay, eh, emin, 0).getTime();
    
    const filtered = pacientesDB.filter(p => p.tAdmision >= startMs && p.tAdmision <= endMs);
    const totalAdmitidos = filtered.length;
    const altasAdmin = filtered.filter(p => p.estado === 'Cancelada').length;
    const atendidos = totalAdmitidos - altasAdmin;
    
    return {
      totalAdmitidos,
      altasAdmin,
      atendidos
    };
  }, [selectedDay, customStartHour, customEndHour, pacientesDB]);

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Lunes es 1, Domingo es 0. Transformar a base 0 (Lunes)
    let startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for(let i=0; i<startPadding; i++) days.push(null);
    
    for(let i=1; i<=lastDay.getDate(); i++) {
      const dStr = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(dStr);
    }
    
    return days;
  }, [currentMonth]);

  const turnosByDay = useMemo(() => {
    const map = {};
    turnosDB.forEach(t => {
      if(!t.fechaInicio) return;
      if(!map[t.fechaInicio]) map[t.fechaInicio] = [];
      map[t.fechaInicio].push(t);
    });
    
    // Sort turnos inside each day by horario
    Object.keys(map).forEach(date => {
        map[date].sort((a,b) => a.horario.localeCompare(b.horario));
    });
    return map;
  }, [turnosDB]);

  const isWeekendOrFestivoDay = (dStr) => {
    if (!dStr) return false;
    const dayTurnos = turnosByDay[dStr] || [];
    const hasWeekendTurno = dayTurnos.some(t => t.horario && t.horario.includes('Fin de semana'));
    if (hasWeekendTurno) return true;
    
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const day = dObj.getDay();
      return day === 0 || day === 6;
    }
    return false;
  };

  const maxStatsInMonth = useMemo(() => {
    let maxPacWkdy = 0;
    let maxAltasWkdy = 0;
    let maxPacWknd = 0;
    let maxAltasWknd = 0;

    calendarDays.forEach(d => {
      if (!d) return;
      const dayTurnos = turnosByDay[d] || [];
      const pacs = dayTurnos.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
      const altas = dayTurnos.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
      
      if (isWeekendOrFestivoDay(d)) {
        if (pacs > maxPacWknd) maxPacWknd = pacs;
        if (altas > maxAltasWknd) maxAltasWknd = altas;
      } else {
        if (pacs > maxPacWkdy) maxPacWkdy = pacs;
        if (altas > maxAltasWkdy) maxAltasWkdy = altas;
      }
    });

    return { maxPacWkdy, maxAltasWkdy, maxPacWknd, maxAltasWknd };
  }, [calendarDays, turnosByDay]);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="bg-card-custom p-6 w-full animate-fade-in mt-6 theme-transition">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary-custom">Histórico Mensual</h2>
            <p className="text-sm text-secondary-custom font-medium">Cuadrícula de turnos y rendimiento por día</p>
          </div>
        </div>
        
        {/* Selector de Criterio de Visualización */}
        <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-card-custom transition-all text-xs font-bold gap-1 shadow-inner theme-transition">
          <button 
            type="button"
            onClick={() => setCriterioVisualizacion('operativo')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${criterioVisualizacion === 'operativo' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
          >
            Tramo 24 Horas
          </button>
          <button 
            type="button"
            onClick={() => setCriterioVisualizacion('estricto')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${criterioVisualizacion === 'estricto' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
          >
            Turno
          </button>
        </div>

        <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-card-custom shadow-inner">
          <button onClick={prevMonth} className="p-2 hover:bg-card-custom rounded-lg transition-colors shadow-sm text-primary-custom"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-lg font-black text-primary-custom w-40 text-center uppercase tracking-widest">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-card-custom rounded-lg transition-colors shadow-sm text-primary-custom"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
          <div key={d} className="text-center text-[10px] md:text-xs font-black text-secondary-custom opacity-85 uppercase tracking-widest bg-black/5 dark:bg-white/5 py-2 rounded-xl border border-card-custom/20">{d.substring(0,3)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {calendarDays.map((d, idx) => {
          if (!d) return <div key={`empty-${idx}`} className="min-h-[120px] md:h-48 rounded-xl border border-dashed border-card-custom bg-black/5 dark:bg-white/5 opacity-55"></div>;
          
          const dayTurnos = turnosByDay[d] || [];
          const processedTurnos = dayTurnos.map(t => {
            if (criterioVisualizacion === 'estricto') {
              const strict = getStrictStats(t);
              return {
                ...t,
                totalPacientes: strict.total,
                altasAdmin: strict.altas,
                c1: strict.c1,
                c2: strict.c2,
                c3: strict.c3,
                c3_z518: strict.c3_z518,
                c4: strict.c4,
                c5: strict.c5
              };
            }
            return t;
          });

          const dayNumber = parseInt(d.split('-')[2], 10);
          const isToday = d === new Date().toISOString().split('T')[0];
          
          const totalPacientesDia = processedTurnos.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
          const altasAdminDia = processedTurnos.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
          
          const isWknd = isWeekendOrFestivoDay(d);
          const maxPac = isWknd ? maxStatsInMonth.maxPacWknd : maxStatsInMonth.maxPacWkdy;
          const maxAltas = isWknd ? maxStatsInMonth.maxAltasWknd : maxStatsInMonth.maxAltasWkdy;

          const isMaxPacientes = maxPac > 0 && totalPacientesDia === maxPac;
          const isMaxAltas = maxAltas > 0 && altasAdminDia === maxAltas;

          let borderClass = 'bg-card-custom hover:bg-black/5 dark:hover:bg-white/5 border-card-custom';
          if (isToday) {
            borderClass = 'bg-indigo-500/10 border-indigo-500 ring-4 ring-indigo-500/25';
          } else if (isMaxPacientes && isMaxAltas) {
            borderClass = 'bg-rose-500/10 border-rose-500 border-2 ring-4 ring-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:bg-rose-500/15';
          } else if (isMaxAltas) {
            borderClass = 'bg-amber-500/10 border-amber-500 border-2 ring-4 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:bg-amber-500/15';
          } else if (isMaxPacientes) {
            borderClass = 'bg-sky-500/10 border-sky-500 border-2 ring-4 ring-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:bg-sky-500/15';
          }

          return (
            <div 
              key={d} 
              onClick={() => setSelectedDay(d)}
              className={`min-h-[120px] md:h-48 rounded-xl p-2 md:p-3 flex flex-col transition-all shadow-sm overflow-hidden group cursor-pointer ${borderClass}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm md:text-lg font-black transition-colors ${isToday ? 'accent-text-custom' : 'text-secondary-custom opacity-70 group-hover:accent-text-custom'}`}>{dayNumber}</span>
                {dayTurnos.length > 0 && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {isMaxPacientes && isMaxAltas ? (
                        <span className="text-[7px] font-black bg-rose-500 text-white px-1 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">MÁX DÍA</span>
                      ) : isMaxAltas ? (
                        <span className="text-[7px] font-black bg-amber-500 text-white px-1 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">MÁX ALTAS</span>
                      ) : isMaxPacientes ? (
                        <span className="text-[7px] font-black bg-sky-500 text-white px-1 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">MÁX PAC</span>
                      ) : null}
                      <span className="text-[9px] md:text-[10px] font-black text-primary-custom bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">T: {totalPacientesDia}</span>
                    </div>
                    <span className="text-[8px] md:text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">Altas: {altasAdminDia}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 md:space-y-2 pr-1 no-scrollbar">
                {processedTurnos.length === 0 ? (
                  <p className="text-[9px] font-bold text-secondary-custom opacity-55 text-center mt-4">Sin Datos</p>
                ) : (
                  processedTurnos.map(t => {
                    const bgCol = TEAM_COLORS[t.equipoTurno] || TEAM_COLORS['Sin Asignar'];
                    return (
                      <div key={t.id} className="p-1.5 md:p-2 rounded-lg border border-card-custom bg-card-custom shadow-sm relative overflow-hidden group/item hover:accent-border-custom cursor-pointer transition-all duration-200">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: bgCol}}></div>
                        <div className="pl-1.5">
                          <p className="text-[8px] md:text-[9px] font-black uppercase mb-0.5" style={{color: bgCol}}>{t.equipoTurno}</p>
                          <p className="text-[8px] font-bold text-secondary-custom opacity-85 mb-1 truncate" title={t.horario}>{t.horario.split('(')[0].trim()}</p>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] md:text-xs font-black text-primary-custom">{t.totalPacientes} <span className="hidden md:inline">pac.</span></span>
                              <span className="text-[9px] md:text-[10px] font-bold text-rose-500">{t.altasAdmin} <span className="hidden md:inline">altas</span></span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {t.c1 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-red-500 bg-red-500/10 px-1 rounded">C1: {t.c1}</span>}
                              {t.c2 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-orange-500 bg-orange-500/10 px-1 rounded">C2: {t.c2}</span>}
                              {t.c3 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-1 rounded">C3: {t.c3}</span>}
                              {t.c3_z518 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-600/15 px-1 rounded">C3L: {t.c3_z518}</span>}
                              {t.c4 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded">C4: {t.c4}</span>}
                              {t.c5 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-blue-500 bg-blue-500/10 px-1 rounded">C5: {t.c5}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* GLOSARIO / LEYENDA */}
      <div className="mt-8 pt-6 border-t border-card-custom grid grid-cols-1 md:grid-cols-2 gap-6 theme-transition">
        <div>
          <h4 className="text-xs font-bold text-secondary-custom uppercase tracking-wider mb-3">Equipos de Trabajo</h4>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(TEAM_COLORS).map(([team, color]) => (
              <div key={team} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-card-custom shadow-sm text-xs font-bold text-secondary-custom">
                <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: color}}></span>
                {team}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-secondary-custom uppercase tracking-wider mb-3">Alertas de Rendimiento (Contornos del Día)</h4>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.05)] text-xs font-semibold text-primary-custom">
              <span className="w-3 h-3 rounded-full bg-sky-500"></span>
              Contorno Azul: Día con mayor volumen de pacientes atendidos en el mes.
            </div>
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.05)] text-xs font-semibold text-primary-custom">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              Contorno Amarillo: Día con mayor cantidad de altas administrativas en el mes.
            </div>
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.05)] text-xs font-semibold text-primary-custom">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              Contorno Rojo: Día con ambos máximos históricos mensuales simultáneamente.
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-overlay)' }} onClick={() => setSelectedDay(null)}>
          <div className="bg-card-custom rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-lg w-full overflow-hidden border border-card-custom theme-transition" onClick={e => e.stopPropagation()}>
            <div className="bg-black/5 dark:bg-white/5 text-primary-custom p-6 flex justify-between items-center border-b border-card-custom relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
              <div>
                <h3 className="text-lg font-black tracking-wide text-primary-custom">Resumen Detallado del Día</h3>
                <p className="text-xs text-secondary-custom font-semibold mt-0.5">
                  {new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="hover:bg-black/10 dark:hover:bg-white/10 p-2 rounded-xl transition-all text-primary-custom"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* PANEL COMPARATIVO Y DE CONTROL DE CUADRATURA */}
              <div className="bg-slate-50 dark:bg-black/25 border border-card-custom rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setShowCustomRangePanel(!showCustomRangePanel)}>
                  <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Control de Cuadratura por Tramo Horario
                  </span>
                  <span className="text-xs font-bold text-slate-400">{showCustomRangePanel ? 'Ocultar' : 'Mostrar'}</span>
                </div>
                
                {showCustomRangePanel && (
                  <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/5 animate-fade-in text-left">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hora Inicio</label>
                        <input 
                          type="time" 
                          value={customStartHour} 
                          onChange={e => setCustomStartHour(e.target.value)} 
                          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hora Término</label>
                        <input 
                          type="time" 
                          value={customEndHour} 
                          onChange={e => setCustomEndHour(e.target.value)} 
                          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none" 
                        />
                      </div>
                    </div>
                    
                    {customStats && (
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-center">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Admitidos</span>
                          <span className="text-lg font-black text-slate-700 dark:text-slate-200">{customStats.totalAdmitidos}</span>
                        </div>
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-center">
                          <span className="text-[9px] font-bold text-emerald-500 block uppercase">Atendidos</span>
                          <span className="text-lg font-black text-emerald-500">{customStats.atendidos}</span>
                        </div>
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-center">
                          <span className="text-[9px] font-bold text-rose-500 block uppercase">Altas Admin</span>
                          <span className="text-lg font-black text-rose-500">{customStats.altasAdmin}</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-[9px] font-semibold text-slate-400 leading-normal">
                      * Nota: Si la hora de inicio es mayor que la de término (Ej: 17:00 a 08:00), el sistema calcula el tramo cruzando la medianoche hacia la mañana del día siguiente de forma automática.
                    </p>
                  </div>
                )}
              </div>

              {(turnosByDay[selectedDay] || []).length === 0 ? (
                <p className="text-center text-secondary-custom py-8 font-bold">No hay registros de turnos para este día.</p>
              ) : (
                (turnosByDay[selectedDay] || []).map((t, idx) => {
                  const bgCol = TEAM_COLORS[t.equipoTurno] || TEAM_COLORS['Sin Asignar'];
                  const pct = t.totalPacientes > 0 ? (t.altasAdmin / t.totalPacientes) * 100 : 0;
                  
                  // Calcular dinámicamente los contadores en horario oficial estricto (Rayen PDF)
                  const strictStats = (() => {
                    if (!pacientesDB || pacientesDB.length === 0) return { total: t.totalPacientes, altas: t.altasAdmin };
                    
                    let startMs, endMs;
                    const baseDateStr = t.fechaInicio;
                    const nextDate = new Date(baseDateStr + 'T12:00:00');
                    nextDate.setDate(nextDate.getDate() + 1);
                    const nextDateStr = nextDate.toISOString().split('T')[0];
                    
                    if (t.horario.includes('17:00')) {
                      startMs = new Date(`${baseDateStr}T16:00:00-04:00`).getTime();
                      endMs = new Date(`${nextDateStr}T08:00:00-04:00`).getTime();
                    } else if (t.horario.includes('08:00 - 20:00')) {
                      startMs = new Date(`${baseDateStr}T07:00:00-04:00`).getTime();
                      endMs = new Date(`${baseDateStr}T20:00:00-04:00`).getTime();
                    } else if (t.horario.includes('20:00 - 08:00')) {
                      startMs = new Date(`${baseDateStr}T19:00:00-04:00`).getTime();
                      endMs = new Date(`${nextDateStr}T08:00:00-04:00`).getTime();
                    } else {
                      return { total: t.totalPacientes, altas: t.altasAdmin };
                    }
                    
                    const inShift = pacientesDB.filter(p => p.tAdmision >= startMs && p.tAdmision <= endMs);
                    return {
                      total: inShift.length,
                      altas: inShift.filter(p => p.estado === 'Cancelada').length
                    };
                  })();
                  
                  const strictPct = strictStats.total > 0 ? (strictStats.altas / strictStats.total) * 100 : 0;

                  return (
                    <div key={t.id || idx} className="border border-card-custom rounded-2xl p-4 shadow-sm relative overflow-hidden bg-black/5 dark:bg-white/5">
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{backgroundColor: bgCol}}></div>
                      <div className="pl-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-wider" style={{color: bgCol}}>{t.equipoTurno}</h4>
                            <p className="text-xs text-secondary-custom opacity-85 font-semibold">{t.horario}</p>
                          </div>
                          <span className="text-xs font-black text-primary-custom bg-card-custom border border-card-custom px-2 py-1 rounded-lg shadow-sm">
                            Ratio: {t.pacientesPorHora ? Number(t.pacientesPorHora).toFixed(1) : 0} pac/h
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-card-custom p-3 rounded-xl border border-card-custom shadow-sm flex flex-col justify-between text-left">
                            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Admitidos</span>
                            <span className="text-2xl font-black text-primary-custom mt-1">{strictStats.total} <span className="text-xs font-semibold text-secondary-custom">pac.</span></span>
                          </div>

                          <div className="bg-card-custom p-3 rounded-xl border border-card-custom shadow-sm flex flex-col justify-between text-left">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Atendidos</span>
                            <span className="text-2xl font-black text-emerald-500 mt-1">{strictStats.total - strictStats.altas} <span className="text-xs font-semibold text-emerald-400">pac.</span></span>
                          </div>
                          
                          <div className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between transition-colors text-left ${strictPct > 5 ? 'bg-rose-500/10 border-rose-500' : 'bg-card-custom border-card-custom'}`}>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${strictPct > 5 ? 'text-rose-500' : 'text-secondary-custom'}`}>Altas Admin</span>
                            <span className="text-2xl font-black text-rose-500 mt-1">{strictStats.altas} <span className="text-xs font-semibold text-rose-400">({strictPct.toFixed(1)}%)</span></span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider mb-2">Distribución de Categorías (Triaje)</h5>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {[
                              { label: 'C1', val: t.c1, color: TRIAGE_COLORS.C1 },
                              { label: 'C2', val: t.c2, color: TRIAGE_COLORS.C2 },
                              { label: 'C3', val: t.c3, color: TRIAGE_COLORS.C3 },
                              { label: 'C3 (L)', val: t.c3_z518, color: TRIAGE_COLORS['C3 (L)'] },
                              { label: 'C4', val: t.c4, color: TRIAGE_COLORS.C4 },
                              { label: 'C5', val: t.c5, color: TRIAGE_COLORS.C5 }
                            ].map(cat => (
                              <div key={cat.label} className="bg-card-custom border border-card-custom rounded-2xl p-2.5 flex flex-col items-center justify-center aspect-square min-w-[55px] md:min-w-[60px] shadow-sm">
                                <span className="text-sm font-black" style={{color: cat.color}}>{cat.val || 0}</span>
                                <span className="text-[9px] font-black text-secondary-custom mt-0.5">{cat.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-6 bg-black/5 dark:bg-white/5 border-t border-card-custom flex justify-end">
              <button onClick={() => setSelectedDay(null)} className="px-5 py-2.5 accent-bg-custom text-white rounded-xl font-bold transition-all shadow-sm text-sm">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
