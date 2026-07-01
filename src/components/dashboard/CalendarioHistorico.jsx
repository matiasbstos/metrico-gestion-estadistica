import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Activity, FileSpreadsheet } from 'lucide-react';

const TEAM_COLORS = {
  'Turno 1': '#10b981', // Verde
  'Turno 2': '#facc15', // Amarillo
  'Turno 3': '#3b82f6', // Azul
  'Turno 4': '#f97316', // Naranja
  'Sin Asignar': '#94a3b8' // Gris
};

export default function CalendarioHistorico({ turnosDB, pacientesDB }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

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
          
          return (
            <div key={d} className={`min-h-[120px] md:h-48 bg-white border rounded-xl p-2 md:p-3 flex flex-col transition-all shadow-sm overflow-hidden group ${isToday ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-300'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm md:text-lg font-black transition-colors ${isToday ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'}`}>{dayNumber}</span>
                {dayTurnos.length > 0 && (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">T: {totalPacientesDia}</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5">Altas: {altasAdminDia}</span>
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
                      <div key={t.id} className="p-1.5 md:p-2 rounded-lg border border-slate-100 bg-white shadow-sm relative overflow-hidden group/item hover:border-indigo-200 cursor-default">
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
    </div>
  );
}
