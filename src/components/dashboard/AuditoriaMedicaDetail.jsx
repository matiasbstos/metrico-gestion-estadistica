import React, { useState, useMemo } from 'react';
import { 
  Users, Award, Calendar, Clock, Download, Search, 
  Activity, FileText, UserCheck, Stethoscope, AlertCircle
} from 'lucide-react';
import InfoTooltip from '../InfoTooltip';

const TRIAGE_COLORS = {
  C1: '#ef4444',
  C2: '#f97316',
  C3: '#eab308',
  'C3 (L)': '#b45309',
  C4: '#10b981',
  C5: '#3b82f6',
  'Sin Categorizar': '#94a3b8'
};

const TEAM_TEXT_COLORS = {
  'Turno 1': 'text-emerald-500',
  'Turno 2': 'text-yellow-600 dark:text-yellow-400',
  'Turno 3': 'text-blue-500',
  'Turno 4': 'text-orange-500',
  'Sin Asignar': 'text-slate-400'
};

// Helper: calcula los límites del turno y su duración
function getShiftWindow(turno) {
  if (!turno || !turno.fechaInicio) return { startMs: 0, endMs: 0, hours: 12 };
  const [y, m, d] = turno.fechaInicio.split('-').map(Number);
  let startMs, endMs, hours = 12;
  
  if (String(turno.horario).includes("17:00")) {
    // Turno largo de semana (17:00 a 08:00 del día siguiente)
    startMs = new Date(y, m - 1, d, 17, 0, 0).getTime();
    const nextDay = new Date(y, m - 1, d + 1);
    endMs = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 8, 0, 0).getTime();
    hours = 15;
  } else if (String(turno.horario).includes("08:00")) {
    // Turno diurno (08:00 a 20:00 del mismo día)
    startMs = new Date(y, m - 1, d, 8, 0, 0).getTime();
    endMs = new Date(y, m - 1, d, 20, 0, 0).getTime();
    hours = 12;
  } else {
    // Turno nocturno (20:00 a 08:00 del día siguiente)
    startMs = new Date(y, m - 1, d, 20, 0, 0).getTime();
    const nextDay = new Date(y, m - 1, d + 1);
    endMs = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 8, 0, 0).getTime();
    hours = 12;
  }
  return { startMs, endMs, hours };
}

export default function AuditoriaMedicaDetail({ pacientesDB, turnosDB }) {
  const [activeSubTab, setActiveSubTab] = useState('turno'); // 'turno' o 'medico'
  
  // Estados para consulta por Turno
  const [selectedTurnoId, setSelectedTurnoId] = useState('');
  
  // Estados para consulta por Médico
  const [searchDoctorText, setSearchDoctorText] = useState('');
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  
  // 1. Obtener lista de turnos ordenados cronológicamente a la inversa
  const sortedTurnos = useMemo(() => {
    if (!turnosDB) return [];
    return [...turnosDB].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio) || b.horario.localeCompare(a.horario));
  }, [turnosDB]);

  // Inicializar el primer turno si no hay ninguno seleccionado
  React.useEffect(() => {
    if (sortedTurnos.length > 0 && !selectedTurnoId) {
      setSelectedTurnoId(sortedTurnos[0].id);
    }
  }, [sortedTurnos, selectedTurnoId]);

  // Turno actualmente seleccionado
  const activeTurno = useMemo(() => {
    return sortedTurnos.find(t => t.id === selectedTurnoId) || null;
  }, [selectedTurnoId, sortedTurnos]);

  // Ventana de tiempo del turno seleccionado
  const activeTurnoWindow = useMemo(() => {
    return getShiftWindow(activeTurno);
  }, [activeTurno]);

  // Pacientes atendidos en el turno seleccionado
  const pacientesDelTurno = useMemo(() => {
    if (!pacientesDB || !activeTurnoWindow.startMs) return [];
    return pacientesDB.filter(p => p.tAdmision >= activeTurnoWindow.startMs && p.tAdmision <= activeTurnoWindow.endMs);
  }, [pacientesDB, activeTurnoWindow]);

  // Desglose de médicos activos en el turno seleccionado
  const medicosDelTurno = useMemo(() => {
    const counts = {};
    pacientesDelTurno.forEach(p => {
      const medName = p.medico || 'No Registrado';
      if (!counts[medName]) {
        counts[medName] = { name: medName, count: 0 };
      }
      counts[medName].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [pacientesDelTurno]);

  // Médico líder del turno
  const medicoLiderDelTurno = useMemo(() => {
    if (medicosDelTurno.length === 0) return null;
    const filterValid = medicosDelTurno.filter(m => m.name !== 'No Registrado');
    return filterValid.length > 0 ? filterValid[0] : medicosDelTurno[0];
  }, [medicosDelTurno]);

  // 2. Obtener lista única de médicos del histórico
  const listadoMedicos = useMemo(() => {
    if (!pacientesDB) return [];
    const setMeds = new Set();
    pacientesDB.forEach(p => {
      if (p.medico && p.medico !== 'No Registrado') {
        setMeds.add(p.medico);
      }
    });
    return Array.from(setMeds).sort();
  }, [pacientesDB]);

  // Autocomplete sugerencias
  const sugerenciasMedicos = useMemo(() => {
    if (!searchDoctorText.trim()) return [];
    return listadoMedicos.filter(m => m.toLowerCase().includes(searchDoctorText.toLowerCase()));
  }, [listadoMedicos, searchDoctorText]);

  // Pacientes atendidos por el médico seleccionado en el histórico
  const pacientesDelMedico = useMemo(() => {
    if (!pacientesDB || !selectedDoctorName) return [];
    return pacientesDB.filter(p => p.medico === selectedDoctorName);
  }, [pacientesDB, selectedDoctorName]);

  // Mapeo e historial de turnos en los que participó el médico
  const historialTurnosMedico = useMemo(() => {
    if (!turnosDB || pacientesDelMedico.length === 0) return [];
    
    // Mapear ventanas de tiempo para todos los turnos disponibles
    const turnosConVentana = turnosDB.map(t => ({
      ...t,
      window: getShiftWindow(t)
    }));

    const participaciones = {}; // keyed by turno.id
    
    pacientesDelMedico.forEach(p => {
      // Buscar a qué turno corresponde
      const match = turnosConVentana.find(t => p.tAdmision >= t.window.startMs && p.tAdmision <= t.window.endMs);
      if (match) {
        if (!participaciones[match.id]) {
          participaciones[match.id] = {
            id: match.id,
            fecha: match.fechaInicio,
            horario: match.horario,
            equipo: match.equipoTurno || 'Sin Asignar',
            totalTurno: match.totalPacientes || 0,
            pacientesMedico: 0,
            horasTurno: match.window.hours
          };
        }
        participaciones[match.id].pacientesMedico++;
      }
    });

    return Object.values(participaciones).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [turnosDB, pacientesDelMedico]);

  // Estadísticas consolidadas del médico
  const statsMedico = useMemo(() => {
    const totalAtendidos = pacientesDelMedico.length;
    const turnosTotales = historialTurnosMedico.length;
    const horasTotales = historialTurnosMedico.reduce((acc, h) => acc + h.horasTurno, 0);
    const promPacHora = horasTotales > 0 ? (totalAtendidos / horasTotales).toFixed(1) : '0';

    // Agrupar diagnósticos más frecuentes
    const diagCounts = {};
    pacientesDelMedico.forEach(p => {
      const diag = p.diagnostico || p.diagnostic || 'Sin Diagnóstico Especificado';
      diagCounts[diag] = (diagCounts[diag] || 0) + 1;
    });

    const topDiags = Object.entries(diagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalAtendidos, turnosTotales, horasTotales, promPacHora, topDiags };
  }, [pacientesDelMedico, historialTurnosMedico]);

  // Exportar pacientes del turno a CSV
  const exportarPacientesTurno = () => {
    if (pacientesDelTurno.length === 0 || !activeTurno) return;
    
    const headers = ["Fecha", "Hora_Admision", "Triage", "Edad", "Genero", "Medico", "Destino_Alta", "Diagnostico"];
    const rows = pacientesDelTurno.map(p => {
      const timeStr = p.tAdmision ? new Date(p.tAdmision).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-';
      return [
        activeTurno.fechaInicio,
        timeStr,
        p.triage || 'Sin categorizar',
        p.edad || '-',
        p.genero || '-',
        p.medico || 'No Registrado',
        p.destinoAlta || 'Sin alta registrada',
        (p.diagnostico || p.diagnostic || 'Sin Especificar').replace(/,/g, ';')
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pacientes_Turno_${activeTurno.fechaInicio}_${activeTurno.horario.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar expediente de médico a CSV
  const exportarExpedienteMedico = () => {
    if (historialTurnosMedico.length === 0 || !selectedDoctorName) return;

    const headers = ["Fecha_Turno", "Horario", "Equipo", "Pacientes_Atendidos_Medico", "Total_Pacientes_Turno", "Horas_Trabajadas"];
    const rows = historialTurnosMedico.map(t => [
      t.fecha,
      t.horario,
      t.equipo,
      t.pacientesMedico,
      t.totalTurno,
      t.horasTurno
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expediente_${selectedDoctorName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto theme-transition pb-12">
      
      {/* Header del Componente */}
      <div className="p-5 rounded-2xl border bg-card-custom border-card-custom shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 theme-transition">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary-custom">Rendimiento Clínico y Profesionales</h2>
            <p className="text-xs font-bold text-secondary-custom opacity-85">Análisis granular de atenciones por médico, cruce de turnos, horas de guardia y diagnósticos</p>
          </div>
        </div>
        
        {/* Selector de Subpestañas */}
        <div className="flex bg-black/5 dark:bg-white/5 border border-card-custom rounded-xl p-1 shadow-sm theme-transition">
          <button 
            onClick={() => setActiveSubTab('turno')} 
            className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${activeSubTab === 'turno' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
          >
            Consulta por Turno
          </button>
          <button 
            onClick={() => setActiveSubTab('medico')} 
            className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${activeSubTab === 'medico' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
          >
            Expediente de Médicos
          </button>
        </div>
      </div>

      {/* SUBPESTAÑA 1: CONSULTA POR TURNO ESPECÍFICO */}
      {activeSubTab === 'turno' && (
        <div className="space-y-6">
          
          {/* Selector de Turno */}
          <div className="bg-card-custom border border-card-custom p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 theme-transition">
            <div className="flex-1 max-w-lg">
              <label className="block text-[10px] font-black uppercase text-secondary-custom tracking-wider mb-2">Seleccionar Turno de Trabajo</label>
              <select 
                value={selectedTurnoId} 
                onChange={e => setSelectedTurnoId(e.target.value)} 
                className="w-full bg-input-custom text-primary-custom text-sm p-3 rounded-xl border border-card-custom outline-none font-bold cursor-pointer"
              >
                {sortedTurnos.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.fechaInicio} — {t.horario.split('(')[0].trim()} ({t.equipoTurno || 'Sin Asignar'})
                  </option>
                ))}
              </select>
            </div>
            
            {activeTurno && (
              <div className="flex gap-2">
                <button 
                  onClick={exportarPacientesTurno} 
                  disabled={pacientesDelTurno.length === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-400 text-white shadow-md transition-all mt-6"
                >
                  <Download className="w-4 h-4" /> Exportar Pacientes (CSV)
                </button>
              </div>
            )}
          </div>

          {activeTurno ? (
            <>
              {/* KPIs del Turno */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Pacientes Totales */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Atenciones en el Turno</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-4xl font-black text-primary-custom">{pacientesDelTurno.length}</span>
                    <span className="text-[10px] text-secondary-custom font-medium opacity-75">Registrados en HIS</span>
                  </div>
                </div>

                {/* Médico Líder */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Médico Líder de Carga</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]" title={medicoLiderDelTurno?.name || '-'}>
                      {medicoLiderDelTurno?.name || '-'}
                    </span>
                    {medicoLiderDelTurno && (
                      <span className="text-xs font-black bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">
                        {medicoLiderDelTurno.count} pac.
                      </span>
                    )}
                  </div>
                </div>

                {/* Duración */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Duración de Jornada</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-4xl font-black text-primary-custom">{activeTurnoWindow.hours} hrs</span>
                    <span className="text-[10px] text-secondary-custom font-medium opacity-75">{activeTurno.horario.split('(')[0]}</span>
                  </div>
                </div>

                {/* Ratio de Carga General */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Ratio de Demanda General</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-4xl font-black text-primary-custom">
                      {(pacientesDelTurno.length / activeTurnoWindow.hours).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-secondary-custom font-medium opacity-75">pacientes / hora</span>
                  </div>
                </div>

              </div>

              {/* Distribución de Carga por Médicos en el Turno */}
              <div className="bg-card-custom border border-card-custom rounded-2xl p-6 shadow-sm theme-transition">
                <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-500" /> Rendimiento de Médicos del Turno
                </h3>
                {medicosDelTurno.length === 0 ? (
                  <p className="text-xs text-center py-6 text-secondary-custom opacity-70">No se detectaron médicos con pacientes asociados en este turno.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicosDelTurno.map(med => {
                      const pctMed = ((med.count / pacientesDelTurno.length) * 100).toFixed(1);
                      return (
                        <div key={med.name} className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-primary-custom truncate max-w-[170px]" title={med.name}>{med.name}</p>
                            <p className="text-[10px] text-secondary-custom mt-0.5 font-bold">Porcentaje de Carga: {pctMed}%</p>
                          </div>
                          <span className="text-xl font-black text-indigo-500">{med.count} <span className="text-[9px] text-secondary-custom font-bold">pac.</span></span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nómina de Pacientes del Turno */}
              <div className="bg-card-custom border border-card-custom rounded-2xl p-6 shadow-sm theme-transition overflow-hidden">
                <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Nómina de Atenciones del Turno
                </h3>
                {pacientesDelTurno.length === 0 ? (
                  <p className="text-xs text-center py-10 text-secondary-custom opacity-70">Sin registros de pacientes asociados a la ventana de tiempo del turno.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-secondary-custom font-bold uppercase text-[10px] tracking-wider border-b border-card-custom">
                          <th className="p-3 pb-2">Hora Admisión</th>
                          <th className="p-3 pb-2 text-center">Triaje</th>
                          <th className="p-3 pb-2 text-center">Edad</th>
                          <th className="p-3 pb-2 text-center">Género</th>
                          <th className="p-3 pb-2">Médico Tratante</th>
                          <th className="p-3 pb-2">Destino Alta</th>
                          <th className="p-3 pb-2 text-right">Diagnóstico</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-card-custom/50">
                        {pacientesDelTurno.map((p, idx) => {
                          const timeStr = p.tAdmision ? new Date(p.tAdmision).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-';
                          const catColor = TRIAGE_COLORS[p.triage] || TRIAGE_COLORS['Sin Categorizar'];
                          
                          return (
                            <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold">
                              <td className="p-3 text-primary-custom font-black flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-secondary-custom opacity-75" />
                                {timeStr}
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2.5 py-0.5 rounded text-[8px] font-black text-white" style={{ backgroundColor: catColor }}>
                                  {p.triage || 'C5'}
                                </span>
                              </td>
                              <td className="p-3 text-center text-primary-custom">{p.edad || '-'}</td>
                              <td className="p-3 text-center text-secondary-custom font-medium uppercase">{p.genero || '-'}</td>
                              <td className="p-3 text-primary-custom font-black">{p.medico || 'No Registrado'}</td>
                              <td className={`p-3 font-bold ${p.destinoAlta === 'Administrativa' ? 'text-red-500' : 'text-emerald-500'}`}>
                                {p.destinoAlta || 'Médica'}
                              </td>
                              <td className="p-3 text-right text-secondary-custom font-medium max-w-[200px] truncate" title={p.diagnostico || p.diagnostic || '-'}>
                                {p.diagnostico || p.diagnostic || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-secondary-custom py-10">Cargando datos del turno...</p>
          )}

        </div>
      )}

      {/* SUBPESTAÑA 2: EXPEDIENTE DE MÉDICOS */}
      {activeSubTab === 'medico' && (
        <div className="space-y-6">
          
          {/* Autocomplete de Médico */}
          <div className="bg-card-custom border border-card-custom p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 theme-transition relative">
            <div className="flex-1 max-w-lg relative">
              <label className="block text-[10px] font-black uppercase text-secondary-custom tracking-wider mb-2">Buscar Médico Tratante</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchDoctorText} 
                  onChange={e => {
                    setSearchDoctorText(e.target.value);
                    if (!e.target.value) setSelectedDoctorName('');
                  }}
                  placeholder="Escribe el nombre del profesional..." 
                  className="w-full bg-input-custom text-primary-custom text-sm p-3 pl-10 rounded-xl border border-card-custom outline-none font-bold"
                />
                <Search className="w-4 h-4 text-secondary-custom absolute left-3.5 top-3.5" />
              </div>

              {sugerenciasMedicos.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-card-custom border border-card-custom rounded-xl shadow-lg z-50">
                  {sugerenciasMedicos.map(med => (
                    <button 
                      key={med}
                      onClick={() => {
                        setSelectedDoctorName(med);
                        setSearchDoctorText(med);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-primary-custom hover:bg-black/5 dark:hover:bg-white/5 border-b border-card-custom/40 last:border-0"
                    >
                      {med}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {selectedDoctorName && (
              <div className="flex gap-2">
                <button 
                  onClick={exportarExpedienteMedico} 
                  disabled={historialTurnosMedico.length === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-400 text-white shadow-md transition-all mt-6"
                >
                  <Download className="w-4 h-4" /> Exportar Expediente (CSV)
                </button>
              </div>
            )}
          </div>

          {selectedDoctorName ? (
            <>
              {/* KPIs del Médico */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Pacientes Totales */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Atenciones Totales</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-4xl font-black text-primary-custom">{statsMedico.totalAtendidos}</span>
                    <span className="text-[10px] text-secondary-custom font-medium opacity-75">Pacientes</span>
                  </div>
                </div>

                {/* Turnos Totales */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Turnos Cubiertos</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-4xl font-black text-primary-custom">{statsMedico.turnosTotales}</span>
                    <span className="text-[10px] text-secondary-custom font-medium opacity-75">Turnos en sistema</span>
                  </div>
                </div>

                {/* Horas de Guardia Totales */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Horas de Guardia Cubiertas</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-4xl font-black text-primary-custom">{statsMedico.horasTotales} hrs</span>
                    <span className="text-[10px] text-secondary-custom font-medium opacity-75">Suma de jornadas</span>
                  </div>
                </div>

                {/* Ratio de Rendimiento */}
                <div className="p-5 rounded-2xl border bg-card-custom border-card-custom flex flex-col justify-between min-h-[120px] shadow-sm hover:z-30 hover:shadow-lg theme-transition">
                  <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Rendimiento Promedio</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-4xl font-black text-primary-custom">{statsMedico.promPacHora}</span>
                    <span className="text-[10px] text-secondary-custom font-medium opacity-75">pacientes / hora</span>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Historial de Turnos */}
                <div className="bg-card-custom border border-card-custom rounded-2xl p-6 shadow-sm theme-transition lg:col-span-2 overflow-hidden">
                  <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" /> Registro de Guardias y Cargas
                  </h3>
                  {historialTurnosMedico.length === 0 ? (
                    <p className="text-xs text-center py-10 text-secondary-custom opacity-70">No se encontraron turnos cruzados para este profesional.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-secondary-custom font-bold uppercase text-[10px] tracking-wider border-b border-card-custom">
                            <th className="p-3 pb-2">Fecha del Turno</th>
                            <th className="p-3 pb-2">Jornada</th>
                            <th className="p-3 pb-2">Equipo</th>
                            <th className="p-3 pb-2 text-center">Horas de Guardia</th>
                            <th className="p-3 pb-2 text-center">Atendidos por Médico</th>
                            <th className="p-3 pb-2 text-right">Carga Total Turno</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-card-custom/50">
                          {historialTurnosMedico.map((t, idx) => (
                            <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold">
                              <td className="p-3 text-primary-custom font-black flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-secondary-custom opacity-70" />
                                {t.fecha}
                              </td>
                              <td className="p-3 text-secondary-custom font-medium">{t.horario.split('(')[0]}</td>
                              <td className={`p-3 uppercase ${TEAM_TEXT_COLORS[t.equipo]}`}>
                                {t.equipo}
                              </td>
                              <td className="p-3 text-center text-primary-custom">{t.horasTurno} hrs</td>
                              <td className="p-3 text-center text-indigo-600 dark:text-indigo-400 font-black text-sm">{t.pacientesMedico}</td>
                              <td className="p-3 text-right text-secondary-custom font-semibold">{t.totalTurno} pacientes</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Top Diagnósticos del Médico */}
                <div className="bg-card-custom border border-card-custom rounded-2xl p-6 shadow-sm theme-transition flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> Diagnósticos Más Recurrentes
                    </h3>
                    {statsMedico.topDiags.length === 0 ? (
                      <p className="text-xs text-center py-10 text-secondary-custom opacity-70">No hay diagnósticos especificados.</p>
                    ) : (
                      <div className="space-y-4">
                        {statsMedico.topDiags.map(diag => {
                          const pctDiag = ((diag.count / statsMedico.totalAtendidos) * 100).toFixed(1);
                          return (
                            <div key={diag.name} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-primary-custom truncate max-w-[180px]" title={diag.name}>{diag.name}</span>
                                <span className="text-secondary-custom">{diag.count} ({pctDiag}%)</span>
                              </div>
                              <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden border border-card-custom/40">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pctDiag}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-3.5 rounded-xl text-[10px] text-secondary-custom mt-6 font-semibold flex gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Muestra las patologías o motivos de consulta más recurrentes ingresados por este médico en Box de urgencias.</span>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="p-12 text-center text-secondary-custom opacity-70 border border-dashed border-card-custom rounded-2xl bg-card-custom">
              <Stethoscope className="w-12 h-12 text-secondary-custom opacity-30 mx-auto mb-3" />
              <p className="text-sm font-bold">Selecciona o busca un profesional de la salud en la caja superior para desplegar su expediente clínico.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
