import { useMemo } from 'react';
import { getWindowRange, isPatientInWindowRange } from './useMetricoAnalytics';

const isPatientInWindow = (tAdmMs, startDayStr, endDayStr, startHourStr, endHourStr) => {
  if (!tAdmMs) return false;
  const range = getWindowRange(startDayStr, endDayStr, startHourStr, endHourStr);
  return isPatientInWindowRange(tAdmMs, range);
};

export const useMetricoDemanda = (pacientesDB, turnosDB, demandaFechaInicio, demandaFechaFin, modoComparativo, filtroFechaInicioB, filtroFechaFinB, docsToCompare, tipoCorte = 'turno', filtroHoraInicio = '00:00', filtroHoraFin = '23:59', masterMetrics = null) => {
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
    const range = getWindowRange(demandaFechaInicio, demandaFechaFin, filtroHoraInicio, filtroHoraFin);
    if (!range) return [];
    return pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, range));
  }, [pacientesDB, demandaFechaInicio, demandaFechaFin, filtroHoraInicio, filtroHoraFin]);

  const peakHoursData = useMemo(() => {
    const hours = Array(24).fill(0).map((_, i) => {
      const hStr = i.toString().padStart(2, '0');
      const base = { hora: i, horaFiltro: hStr, horaTooltip: `${hStr}:00 - ${hStr}:59`, horaCorta: `${hStr}:00`, atenciones: 0 };
      if (modoComparativo) base.periodoB = 0; // Usará global B si lo pide la vista
      docsToCompare.forEach(d => { base[d] = 0; });
      return base;
    });
    
    if (masterMetrics && masterMetrics.hourlyCurve && masterMetrics.hourlyCurve.length === 24) {
      masterMetrics.hourlyCurve.forEach(item => {
        const h = item.hora;
        if (hours[h]) {
          hours[h].atenciones = item.atenciones;
        }
      });
    } else {
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
    }

    if (modoComparativo) {
      const rangeB = getWindowRange(filtroFechaInicioB, filtroFechaFinB, filtroHoraInicio, filtroHoraFin);
      const pacsB = rangeB ? pacientesDB.filter(p => isPatientInWindowRange(p.tAdmision, rangeB)) : [];
      pacsB.forEach(p => {
        if (p.tAdmision) {
          const date = new Date(p.tAdmision);
          if (!isNaN(date.getTime())) hours[date.getHours()].periodoB++;
        }
      });
    }

    return hours;
  }, [pacientesDemanda, pacientesDB, filtroFechaInicioB, filtroFechaFinB, modoComparativo, docsToCompare, filtroHoraInicio, filtroHoraFin, masterMetrics]);

  return { turnosDemanda, pacientesDemanda, peakHoursData };
};
