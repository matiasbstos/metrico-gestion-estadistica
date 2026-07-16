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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full animate-fade-in mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Histórico Mensual</h2>
            <p className="text-sm text-slate-500 font-medium">Cuadrícula de turnos y rendimiento por día</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
          <span className="text-lg font-black text-slate-700 w-40 text-center uppercase tracking-widest">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
          <div key={d} className="text-center text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-2 rounded-lg">{d.substring(0,3)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {calendarDays.map((d, idx) => {
          if (!d) return <div key={`empty-${idx}`} className="min-h-[120px] md:h-48 rounded-xl border border-dashed border-slate-200 bg-slate-50/50"></div>;
          
          const dayTurnos = turnosByDay[d] || [];
          const dayNumber = parseInt(d.split('-')[2], 10);
          const isToday = d === new Date().toISOString().split('T')[0];
          
          const totalPacientesDia = dayTurnos.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
          const altasAdminDia = dayTurnos.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
          
          const isWknd = isWeekendOrFestivoDay(d);
          const maxPac = isWknd ? maxStatsInMonth.maxPacWknd : maxStatsInMonth.maxPacWkdy;
          const maxAltas = isWknd ? maxStatsInMonth.maxAltasWknd : maxStatsInMonth.maxAltasWkdy;

          const isMaxPacientes = maxPac > 0 && totalPacientesDia === maxPac;
          const isMaxAltas = maxAltas > 0 && altasAdminDia === maxAltas;

          let borderClass = 'bg-white border-slate-200 hover:bg-slate-50/50 hover:border-indigo-300';
          if (isToday) {
            borderClass = 'bg-indigo-50/30 border-indigo-400 ring-2 ring-indigo-100';
          } else if (isMaxPacientes && isMaxAltas) {
            borderClass = 'bg-rose-50/50 border-rose-500 border-2 ring-4 ring-rose-100/40 shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:bg-rose-100/40';
          } else if (isMaxAltas) {
            borderClass = 'bg-amber-50/50 border-amber-500 border-2 ring-4 ring-amber-100/40 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:bg-amber-100/40';
          } else if (isMaxPacientes) {
            borderClass = 'bg-sky-50/50 border-sky-500 border-2 ring-4 ring-sky-100/40 shadow-[0_0_25px_rgba(14,165,233,0.35)] hover:bg-sky-100/40';
          }

          return (
            <div 
              key={d} 
              onClick={() => setSelectedDay(d)}
              className={`min-h-[120px] md:h-48 rounded-xl p-2 md:p-3 flex flex-col transition-all shadow-sm overflow-hidden group cursor-pointer ${borderClass}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm md:text-lg font-black transition-colors ${isToday ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'}`}>{dayNumber}</span>
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
                      <span className="text-[9px] md:text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">T: {totalPacientesDia}</span>
                    </div>
                    <span className="text-[8px] md:text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Altas: {altasAdminDia}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1.5 md:space-y-2 pr-1" style={{scrollbarWidth: 'thin'}}>
                {dayTurnos.length === 0 ? (
                  <p className="text-[9px] font-bold text-slate-300 text-center mt-4">Sin Datos</p>
                ) : (
                  dayTurnos.map(t => {
                    const bgCol = TEAM_COLORS[t.equipoTurno] || TEAM_COLORS['Sin Asignar'];
                    return (
                      <div key={t.id} className="p-1.5 md:p-2 rounded-lg border border-slate-100 bg-white shadow-sm relative overflow-hidden group/item hover:border-indigo-200 cursor-default" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: bgCol}}></div>
                        <div className="pl-1.5">
                          <p className="text-[8px] md:text-[9px] font-black uppercase mb-0.5" style={{color: bgCol}}>{t.equipoTurno}</p>
                          <p className="text-[8px] font-bold text-slate-400 mb-1 truncate" title={t.horario}>{t.horario.split('(')[0].trim()}</p>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] md:text-xs font-black text-slate-700">{t.totalPacientes} <span className="hidden md:inline">pac.</span></span>
                              <span className="text-[9px] md:text-[10px] font-bold text-rose-500">{t.altasAdmin} <span className="hidden md:inline">altas</span></span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {t.c1 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-red-500 bg-red-50 px-1 rounded">C1: {t.c1}</span>}
                              {t.c2 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-orange-500 bg-orange-50 px-1 rounded">C2: {t.c2}</span>}
                              {t.c3 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-yellow-500 bg-yellow-50 px-1 rounded">C3: {t.c3}</span>}
                              {t.c3_z518 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-yellow-600 bg-yellow-100 px-1 rounded">C3L: {t.c3_z518}</span>}
                              {t.c4 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">C4: {t.c4}</span>}
                              {t.c5 > 0 && <span className="text-[7px] md:text-[8px] font-bold text-blue-500 bg-blue-50 px-1 rounded">C5: {t.c5}</span>}
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
      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Equipos de Trabajo</h4>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(TEAM_COLORS).map(([team, color]) => (
              <div key={team} className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 shadow-sm text-xs font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: color}}></span>
                {team}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Alertas de Rendimiento (Contornos del Día)</h4>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.1)] text-xs font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-sky-500"></span>
              Contorno Azul: Día con mayor volumen de pacientes atendidos en el mes.
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)] text-xs font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              Contorno Amarillo: Día con mayor cantidad de altas administrativas en el mes.
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)] text-xs font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              Contorno Rojo: Día con ambos máximos históricos mensuales simultáneamente.
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-lg w-full overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
              <div>
                <h3 className="text-lg font-black tracking-wide">Resumen Detallado del Día</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="hover:bg-white/10 p-2 rounded-xl transition-all backdrop-blur-sm"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {(turnosByDay[selectedDay] || []).length === 0 ? (
                <p className="text-center text-slate-400 py-8 font-bold">No hay registros de turnos para este día.</p>
              ) : (
                (turnosByDay[selectedDay] || []).map((t, idx) => {
                  const bgCol = TEAM_COLORS[t.equipoTurno] || TEAM_COLORS['Sin Asignar'];
                  const pct = t.totalPacientes > 0 ? (t.altasAdmin / t.totalPacientes) * 100 : 0;
                  return (
                    <div key={t.id || idx} className="border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden bg-slate-50/30">
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{backgroundColor: bgCol}}></div>
                      <div className="pl-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-wider" style={{color: bgCol}}>{t.equipoTurno}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{t.horario}</p>
                          </div>
                          <span className="text-xs font-black text-slate-700 bg-white border border-slate-100 px-2 py-1 rounded-lg shadow-sm">
                            Ratio: {t.pacientesPorHora ? Number(t.pacientesPorHora).toFixed(1) : 0} pac/h
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atenciones</span>
                            <span className="text-xl font-black text-slate-800 mt-1">{t.totalPacientes} <span className="text-xs font-semibold text-slate-400">pacientes</span></span>
                          </div>
                          <div className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between transition-colors ${pct > 5 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Altas Admin</span>
                            <span className="text-xl font-black text-rose-700 mt-1">{t.altasAdmin} <span className="text-xs font-semibold text-rose-400">altas ({pct.toFixed(1)}%)</span></span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Distribución de Categorías (Triaje)</h5>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {[
                              { label: 'C1', val: t.c1, color: TRIAGE_COLORS.C1 },
                              { label: 'C2', val: t.c2, color: TRIAGE_COLORS.C2 },
                              { label: 'C3', val: t.c3, color: TRIAGE_COLORS.C3 },
                              { label: 'C3 (L)', val: t.c3_z518, color: TRIAGE_COLORS['C3 (L)'] },
                              { label: 'C4', val: t.c4, color: TRIAGE_COLORS.C4 },
                              { label: 'C5', val: t.c5, color: TRIAGE_COLORS.C5 }
                            ].map(cat => (
                              <div key={cat.label} className="bg-white border border-slate-100 rounded-lg p-2 flex flex-col items-center justify-center">
                                <span className="text-xs font-black" style={{color: cat.color}}>{cat.val || 0}</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">{cat.label}</span>
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
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedDay(null)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold transition-all shadow-sm text-sm">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
