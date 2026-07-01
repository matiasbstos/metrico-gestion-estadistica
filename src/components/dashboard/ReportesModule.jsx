import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Calendar, Users, Clock, AlertTriangle } from 'lucide-react';
import { useMetricoAnalytics } from '../../hooks/useMetricoAnalytics';
import { useMetricoProfesionales } from '../../hooks/useMetricoProfesionales';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ReportesModule({ pacientesDB, turnosDB }) {
  const [tipoReporte, setTipoReporte] = useState('mensual'); // diario, semanal, mensual
  const [fechaBase, setFechaBase] = useState(new Date().toISOString().split('T')[0]);

  // Calcular las fechas según el tipo de reporte seleccionado
  const fechas = useMemo(() => {
    let end = new Date(fechaBase);
    if (isNaN(end.getTime())) end = new Date();
    let start = new Date(end);

    if (tipoReporte === 'diario') {
      start = end; // Mismo día
    } else if (tipoReporte === 'semanal') {
      start.setDate(end.getDate() - 6); // 7 días (hoy y 6 atrás)
    } else if (tipoReporte === 'mensual') {
      start.setDate(1); // Primer día del mes
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Último día del mes
    }

    const formatD = (d) => {
      const parts = d.toISOString().split('T')[0].split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };
    return { inicio: formatD(start), fin: formatD(end), rawInicio: start.toISOString().split('T')[0], rawFin: end.toISOString().split('T')[0] };
  }, [fechaBase, tipoReporte]);

  // Extraer KPIs para el reporte
  const { statsKPI, demografiaStats, topDiagnosticos } = useMetricoAnalytics(pacientesDB, turnosDB, fechas.rawInicio, fechas.rawFin);
  const { filteredMetricsByDoctor } = useMetricoProfesionales(pacientesDB, turnosDB, fechas.rawInicio, fechas.rawFin, [], '');

  const equiposReporte = useMemo(() => {
    const turnos = turnosDB.filter(t => t.fechaInicio >= fechas.rawInicio && t.fechaFin <= fechas.rawFin);
    const lotes = turnos.map(t => t.loteId);
    const pacs = pacientesDB.filter(p => lotes.includes(p.loteId));

    const equipos = {
      'Turno 1': { name: 'Turno 1', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumTotal: 0, countTotal: 0 },
      'Turno 2': { name: 'Turno 2', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumTotal: 0, countTotal: 0 },
      'Turno 3': { name: 'Turno 3', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumTotal: 0, countTotal: 0 }
    };

    turnos.forEach(t => {
      const eq = t.equipoTurno;
      if (equipos[eq]) {
        equipos[eq].lotes.add(t.loteId);
        equipos[eq].totalPacientes += Number(t.totalPacientes || 0);
        equipos[eq].altasAdmin += Number(t.altasAdmin || 0);
        equipos[eq].totalHoras += String(t.horario||'').includes('17:00') ? 15 : 12;
      }
    });

    pacs.forEach(p => {
      let matchedEq = null;
      for (const eq in equipos) { if (equipos[eq].lotes.has(p.loteId)) { matchedEq = eq; break; } }
      if (matchedEq && p.tAdmision && p.tAlta) {
        const diffMin = (p.tAlta - p.tAdmision) / 60000;
        if (diffMin >= 0 && diffMin < 2880) { equipos[matchedEq].sumTotal += diffMin; equipos[matchedEq].countTotal++; }
      }
    });

    return Object.values(equipos).map(e => {
      const pctAltas = e.totalPacientes > 0 ? Number(((e.altasAdmin / e.totalPacientes) * 100).toFixed(1)) : 0;
      const promTotal = e.countTotal > 0 ? Math.round(e.sumTotal / e.countTotal) : 0;
      const pacHora = e.totalHoras > 0 ? e.totalPacientes / e.totalHoras : 0;

      return { ...e, pctAltas, promTotal, pacHora };
    });
  }, [pacientesDB, turnosDB, fechas.rawInicio, fechas.rawFin]);

  const highlightsEquipos = useMemo(() => {
    if (!equiposReporte || equiposReporte.length === 0) return {};
    const validEq = equiposReporte.filter(e => e.totalPacientes > 0);
    if (validEq.length === 0) return {};

    const maxPacientes = [...validEq].sort((a,b) => b.totalPacientes - a.totalPacientes)[0];
    const maxAltas = [...validEq].sort((a,b) => b.pctAltas - a.pctAltas)[0];
    const minEspera = [...validEq].filter(e => e.promTotal > 0).sort((a,b) => a.promTotal - b.promTotal)[0]; // We don't have promEspera here easily, so we just use promTotal

    return [
      maxPacientes ? { title: 'Mayor Volumen de Pacientes', eq: maxPacientes.name, val: `${maxPacientes.totalPacientes} pac.`, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🏆' } : null,
      maxAltas ? { title: 'Mayor % Altas Admin', eq: maxAltas.name, val: `${maxAltas.pctAltas}%`, color: 'text-rose-600', bg: 'bg-rose-50', icon: '⚠️' } : null,
      minEspera ? { title: 'Menor Estadía Total', eq: minEspera.name, val: `${minEspera.promTotal} min.`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '⭐' } : null
    ].filter(Boolean);
  }, [equiposReporte]);



  const printReport = () => {
    window.print();
  };

  const exportCSV = () => {
    // Basic CSV export logic for the current period patients
    const lotesVisibles = turnosDB.filter(t => t.fechaInicio >= fechas.inicio && t.fechaFin <= fechas.fin).map(t => t.loteId);
    const pacs = pacientesDB.filter(p => lotesVisibles.includes(p.loteId));
    
    if (pacs.length === 0) return alert('No hay datos en este periodo para exportar.');
    
    const headers = ['ID_Lote', 'Edad', 'Sexo', 'Categoria', 'Medico', 'Comuna', 'Nacionalidad', 'Diagnostico_Principal'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + pacs.map(p => `${p.loteId},${p.edad || ''},${p.sexo || ''},${p.categoria || ''},${p.medico || ''},${p.comuna || ''},${p.nacionalidad || ''},"${String(p.diagnosticoPrincipal || p.codigoDiagnostico || '').replace(/"/g, '""')}"`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `metrico_datos_${fechas.inicio}_a_${fechas.fin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = statsKPI && statsKPI.pacientes.current > 0;
  
  const generateNarrative = () => {
    if (!hasData) return "No se registraron atenciones en este periodo.";
    
    let text = `Durante el periodo comprendido entre el ${fechas.inicio} y el ${fechas.fin}, se registró un total de ${statsKPI.pacientes.current} pacientes atendidos. `;
    
    text += `El rendimiento promedio de atención médica se situó en ${statsKPI.pacHora.current.toFixed(1)} pacientes por hora. `;
    
    text += `Por otro lado, el tiempo promedio de estadía por paciente fue de ${Math.round(statsKPI.estadia.current)} minutos. `;

    const topDoc = [...filteredMetricsByDoctor].sort((a,b) => b.total - a.total)[0];
    if (topDoc) {
      text += `El profesional con mayor volumen de pacientes fue ${topDoc.name} con ${topDoc.total} atenciones. `;
    }

    const altasPct = (statsKPI.altasAdmin.current / statsKPI.pacientes.current) * 100;
    if (altasPct > 10) {
      text += `Atención: La tasa de Alta Administrativa fue del ${altasPct.toFixed(1)}%, superando el umbral de alerta del 10%, por lo que se recomienda revisar el protocolo de categorización.`;
    }

    return { text, altasPct };
  };

  const narrativeData = generateNarrative();

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* Controles de Reporte (Ocultos al imprimir) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-700">Generador de Reportes</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={tipoReporte} 
            onChange={(e) => setTipoReporte(e.target.value)}
            className="border-slate-200 border rounded-lg p-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="diario">Informe Diario</option>
            <option value="semanal">Informe Semanal</option>
            <option value="mensual">Informe Mensual</option>
          </select>

          <input 
            type="date" 
            value={fechaBase} 
            onChange={(e) => setFechaBase(e.target.value)}
            className="border-slate-200 border rounded-lg p-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded-lg text-sm transition-colors">
            <Download className="w-4 h-4" /> Exportar Datos CSV
          </button>

          <button onClick={printReport} disabled={!hasData} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-bold rounded-lg text-sm transition-colors shadow-md">
            <Printer className="w-4 h-4" /> Imprimir PDF Ejecutivo
          </button>
        </div>
      </div>

      {/* VISTA PREVIA DEL REPORTE */}
      <div id="reporte-printable" className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 mx-auto w-full max-w-4xl print:w-full print:max-w-none print:mx-auto print:border-none print:shadow-none print:px-8 print:py-4 relative overflow-hidden">
        
        {/* Cabecera del Documento */}
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end print-avoid-break">
          <div className="flex items-center gap-4">
            <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-16 object-contain" />
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">METRICO</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Reporte Ejecutivo de Gestión</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700 capitalize">Tipo: {tipoReporte}</p>
            <p className="text-xs text-slate-500">Periodo: {fechas.inicio} / {fechas.fin}</p>
          </div>
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay registros para las fechas seleccionadas.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Resumen Narrativo */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 print-avoid-break">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Resumen Ejecutivo Automático
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed text-justify">
                {narrativeData.text}
              </p>
            </div>

            {/* KPIs Principales */}
            <div className="print-avoid-break">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Indicadores Clave de Desempeño (KPI)</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="border border-slate-200 p-4 rounded-lg text-center relative overflow-hidden">
                  <p className="text-xs font-bold text-slate-500 uppercase">Volumen Pacientes</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{statsKPI.pacientes.current}</p>
                  {statsKPI.pacientes.growth !== undefined && (
                    <p className={`text-[10px] font-bold mt-1 ${statsKPI.pacientes.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {statsKPI.pacientes.growth > 0 ? '+' : ''}{statsKPI.pacientes.growth.toFixed(1)}% vs ant.
                    </p>
                  )}
                </div>
                <div className="border border-slate-200 p-4 rounded-lg text-center relative overflow-hidden">
                  <p className="text-xs font-bold text-slate-500 uppercase">Rendimiento</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{statsKPI.pacHora.current.toFixed(1)} <span className="text-xs font-bold">pac/h</span></p>
                  {statsKPI.pacHora.growth !== undefined && (
                    <p className={`text-[10px] font-bold mt-1 ${statsKPI.pacHora.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {statsKPI.pacHora.growth > 0 ? '+' : ''}{statsKPI.pacHora.growth.toFixed(1)}% vs ant.
                    </p>
                  )}
                </div>
                <div className="border border-slate-200 p-4 rounded-lg text-center relative overflow-hidden">
                  <p className="text-xs font-bold text-slate-500 uppercase">T. Estadía Prom.</p>
                  <p className="text-2xl font-black mt-1 text-slate-700">{Math.round(statsKPI.estadia.current)} <span className="text-xs font-bold">min</span></p>
                  {statsKPI.estadia.growth !== undefined && (
                    <p className={`text-[10px] font-bold mt-1 ${statsKPI.estadia.growth < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {statsKPI.estadia.growth > 0 ? '+' : ''}{statsKPI.estadia.growth.toFixed(1)}% vs ant.
                    </p>
                  )}
                </div>
                <div className={`border p-4 rounded-lg text-center relative overflow-hidden ${narrativeData.altasPct > 10 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className={`text-xs font-bold uppercase ${narrativeData.altasPct > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>Altas Administrativas</p>
                  <p className={`text-2xl font-black mt-1 ${narrativeData.altasPct > 10 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {statsKPI.altasAdmin.current} <span className="text-xs font-bold">({narrativeData.altasPct.toFixed(1)}%)</span>
                  </p>
                  <p className={`text-[10px] font-bold mt-1 ${narrativeData.altasPct > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {narrativeData.altasPct > 10 ? 'Fuera de rango (>10%)' : 'Dentro del rango (<10%)'}
                  </p>
                  {statsKPI.altasAdmin.growth !== undefined && (
                    <p className={`text-[10px] font-bold mt-0.5 ${statsKPI.altasAdmin.growth > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {statsKPI.altasAdmin.growth > 0 ? '+' : ''}{statsKPI.altasAdmin.growth.toFixed(1)}% vs ant.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Datos Demográficos Resumidos */}
            <div className="print:break-before-page">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Perfil Demográfico y Operativo</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Previsión Mayoritaria (Top 5)</p>
                  <ul className="text-sm text-slate-600">
                    {Object.entries(demografiaStats.prevs).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                      <li key={i} className="flex justify-between border-b border-slate-100 py-1 last:border-0">
                        <span>{p[0]}</span><span className="font-bold">{p[1]} pac.</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Nacionalidades (Top 5)</p>
                  <ul className="text-sm text-slate-600">
                    {Object.entries(demografiaStats.nacionalidades).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                      <li key={i} className="flex justify-between border-b border-slate-100 py-1 last:border-0">
                        <span className="truncate pr-2">{p[0]}</span><span className="font-bold">{p[1]} pac.</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Centros / Establecimientos (Top 5)</p>
                  <ul className="text-sm text-slate-600">
                    {Object.entries(demografiaStats.establecimientos).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                      <li key={i} className="flex justify-between border-b border-slate-100 py-1 last:border-0">
                        <span className="truncate pr-2">{p[0]}</span><span className="font-bold">{p[1]} pac.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Rendimiento Médico Top 5 */}
            <div className="print-avoid-break">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Top 5 Profesionales (Volumen)</h3>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="p-2 border border-slate-200">Médico</th>
                    <th className="p-2 border border-slate-200 text-center">Pacientes Atendidos</th>
                    <th className="p-2 border border-slate-200 text-center">Rendimiento (Pac/Hora)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredMetricsByDoctor].sort((a,b) => b.total - a.total).slice(0, 5).map(doc => (
                    <tr key={doc.name}>
                      <td className="p-2 border border-slate-200 font-medium text-slate-700">{doc.name}</td>
                      <td className="p-2 border border-slate-200 text-center font-bold text-blue-600">{doc.total}</td>
                      <td className="p-2 border border-slate-200 text-center font-bold text-emerald-600">{doc.promHora}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Evaluación de Equipos */}
            {highlightsEquipos.length > 0 && (
              <div className="print-avoid-break mt-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Desempeño Destacado por Equipo</h3>
                <div className="grid grid-cols-3 gap-4">
                  {highlightsEquipos.map((h, i) => (
                    <div key={i} className={`border p-4 rounded-lg flex flex-col items-center justify-center text-center ${h.bg} border-white/50`}>
                      <span className="text-2xl mb-1">{h.icon}</span>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h.title}</p>
                      <p className={`text-lg font-black mt-1 ${h.color}`}>{h.eq}</p>
                      <p className="text-xs font-bold text-slate-600">{h.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Diagnósticos */}
            {topDiagnosticos && topDiagnosticos.length > 0 && (
              <div className="print-avoid-break mt-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Top 10 Diagnósticos Principales</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={topDiagnosticos}
                      margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        width={120}
                        tick={{fill: '#64748b', fontSize: 9, fontWeight: 'bold'}} 
                      />
                      <Bar dataKey="count" fill="#fb7185" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
