import React, { useMemo } from 'react';
import { Users, UserX, Clock, Activity, BarChart2, ArrowUpRight } from 'lucide-react';
import { obtenerTurnoDetallado } from '../../utils/helpers';

export default function AnalisisEquiposTurno({ turnosFiltrados, pacientesFiltrados, setActiveTab }) {
  const dataEquipos = useMemo(() => {
    const equipos = {
      'Turno 1': { name: 'Turno 1', totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#10b981' }, // Verde
      'Turno 2': { name: 'Turno 2', totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#facc15' }, // Amarillo
      'Turno 3': { name: 'Turno 3', totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#3b82f6' }, // Azul
      'Turno 4': { name: 'Turno 4', totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#f97316' }, // Naranja
      'Sin Asignar': { name: 'Sin Asignar', totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#94a3b8' } // Gris
    };

    // Mapear cada turno a su clave única de fecha y número de turno
    const turnosMap = {};
    turnosFiltrados.forEach(t => {
      const eq = t.equipoTurno || 'Sin Asignar';
      if (equipos[eq]) {
        equipos[eq].totalPacientes += Number(t.totalPacientes || 0);
        equipos[eq].altasAdmin += Number(t.altasAdmin || 0);
        equipos[eq].totalHoras += String(t.horario || '').includes('17:00') ? 15 : 12;

        const getTurnoNumFromHorario = (horarioStr) => {
          const h = String(horarioStr || '');
          if (h.includes('20:00') || h.includes('Noche')) return 3;
          if (h.includes('17:00') || h.includes('Nocturno')) return 2;
          return 1; // Por defecto Turno 1
        };

        const key = `${t.fechaInicio}|${getTurnoNumFromHorario(t.horario)}`;
        turnosMap[key] = eq;
      }
    });

    // Mapear pacientes a turnos por fecha y turno lógico
    pacientesFiltrados.forEach(p => {
      if (!p.tAdmision) return;
      const det = obtenerTurnoDetallado(p.tAdmision);
      if (!det || !det.fechaTurno) return;
      
      const [d, m, y] = det.fechaTurno.split('/');
      const fechaInicio = `${y}-${m}-${d}`;
      const pKey = `${fechaInicio}|${det.turnoNum}`;
      
      const matchedEq = turnosMap[pKey] || 'Sin Asignar';
      
      if (p.tAdmision && p.tCat1) {
        const diffMin = (p.tCat1 - p.tAdmision) / 60000;
        if (diffMin >= 0 && diffMin < 1440) { 
          equipos[matchedEq].sumEspera += diffMin;
          equipos[matchedEq].countEspera++;
        }
      }
      if (p.tAdmision && p.tAlta) {
        const diffMin = (p.tAlta - p.tAdmision) / 60000;
        if (diffMin >= 0 && diffMin < 2880) { 
          equipos[matchedEq].sumTotal += diffMin;
          equipos[matchedEq].countTotal++;
        }
      }
    });

    return Object.values(equipos).map(e => {
      const pctAltas = e.totalPacientes > 0 ? Number(((e.altasAdmin / e.totalPacientes) * 100).toFixed(1)) : 0;
      const promEspera = e.countEspera > 0 ? Math.round(e.sumEspera / e.countEspera) : 0;
      const promTotal = e.countTotal > 0 ? Math.round(e.sumTotal / e.countTotal) : 0;
      const pacHora = e.totalHoras > 0 ? e.totalPacientes / e.totalHoras : 0;

      return {
        ...e, pctAltas, promEspera, promTotal, pacHora
      };
    });
  }, [turnosFiltrados, pacientesFiltrados]);

  // Totales de participación
  const totalPacientesPeriodo = useMemo(() => {
    return dataEquipos.reduce((acc, e) => acc + e.totalPacientes, 0);
  }, [dataEquipos]);

  // Turno/Equipo con mayor volumen
  const equipoMaxPacientes = useMemo(() => {
    const valid = dataEquipos.filter(e => e.totalPacientes > 0);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.totalPacientes - a.totalPacientes)[0];
  }, [dataEquipos]);

  // Turno individual récord
  const shiftRecord = useMemo(() => {
    if (!turnosFiltrados || turnosFiltrados.length === 0) return null;
    const sorted = [...turnosFiltrados].sort((a, b) => (b.totalPacientes || 0) - (a.totalPacientes || 0));
    return sorted[0] && sorted[0].totalPacientes > 0 ? sorted[0] : null;
  }, [turnosFiltrados]);

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6 shadow-inner theme-transition">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Comparativa de Equipos (Turnos)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Desglose numérico de atenciones, tiempos de respuesta y rendimiento por equipo.</p>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen (1.1, 1.2, 1.3) con enlace al comparativo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          onClick={() => setActiveTab && setActiveTab('comparativo')}
          title="Ver Rendimiento Turno"
          className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition relative group hover:shadow-md hover:border-indigo-500/30 cursor-pointer"
        >
          <div className="absolute top-3 right-3 p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-secondary-custom hover:text-indigo-500 hover:bg-indigo-500/10 transition-all opacity-60 group-hover:opacity-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase opacity-85">Equipo Líder en Volumen</span>
            <div className="text-2xl font-black text-indigo-500 mt-1">
              {equipoMaxPacientes ? equipoMaxPacientes.name : '-'}
            </div>
          </div>
          <p className="text-[10px] text-secondary-custom font-semibold mt-2">
            Registró {equipoMaxPacientes ? equipoMaxPacientes.totalPacientes.toLocaleString() : 0} atenciones en el período.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('comparativo')}
          title="Ver Rendimiento Turno"
          className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition relative group hover:shadow-md hover:border-rose-500/30 cursor-pointer"
        >
          <div className="absolute top-3 right-3 p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-secondary-custom hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-60 group-hover:opacity-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase opacity-85">Turno Récord (Volumen Individual)</span>
            <div className="text-2xl font-black text-rose-500 mt-1">
              {shiftRecord ? `${shiftRecord.totalPacientes} pac.` : '-'}
            </div>
          </div>
          <p className="text-[10px] text-secondary-custom font-semibold mt-2">
            El {shiftRecord ? shiftRecord.fechaInicio.split('-').reverse().join('/') : '-'} {shiftRecord ? `(${String(shiftRecord.horario).includes('Noche') ? 'Noche' : 'Día'})` : ''}.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('comparativo')}
          title="Ver Rendimiento Turno"
          className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition relative group hover:shadow-md hover:border-emerald-500/30 cursor-pointer"
        >
          <div className="absolute top-3 right-3 p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-secondary-custom hover:text-emerald-500 hover:bg-emerald-500/10 transition-all opacity-60 group-hover:opacity-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase opacity-85">T. Espera (Triaje) Global</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">
              {dataEquipos.filter(e => e.countEspera > 0).length > 0
                ? `${Math.round(dataEquipos.reduce((acc, e) => acc + e.sumEspera, 0) / Math.max(1, dataEquipos.reduce((acc, e) => acc + e.countEspera, 0)))} min`
                : '0 min'}
            </div>
          </div>
          <p className="text-[10px] text-secondary-custom font-semibold mt-2">
            Promedio ponderado de clasificación en todos los equipos.
          </p>
        </div>
      </div>

      {/* Grid Comparativo Numérico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dataEquipos.map((e, idx) => {
          const participacion = totalPacientesPeriodo > 0 ? ((e.totalPacientes / totalPacientesPeriodo) * 100).toFixed(1) : '0.0';
          return (
            <div key={idx} className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: e.fill }}></div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-primary-custom uppercase tracking-wider">{e.name}</span>
                  <span className="text-[10px] font-bold text-secondary-custom opacity-70">
                    {e.totalHoras} hrs cob.
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Pacientes y Participación */}
                  <div>
                    <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase block opacity-75">Pacientes Atendidos</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-primary-custom">{e.totalPacientes}</span>
                      <span className="text-[11px] font-bold text-indigo-500">({participacion}% part.)</span>
                    </div>
                  </div>

                  {/* Altas Administrativas */}
                  <div>
                    <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase block opacity-75">Altas Administrativas</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-primary-custom">{e.altasAdmin}</span>
                      <span className="text-[11px] font-bold text-rose-500">({e.pctAltas}% altas)</span>
                    </div>
                  </div>

                  {/* Tiempos Promedio */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-card-custom/25">
                    <div>
                      <span className="text-[8px] font-black text-secondary-custom tracking-wider uppercase block opacity-75">T. Espera (Triaje)</span>
                      <span className="text-xs font-black text-amber-600 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {e.promEspera > 0 ? `${e.promEspera} min` : '0 min'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-secondary-custom tracking-wider uppercase block opacity-75">T. Estadía (Alta)</span>
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Activity className="w-3.5 h-3.5 shrink-0" />
                        {e.promTotal > 0 ? `${e.promTotal} min` : '0 min'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-card-custom/20 flex items-center justify-between text-[9px] font-semibold text-secondary-custom">
                <span>Rendimiento:</span>
                <span className="font-bold text-primary-custom">{e.pacHora.toFixed(1)} pac/hora</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
