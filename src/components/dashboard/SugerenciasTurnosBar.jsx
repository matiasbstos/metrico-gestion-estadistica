import React, { useMemo, useState, useEffect } from 'react';
import { Sparkles, Clock, Sun, Moon, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function SugerenciasTurnosBar({
  filtroFechaInicio,
  filtroFechaFin,
  filtroHoraInicio,
  filtroHoraFin,
  setFiltroHoraInicio,
  setFiltroHoraFin,
  setHorarioPreset
}) {
  const [userDismissed, setUserDismissed] = useState(false);

  // Re-mostrar sugerencias cuando el usuario cambie la fecha u hora
  useEffect(() => {
    setUserDismissed(false);
  }, [filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin]);

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

    // Calcular duración del rango horario ingresado
    const startHourStr = filtroHoraInicio || '00:00';
    const endHourStr = filtroHoraFin || '23:59';
    
    const [hStart, mStart] = startHourStr.split(':').map(Number);
    const [hEnd, mEnd] = endHourStr.split(':').map(Number);

    const startDateTime = new Date(year, month, day, hStart || 0, mStart || 0);
    let endDateTime = new Date(year, month, day, hEnd || 23, mEnd || 59);

    // Si la hora de fin es menor a la de inicio en el mismo día, cruza medianoche (+1d)
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

    // Determinar sugerencias según el contexto ingresado
    const isShortWindow = durationHours < 6 && durationHours > 0;
    const isLongWindow = durationHours > 24;

    const commonFullDay = {
      id: 'dia_completo',
      title: 'Día Completo',
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
      // Si el rango es mayor a 24 horas, solo sugerir Día Completo o nada
      list = [commonFullDay];
    } else if (isWeekend) {
      list = [
        commonFullDay,
        {
          id: 'finde_dia',
          title: 'Turno 1: Finde Día',
          rangeLabel: '08:00 a 20:00 hrs',
          ruleText: 'Contabilización estricta 08:00 - 20:00',
          horaInicio: '08:00',
          horaFin: '20:00',
          preset: 'finde_dia',
          icon: Sun,
          badgeColor: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        },
        {
          id: 'finde_noche',
          title: 'Turno 3: Finde Noche',
          rangeLabel: '20:00 a 08:00 hrs (+1d)',
          ruleText: 'Contabilización estricta 20:00 - 08:00',
          horaInicio: '20:00',
          horaFin: '08:00',
          preset: 'finde_noche',
          icon: Moon,
          badgeColor: 'from-indigo-500/20 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
        }
      ];
    } else {
      // Día de semana (Lunes a Viernes)
      list = [
        commonFullDay,
        {
          id: 'largo_semana',
          title: 'Turno Largo Semana',
          rangeLabel: '16:00 a 09:00 hrs (+1d)',
          ruleText: 'Encasillamiento 16:00 - 09:00 AM (+1 hora)',
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
  }, [filtroFechaInicio, filtroFechaFin, filtroHoraInicio, filtroHoraFin]);

  if (!contextInfo || contextInfo.suggestions.length === 0 || userDismissed) return null;

  const applySuggestion = (sug) => {
    setFiltroHoraInicio(sug.horaInicio);
    setFiltroHoraFin(sug.horaFin);
    setHorarioPreset(sug.preset);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 animate-fade-in py-1 px-2 rounded-xl bg-card-custom/50 border border-card-custom/40 shadow-sm theme-transition">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 shrink-0">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
        <span>Sugerencia según horario digitado:</span>
      </div>

      {/* Advertencia si el rango digitado es muy corto (< 6h) */}
      {contextInfo.isShortWindow && (
        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
          <AlertCircle className="w-3 h-3" />
          <span>Rango corto ({contextInfo.durationHours}h). ¿Ajustar a turno oficial?</span>
        </div>
      )}

      {/* Chips de Sugerencia */}
      {contextInfo.suggestions.map((sug) => {
        const IconComponent = sug.icon;
        const isActive = (filtroHoraInicio === sug.horaInicio && filtroHoraFin === sug.horaFin);

        return (
          <button
            key={sug.id}
            onClick={() => applySuggestion(sug)}
            className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border shadow-sm cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-indigo-500/25 scale-[1.02] ring-2 ring-indigo-500/40'
                : `bg-gradient-to-r ${sug.badgeColor} hover:scale-[1.02] hover:shadow-md`
            }`}
            title={`Filtrar ${sug.title} (${sug.ruleText})`}
          >
            <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
            <span>{sug.title}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
              isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 opacity-90'
            }`}>
              {sug.rangeLabel}
            </span>
          </button>
        );
      })}

      {/* Botón Ocultar Sugerencias */}
      <button
        onClick={() => setUserDismissed(true)}
        className="p-1 rounded-lg text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5 transition-all ml-auto"
        title="Ocultar sugerencias de turno"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
