import React, { useMemo } from 'react';
import { Users, UserX, Clock, Activity, BarChart2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { obtenerTurnoDetallado, resolverEquipoTurno, isAltaAdmin } from '../../utils/helpers';

export default function AnalisisEquiposTurno({ turnosFiltrados, pacientesFiltrados, setActiveTab, pautasDB }) {
  const dataEquipos = useMemo(() => {
    const equipos = {
      'Turno 1': { name: 'Turno 1', totalPacientes: 0, atendidos: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#10b981' }, // Verde
      'Turno 2': { name: 'Turno 2', totalPacientes: 0, atendidos: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#facc15' }, // Amarillo
      'Turno 3': { name: 'Turno 3', totalPacientes: 0, atendidos: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#3b82f6' }  // Azul
    };

    // 1. Mapear directamente la totalidad de pacientes admitidos
    (pacientesFiltrados || []).forEach(p => {
      if (!p.tAdmision) return;
      const det = obtenerTurnoDetallado(p.tAdmision, pautasDB);
      if (!det || !det.fechaTurno) return;
      
      const [d, m, y] = det.fechaTurno.split('/');
      const fechaInicio = `${y}-${m}-${d}`;
      
      const eq = resolverEquipoTurno(fechaInicio, det.horario, pautasDB, p.equipo || p.equipoTurno);
      if (eq && !equipos[eq] && (eq.includes('4') || eq === 'Turno 4')) {
        equipos['Turno 4'] = { name: 'Turno 4', totalPacientes: 0, atendidos: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#f97316' };
      }

      const targetEq = equipos[eq] || equipos['Turno 1'];

      targetEq.totalPacientes++;
      if (isAltaAdmin(p)) {
        targetEq.altasAdmin++;
      } else {
        targetEq.atendidos++;
      }

      if (p.tAdmision && p.tCat1) {
        const diffMin = (p.tCat1 - p.tAdmision) / 60000;
        if (diffMin >= 0 && diffMin < 1440) { 
          targetEq.sumEspera += diffMin;
          targetEq.countEspera++;
        }
      }
      if (p.tAdmision && p.tAlta) {
        const diffMin = (p.tAlta - p.tAdmision) / 60000;
        if (diffMin >= 0 && diffMin < 2880) { 
          targetEq.sumTotal += diffMin;
          targetEq.countTotal++;
        }
      }
    });

    // 2. Sumar horas de cobertura trabajadas por cada equipo
    (turnosFiltrados || []).forEach(t => {
      const eq = resolverEquipoTurno(t.fechaInicio, t.horario, pautasDB, t.equipoTurno);
      if (equipos[eq]) {
        equipos[eq].totalHoras += String(t.horario || '').includes('17:00') ? 15 : 12;
      }
    });

    return Object.values(equipos).map(e => {
      const pctAltas = e.totalPacientes > 0 ? Number(((e.altasAdmin / e.totalPacientes) * 100).toFixed(1)) : 0;
      const promEspera = e.countEspera > 0 ? Math.round(e.sumEspera / e.countEspera) : 0;
      const promTotal = e.countTotal > 0 ? Math.round(e.sumTotal / e.countTotal) : 0;
      const pacHora = e.totalHoras > 0 ? Number((e.totalPacientes / e.totalHoras).toFixed(1)) : (e.totalPacientes > 0 ? Number((e.totalPacientes / 12).toFixed(1)) : 0);

      return {
        ...e, pctAltas, promEspera, promTotal, pacHora
      };
    });
  }, [turnosFiltrados, pacientesFiltrados, pautasDB]);

  // Lista de equipos visibles (oculta Turno 4 si no tiene pacientes)
  const displayedEquipos = useMemo(() => {
    return dataEquipos.filter(e => e.totalPacientes > 0 || ['Turno 1', 'Turno 2', 'Turno 3'].includes(e.name));
  }, [dataEquipos]);

  // Totales de participación
  const totalPacientesPeriodo = useMemo(() => {
    return displayedEquipos.reduce((acc, e) => acc + e.totalPacientes, 0);
  }, [displayedEquipos]);

  const totalAtendidosPeriodo = useMemo(() => {
    return displayedEquipos.reduce((acc, e) => acc + e.atendidos, 0);
  }, [displayedEquipos]);

  const totalAltasPeriodo = useMemo(() => {
    return displayedEquipos.reduce((acc, e) => acc + e.altasAdmin, 0);
  }, [displayedEquipos]);

  // Turno/Equipo con mayor volumen
  const equipoMaxPacientes = useMemo(() => {
    const valid = displayedEquipos.filter(e => e.totalPacientes > 0);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.totalPacientes - a.totalPacientes)[0];
  }, [displayedEquipos]);

  // Turno individual récord
  const shiftRecord = useMemo(() => {
    if (!turnosFiltrados || turnosFiltrados.length === 0) return null;
    const sorted = [...turnosFiltrados].sort((a, b) => (b.totalPacientes || 0) - (a.totalPacientes || 0));
    return sorted[0] && sorted[0].totalPacientes > 0 ? sorted[0] : null;
  }, [turnosFiltrados]);

  return (
    <div className="bg-card-custom p-6 rounded-2xl border border-card-custom mt-6 shadow-inner theme-transition">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-primary-custom">Comparativa de Equipos (Turnos)</h2>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Asignación Activa
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-0.5">
              Desglose asistencial de admisiones, atenciones, tiempos de respuesta y rendimiento por equipo rotativo.
            </p>
          </div>
        </div>

        {/* Resumen de Cuadre de Cifras */}
        <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-3.5 py-1.5 rounded-xl border border-card-custom text-xs font-bold">
          <span className="text-secondary-custom">Admitidos: <strong className="text-primary-custom">{totalPacientesPeriodo.toLocaleString()}</strong></span>
          <span className="text-secondary-custom">•</span>
          <span className="text-secondary-custom">Atendidos: <strong className="text-emerald-600 dark:text-emerald-400">{totalAtendidosPeriodo.toLocaleString()}</strong></span>
          <span className="text-secondary-custom">•</span>
          <span className="text-secondary-custom">Altas Admin: <strong className="text-rose-500">{totalAltasPeriodo.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
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
              {displayedEquipos.filter(e => e.countEspera > 0).length > 0
                ? `${Math.round(displayedEquipos.reduce((acc, e) => acc + e.sumEspera, 0) / Math.max(1, displayedEquipos.reduce((acc, e) => acc + e.countEspera, 0)))} min`
                : '0 min'}
            </div>
          </div>
          <p className="text-[10px] text-secondary-custom font-semibold mt-2">
            Promedio ponderado de clasificación en todos los equipos.
          </p>
        </div>
      </div>

      {/* Grid Comparativo Numérico de los Equipos de la Pauta */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${displayedEquipos.length} gap-4`}>
        {displayedEquipos.map((e, idx) => {
          const participacion = totalPacientesPeriodo > 0 ? ((e.totalPacientes / totalPacientesPeriodo) * 100).toFixed(1) : '0.0';
          return (
            <div key={idx} className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: e.fill }}></div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-primary-custom uppercase tracking-wider">{e.name}</span>
                  <span className="text-[10px] font-bold text-secondary-custom opacity-70">
                    {e.totalHoras > 0 ? `${e.totalHoras} hrs cob.` : 'Pauta Activa'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Pacientes Admitidos y Atendidos */}
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase opacity-75">Pacientes Admitidos</span>
                      <span className="text-[10px] font-bold text-indigo-500">({participacion}% part.)</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary-custom">{e.totalPacientes.toLocaleString()}</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">({e.atendidos.toLocaleString()} atendidos)</span>
                    </div>
                  </div>

                  {/* Altas Administrativas */}
                  <div>
                    <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase block opacity-75">Altas Administrativas</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-primary-custom">{e.altasAdmin.toLocaleString()}</span>
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
