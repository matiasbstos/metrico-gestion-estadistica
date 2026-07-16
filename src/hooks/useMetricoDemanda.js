import { useMemo } from 'react';

const parseLocalDatetime = (dateStr, hourMinStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = (hourMinStr || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0).getTime();
};

const isPatientInWindow = (tAdmMs, startDayStr, endDayStr, startHourStr, endHourStr) => {
  if (!tAdmMs) return false;
  const tStart = parseLocalDatetime(startDayStr, startHourStr || '00:00');
  const tEnd = parseLocalDatetime(endDayStr, endHourStr || '23:59');
  if (isNaN(tStart) || isNaN(tEnd)) return false;
  return tAdmMs >= tStart && tAdmMs <= tEnd;
};

export const useMetricoDemanda = (pacientesDB, turnosDB, demandaFechaInicio, demandaFechaFin, modoComparativo, filtroFechaInicioB, filtroFechaFinB, docsToCompare, tipoCorte = 'turno', filtroHoraInicio = '00:00', filtroHoraFin = '23:59') => {
  // =========================================================================
  // 2. PIPELINE DE DATOS DEMANDA (Afecta solo Curva 24 hrs)
  // =========================================================================
  const turnosDemanda = useMemo(() => {
    return turnosDB.filter(t => {
      if (demandaFechaInicio && t.fechaInicio < demandaFechaInicio) return false;
      if (demandaFechaFin && t.fechaFin > demandaFechaFin) return false;
      return true;
    });
  }, [turnosDB, demandaFechaInicio, demandaFechaFin]);

  const pacientesDemanda = useMemo(() => {
    return pacientesDB.filter(p => isPatientInWindow(p.tAdmision, demandaFechaInicio, demandaFechaFin, filtroHoraInicio, filtroHoraFin));
  }, [pacientesDB, demandaFechaInicio, demandaFechaFin, filtroHoraInicio, filtroHoraFin]);

  const peakHoursData = useMemo(() => {
    const hours = Array(24).fill(0).map((_, i) => {
      const hStr = i.toString().padStart(2, '0');
      const base = { horaFiltro: hStr, horaTooltip: `${hStr}:00 - ${hStr}:59`, horaCorta: `${hStr}:00`, atenciones: 0 };
      if (modoComparativo) base.periodoB = 0; // Usará global B si lo pide la vista
      docsToCompare.forEach(d => { base[d] = 0; });
      return base;
    });
    
    pacientesDemanda.forEach(p => {
      if (p.tAdmision) {
        const date = new Date(p.tAdmision);
        if (!isNaN(date.getTime())) {
          const h = date.getHours();
          hours[h].atenciones++;
          if (docsToCompare.includes(p.medico)) hours[h][p.medico]++;
        }
      }
    });

    if (modoComparativo) {
      const pacsB = pacientesDB.filter(p => isPatientInWindow(p.tAdmision, filtroFechaInicioB, filtroFechaFinB, filtroHoraInicio, filtroHoraFin));
      pacsB.forEach(p => {
        if (p.tAdmision) {
          const date = new Date(p.tAdmision);
          if (!isNaN(date.getTime())) hours[date.getHours()].periodoB++;
        }
      });
    }

    return hours;
  }, [pacientesDemanda, pacientesDB, filtroFechaInicioB, filtroFechaFinB, modoComparativo, docsToCompare, filtroHoraInicio, filtroHoraFin]);

  return { turnosDemanda, pacientesDemanda, peakHoursData };
};
