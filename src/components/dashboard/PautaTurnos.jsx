import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Save, UploadCloud, DownloadCloud, ChevronLeft, ChevronRight, CheckCircle, Activity } from 'lucide-react';

export default function PautaTurnos({ usePautasTurnos, showNotif, isGlobalAdmin }) {
  const { pautasDB, loadingPautas, savePautaMes } = usePautasTurnos;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [turnosMensuales, setTurnosMensuales] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Derive current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  
  useEffect(() => {
    if (pautasDB[monthStr]) {
      setTurnosMensuales(pautasDB[monthStr]);
    } else {
      setTurnosMensuales({});
    }
  }, [pautasDB, monthStr]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday, 1 is Monday...

  const shiftTeams = ['Turno 1', 'Turno 2', 'Turno 3', 'Turno 4'];

  const getDayName = (dayIndex) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex % 7];
  };

  const isWeekendOrHoliday = (year, month, day, dateStr) => {
    const dayData = turnosMensuales[dateStr] || {};
    if (dayData.festivo) return true;

    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Simplified: consider only weekends for now, holidays can be manually added
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const handleToggleFestivo = (day, isFestivo) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setTurnosMensuales(prev => {
      const updatedDay = { ...prev[dateStr] };
      updatedDay.festivo = isFestivo;
      if (isFestivo) {
        delete updatedDay['17:00 - 08:00'];
      } else {
        delete updatedDay['08:00 - 20:00'];
        delete updatedDay['20:00 - 08:00'];
      }
      return { ...prev, [dateStr]: updatedDay };
    });
  };

  const handleDayShiftChange = (day, shiftType, newValue) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setTurnosMensuales(prev => {
      const updatedDay = { ...prev[dateStr] };
      if (newValue) {
        updatedDay[shiftType] = newValue;
      } else {
        delete updatedDay[shiftType];
      }
      return { ...prev, [dateStr]: updatedDay };
    });
  };

  const savePauta = async () => {
    setIsSaving(true);
    const success = await savePautaMes(monthStr, turnosMensuales);
    if (success) showNotif('Pauta guardada exitosamente.', 'success');
    else showNotif('Error al guardar la pauta.', 'error');
    setIsSaving(false);
  };

  const nextMonth = () => setCurrentDate(new Date(year, month, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));

  const stats = useMemo(() => {
    const counts = { 'Turno 1': 0, 'Turno 2': 0, 'Turno 3': 0, 'Turno 4': 0 };
    Object.values(turnosMensuales).forEach(day => {
      Object.values(day).forEach(team => {
        if (counts[team] !== undefined) counts[team]++;
      });
    });
    return counts;
  }, [turnosMensuales]);

  // Excel Handlers
  const downloadTemplate = () => {
    if (!window.XLSX) return showNotif('Librería Excel no cargada', 'error');
    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isWeekend = isWeekendOrHoliday(year, month, day, dateStr);
      if (isWeekend) {
        data.push({ FECHA: dateStr, HORARIO: '08:00 - 20:00', EQUIPO: '' });
        data.push({ FECHA: dateStr, HORARIO: '20:00 - 08:00', EQUIPO: '' });
      } else {
        data.push({ FECHA: dateStr, HORARIO: '17:00 - 08:00', EQUIPO: '' });
      }
    }
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Pauta");
    window.XLSX.writeFile(wb, `Plantilla_Turnos_${monthStr}.xlsx`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.XLSX) return showNotif('Librería Excel no cargada', 'error');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
        const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const newTurnos = { ...turnosMensuales };
        
        rows.forEach(row => {
          let fecha = row.FECHA;
          // Si Excel convirtió la fecha a número
          if (typeof fecha === 'number') {
            const date = new Date((fecha - 25569) * 86400 * 1000);
            fecha = date.toISOString().split('T')[0];
          }
          if (!fecha || !fecha.startsWith(monthStr)) return;

          const horario = row.HORARIO;
          const equipo = row.EQUIPO;
          if (horario && equipo) {
            if (!newTurnos[fecha]) newTurnos[fecha] = {};
            newTurnos[fecha][horario] = equipo;
          }
        });
        
        setTurnosMensuales(newTurnos);
        showNotif('Pauta procesada. Revisa los datos y guarda.', 'success');
      } catch (err) {
        showNotif('Error procesando el Excel.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  if (loadingPautas) {
    return <div className="flex justify-center items-center h-64"><Activity className="animate-pulse w-8 h-8 text-blue-500"/></div>;
  }

  const renderCalendarCell = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isWeekend = isWeekendOrHoliday(year, month, day, dateStr);
    const dayData = turnosMensuales[dateStr] || {};

    const getSelectColor = (val) => {
      if (val === 'Turno 1') return 'bg-[#a3e635] text-slate-800'; // Verde
      if (val === 'Turno 2') return 'bg-[#fde047] text-slate-800'; // Amarillo
      if (val === 'Turno 3') return 'bg-[#0ea5e9] text-white';     // Azul
      if (val === 'Turno 4') return 'bg-[#fb923c] text-white';     // Naranja
      return 'bg-white text-slate-700';
    };

    const selectClass = (val) => `w-full text-xs font-bold p-1 rounded border outline-none focus:border-indigo-500 shadow-sm transition-colors ${getSelectColor(val)}`;
    
    return (
      <div key={day} className="border border-slate-200 p-2 min-h-[100px] flex flex-col bg-white rounded shadow-sm hover:shadow-md transition">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-black ${isWeekend ? 'text-rose-500' : 'text-slate-700'}`}>{day}</span>
          {!isWeekendOrHoliday(year, month, day, null) && ( // Si no es finde natural, mostramos el toggle
            <label className="flex items-center gap-1 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-3 h-3 rounded border-slate-300"
                checked={dayData.festivo || false}
                onChange={e => handleToggleFestivo(day, e.target.checked)}
              />
              <span className="text-[9px] font-bold text-rose-500">Festivo</span>
            </label>
          )}
          {isWeekendOrHoliday(year, month, day, null) && dayData.festivo && (
             // Si es finde natural pero alguien lo marco festivo en el estado
             <span className="text-[9px] font-bold text-rose-500">Finde</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2 justify-center">
          {isWeekend ? (
            <>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 w-10">08-20h</span>
                <select value={dayData['08:00 - 20:00'] || ''} onChange={e => handleDayShiftChange(day, '08:00 - 20:00', e.target.value)} className={selectClass(dayData['08:00 - 20:00'])}>
                  <option value=""></option>
                  {shiftTeams.map(t => <option key={t} value={t} className="bg-white text-slate-800">{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 w-10">20-08h</span>
                <select value={dayData['20:00 - 08:00'] || ''} onChange={e => handleDayShiftChange(day, '20:00 - 08:00', e.target.value)} className={selectClass(dayData['20:00 - 08:00'])}>
                  <option value=""></option>
                  {shiftTeams.map(t => <option key={t} value={t} className="bg-white text-slate-800">{t}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[9px] font-bold text-slate-400 w-10">17-08h</span>
              <select value={dayData['17:00 - 08:00'] || ''} onChange={e => handleDayShiftChange(day, '17:00 - 08:00', e.target.value)} className={selectClass(dayData['17:00 - 08:00'])}>
                <option value=""></option>
                {shiftTeams.map(t => <option key={t} value={t} className="bg-white text-slate-800">{t}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };

  const generateCalendarGrid = () => {
    const days = [];
    const startIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Make Monday index 0
    
    for (let i = 0; i < startIndex; i++) {
      days.push(<div key={`empty-${i}`} className="bg-slate-50/50 rounded"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderCalendarCell(day));
    }
    return days;
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <CalendarIcon className="w-8 h-8 text-indigo-500" />
          <div>
            <h2 className="text-xl font-black text-slate-800">Pauta de Turnos</h2>
            <p className="text-xs font-bold text-slate-400">Programa la distribución mensual de equipos</p>
          </div>
        </div>
        {isGlobalAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition">
              <DownloadCloud className="w-4 h-4"/> Plantilla
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold rounded-lg text-sm transition cursor-pointer">
              <UploadCloud className="w-4 h-4"/> Cargar Excel
              <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} />
            </label>
            <button onClick={savePauta} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg text-sm transition shadow-md">
              {isSaving ? <Activity className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Guardar
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronLeft className="w-6 h-6 text-slate-500"/></button>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-wider">{monthNames[month-1]} {year}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronRight className="w-6 h-6 text-slate-500"/></button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d, i) => (
            <div key={d} className={`text-center text-xs font-black p-2 rounded ${i >= 5 ? 'text-rose-500 bg-rose-50' : 'text-slate-500 bg-slate-100'}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {generateCalendarGrid()}
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-4">Total de Turnos Asignados - {monthNames[month-1]} {year}</h4>
        <div className="grid grid-cols-4 gap-4">
          {shiftTeams.map(t => (
            <div key={t} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-slate-500 mb-1">{t}</span>
              <span className="text-3xl font-black text-indigo-600">{stats[t] || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Turnos</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
