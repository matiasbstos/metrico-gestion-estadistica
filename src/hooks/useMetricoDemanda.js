import { useMemo } from 'react';

export const useMetricoDemanda = (pacientesDB, turnosDB, demandaFechaInicio, demandaFechaFin, modoComparativo, filtroFechaInicioB, filtroFechaFinB, docsToCompare) => {
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
    const lotes = turnosDemanda.map(t => t.loteId);
    return pacientesDB.filter(p => lotes.includes(p.loteId));
  }, [pacientesDB, turnosDemanda]);

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
      const turnosB = turnosDB.filter(t => t.fechaInicio >= filtroFechaInicioB && t.fechaFin <= filtroFechaFinB);
      const loteIdsB = turnosB.map(t => t.loteId);
      const pacsB = pacientesDB.filter(p => loteIdsB.includes(p.loteId));
      pacsB.forEach(p => {
        if (p.tAdmision) {
          const date = new Date(p.tAdmision);
          if (!isNaN(date.getTime())) hours[date.getHours()].periodoB++;
        }
      });
    }

    return hours;
  }, [pacientesDemanda, turnosDB, pacientesDB, filtroFechaInicioB, filtroFechaFinB, modoComparativo, docsToCompare]);

  return { turnosDemanda, pacientesDemanda, peakHoursData };
};
