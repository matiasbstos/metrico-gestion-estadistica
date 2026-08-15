import React, { useMemo } from 'react';
import { Sparkles, Clock, Sun, Moon, AlertCircle, X } from 'lucide-react';

export default function SugerenciasTurnosBar({
  filtroFechaInicio,
  filtroFechaFin,
  filtroHoraInicio,
  filtroHoraFin,
  setFiltroHoraInicio,
  setFiltroHoraFin,
  setFiltroFechaFin,
  setHorarioPreset,
  turnosDB,
  pautasDB,
  isOpen,
  onClose
}) {
  // Helper para resolver el equipo asignado a la fecha y turno
  const resolverEquipo = (fechaStr, horarioCode) => {
    if (!fechaStr) return null;

    // 1. Buscar coincidencia exacta en turnosDB
    if (turnosDB && turnosDB.length > 0) {
      const match = turnosDB.find(t => t.fechaInicio === fechaStr && t.equipoTurno && t.equipoTurno !== 'Sin Asignar');
      if (match) return match.equipoTurno;
    }

    // 2. Buscar en pautasDB si existe
    if (pautasDB && fechaStr) {
      const monthId = fechaStr.substring(0, 7);
      if (pautasDB[monthId] && pautasDB[monthId][fechaStr]) {
        const dayMap = pautasDB[monthId][fechaStr];
        const keys = Object.keys(dayMap);
        if (keys.length > 0 && dayMap[keys[0]]) {
          const val = dayMap[keys[0]];
          return val.startsWith('Turno') || val.startsWith('Equipo') ? val : `Turno ${val}`;
        }
      }
    }

    // 3. Fallback rotativa cíclica (Turnos 1 a 4)
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const start = new Date(d.getFullYear(), 0, 0);
      const diff = d - start;
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      const eqNum = ((dayOfYear + (horarioCode === 'largo' ? 1 : 0)) % 4) + 1;
      return `Turno ${eqNum}`;
    }

    return null;
  };

  const contextInfo = useMemo(() => {
    if (!filtroFechaInicio) return null;

    const dateParts = filtroFechaInicio.split('-');
    if (dateParts.length !== 3) return null;

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const startDateObj = new Date(year, month, day);

    const dayOfWeek = startDateObj.getDay(); // 0 = Domingo, 6 = Sábado
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    const startHourStr = filtroHoraInicio || '00:00';
    const endHourStr = filtroHoraFin || '23:59';
    
    const [hStart, mStart] = startHourStr.split(':').map(Number);
    const [hEnd, mEnd] = endHourStr.split(':').map(Number);

    const startDateTime = new Date(year, month, day, hStart || 0, mStart || 0);
    let endDateTime = new Date(year, month, day, hEnd || 23, mEnd || 59);

    if (endDateTime <= startDateTime && filtroFechaInicio === (filtroFechaFin || filtroFechaInicio)) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    } else if (filtroFechaFin && filtroFechaFin > filtroFechaInicio) {
      const endParts = filtroFechaFin.split('-');
      if (endParts.length === 3) {
        endDateTime = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]), hEnd || 23, mEnd || 59);
      }
    }

    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    const durationHours = Math.max(0, diffMs / (1000 * 60 * 60));

    const isShortWindow = durationHours < 6 && durationHours > 0;
    const isLongWindow = durationHours > 24;

    const commonFullDay = {
      id: 'dia_completo',
      title: 'Día Completo',
      equipo: null,
      rangeLabel: '00:00 a 23:59 hrs',
      ruleText: 'Día calendario completo (00:00 a 23:59)',
      horaInicio: '00:00',
      horaFin: '23:59',
      preset: 'civil',
      icon: Clock,
      badgeColor: 'from-slate-500/20 to-zinc-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
    };

    let list = [];

    if (isLongWindow) {
      list = [commonFullDay];
    } else if (isWeekend) {
      const eqFindeDia = resolverEquipo(filtroFechaInicio, 'finde_dia');
      const eqFindeNoche = resolverEquipo(filtroFechaInicio, 'finde_noche');

      list = [
        commonFullDay,
        {
          id: 'finde_dia',
          title: 'Turno 1: Finde Día',
          equipo: eqFindeDia,
          rangeLabel: '08:00 a 20:00 hrs',
          ruleText: `Contabilización estricta 08:00 - 20:00${eqFindeDia ? ` (${eqFindeDia})` : ''}`,
          horaInicio: '08:00',
          horaFin: '20:00',
          preset: 'finde_dia',
          icon: Sun,
          badgeColor: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        },
        {
          id: 'finde_noche',
          title: 'Turno 3: Finde Noche',
          equipo: eqFindeNoche,
          rangeLabel: '20:00 a 08:00 hrs (+1d)',
          ruleText: `Contabilización estricta 20:00 - 08:00${eqFindeNoche ? ` (${eqFindeNoche})` : ''}`,
          horaInicio: '20:00',
          horaFin: '08:00',
          preset: 'finde_noche',
          icon: Moon,
          badgeColor: 'from-indigo-500/20 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
        }
      ];
    } else {
      // Día de semana (Lunes a Viernes)
      const eqLargo = resolverEquipo(filtroFechaInicio, 'largo');

      list = [
        commonFullDay,
        {
          id: 'largo_semana',
          title: 'Turno Largo Semana',
          equipo: eqLargo,
          rangeLabel: '17:00 a 08:00 hrs (+1d)',
          ruleText: `Oficial 17:00 - 08:00 hrs${eqLargo ? ` (${eqLargo})` : ''} — Sistema aplica 16:00 - 09:00 AM internamente`,
          horaInicio: '16:00',
          horaFin: '09:00',
          preset: 'largo',
          icon: Moon,
          badgeColor: 'from-indigo-500/20 to-sky-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
        }
      ];
    }

    return {
      isWeekend,
      durationHours: durationHours.toFixed(1),
      isShortWindow,
      isLongWindow,
      suggestions: list
    };
  }, [filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin, turnosDB, pautasDB]);

  if (!isOpen || !contextInfo || contextInfo.suggestions.length === 0) return null;

  const applySuggestion = (sug) => {
    setFiltroHoraInicio(sug.horaInicio);
    setFiltroHoraFin(sug.horaFin);
    setHorarioPreset(sug.preset);

    // Ajustar fecha fin al día siguiente si el turno cruza la noche (+1d)
    if (sug.preset === 'largo' || sug.preset === 'finde_noche') {
      const parts = filtroFechaInicio.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        d.setDate(d.getDate() + 1);
        const nextY = d.getFullYear();
        const nextM = String(d.getMonth() + 1).padStart(2, '0');
        const nextD = String(d.getDate()).padStart(2, '0');
        if (setFiltroFechaFin) setFiltroFechaFin(`${nextY}-${nextM}-${nextD}`);
      }
    }

    if (onClose) onClose();
  };

  return (
    <div className="absolute top-full right-0 mt-2 z-50 w-84 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-500/30 shadow-2xl backdrop-blur-xl animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-card-custom/20 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4 animate-pulse text-indigo-500" />
          <span>Sugerencia de Turno y Equipo</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          title="Cerrar sugerencia"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {contextInfo.isShortWindow && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 mb-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Rango digitado ({contextInfo.durationHours}h). ¿Ajustar al turno clínico oficial?</span>
        </div>
      )}

      <div className="space-y-2">
        {contextInfo.suggestions.map((sug) => {
          const IconComponent = sug.icon;
          const isActive = (filtroHoraInicio === sug.horaInicio && filtroHoraFin === sug.horaFin);

          return (
            <button
              key={sug.id}
              onClick={() => applySuggestion(sug)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/30'
                  : 'bg-card-custom/60 hover:bg-card-custom border-card-custom text-primary-custom hover:border-indigo-500/40 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">{sug.title}</span>
                    {sug.equipo && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                        isActive ? 'bg-white/25 text-white' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'
                      }`}>
                        {sug.equipo}
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] font-medium ${isActive ? 'text-indigo-100' : 'text-secondary-custom'}`}>
                    {sug.ruleText}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-indigo-600 dark:text-indigo-400'
              }`}>
                {sug.rangeLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
