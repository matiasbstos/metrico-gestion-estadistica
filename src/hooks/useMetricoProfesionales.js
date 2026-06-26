import { useMemo } from 'react';

const truncateStr = (str, n) => {
  if (!str) return '';
  const safeStr = String(str);
  return safeStr.length > n ? safeStr.substr(0, n - 1) + '...' : safeStr;
};

export const useMetricoProfesionales = (pacientesDB, turnosDB, profFechaInicio, profFechaFin, docsToCompare, searchDoctor) => {
  // =========================================================================
  // 3. PIPELINE DE DATOS PROFESIONALES (Médicos)
  // =========================================================================
  const turnosProf = useMemo(() => {
    return turnosDB.filter(t => {
      if (profFechaInicio && t.fechaInicio < profFechaInicio) return false;
      if (profFechaFin && t.fechaFin > profFechaFin) return false;
      return true;
    });
  }, [turnosDB, profFechaInicio, profFechaFin]);

  const pacientesProf = useMemo(() => {
    const lotes = turnosProf.map(t => t.loteId);
    return pacientesDB.filter(p => lotes.includes(p.loteId));
  }, [pacientesDB, turnosProf]);

  const metricsByDoctor = useMemo(() => {
    const res = {};
    pacientesProf.forEach(p => {
      if (!p.medico) return;
      const med = p.medico;
      if (!res[med]) res[med] = { name: med, shortName: truncateStr(med, 20), total: 0, sumTime: 0, countTime: 0, firstPatient: null, lastPatient: null, lotes: new Set() };
      res[med].total++;
      res[med].lotes.add(p.loteId);
      
      const pTime = p.tAdmision;
      if (pTime) {
         if (!res[med].firstPatient || pTime < res[med].firstPatient) res[med].firstPatient = pTime;
         if (!res[med].lastPatient || pTime > res[med].lastPatient) res[med].lastPatient = pTime;
      }

      if (p.tAnamnesis && p.tAlta) {
        res[med].sumTime += (p.tAlta - p.tAnamnesis) / 60000;
        res[med].countTime++;
      }
    });
    return Object.values(res)
      .map(d => {
         let spanHours = 12; // default if no span
         if (d.firstPatient && d.lastPatient) {
             const spanMs = d.lastPatient - d.firstPatient;
             spanHours = Math.max(1, spanMs / 3600000);
         }
         return { 
           ...d, 
           turnos: d.lotes.size,
           promAtencion: d.countTime ? Math.round(d.sumTime / d.countTime) : 0,
           promHora: parseFloat((d.total / spanHours).toFixed(1))
         };
      }) 
      .sort((a, b) => (b.total || 0) - (a.total || 0));
  }, [pacientesProf]);

  const filteredMetricsByDoctor = useMemo(() => {
    let filtered = metricsByDoctor.filter(m => m.name !== 'No Registrado');
    if (searchDoctor.trim()) filtered = filtered.filter(m => m.name.toLowerCase().includes(searchDoctor.toLowerCase()));
    return filtered;
  }, [metricsByDoctor, docsToCompare, searchDoctor]);

  const dailyDoctorData = useMemo(() => {
    if (docsToCompare.length === 0) return [];
    const daysMap = {};
    
    pacientesProf.forEach(p => {
      if (!p.medico || !docsToCompare.includes(p.medico) || !p.tAdmision) return;
      const date = new Date(p.tAdmision);
      if(isNaN(date.getTime())) return;
      
      const dateStr = date.toISOString().split('T')[0];
      if (!daysMap[dateStr]) {
        daysMap[dateStr] = { date: dateStr };
        docsToCompare.forEach(doc => { daysMap[dateStr][`${doc}_sum`] = 0; daysMap[dateStr][`${doc}_count`] = 0; });
      }
      
      if (p.tAnamnesis && p.tAlta) {
        daysMap[dateStr][`${p.medico}_sum`] += (p.tAlta - p.tAnamnesis) / 60000;
        daysMap[dateStr][`${p.medico}_count`]++;
      }
    });

    return Object.values(daysMap).map(day => {
      const row = { fecha: day.date };
      docsToCompare.forEach(doc => { 
        row[`${doc}_avg`] = day[`${doc}_count`] ? Math.round(day[`${doc}_sum`] / day[`${doc}_count`]) : 0; 
        row[`${doc}_total`] = day[`${doc}_count`] || 0;
      });
      return row;
    }).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  }, [pacientesProf, docsToCompare]);

  return { turnosProf, pacientesProf, metricsByDoctor, filteredMetricsByDoctor, dailyDoctorData };
};
