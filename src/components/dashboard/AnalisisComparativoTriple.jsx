import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Clock, Activity, AlertTriangle, Hospital, UserCheck, Users, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalisisComparativoTriple({ 
  pacientesDB, 
  turnosDB, 
  setFiltroFechaInicio, 
  setFiltroFechaFin, 
  setActiveTab 
}) {
  const subtractDays = (dateStr, days) => {
    const d = new Date(dateStr + "T12:00:00"); 
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];
  const [fechaA, setFechaA] = useState(today);
  const [fechaB, setFechaB] = useState(subtractDays(today, 7));
  const [fechaC, setFechaC] = useState(subtractDays(today, 364));

  const datesToCompare = [
    { label: 'Jornada Principal (Periodo A)', date: fechaA, setter: setFechaA, short: 'Periodo A', color: '#3b82f6' },
    { label: 'Jornada Comparativa (Periodo B)', date: fechaB, setter: setFechaB, short: 'Periodo B', color: '#8b5cf6' },
    { label: 'Jornada Histórica (Periodo C)', date: fechaC, setter: setFechaC, short: 'Periodo C', color: '#10b981' }
  ];

  const metrics = useMemo(() => {
    const getStatsForDate = (date) => {
      const turnosDelDia = turnosDB.filter(t => t.fechaInicio === date);
      
      const pacs = pacientesDB.filter(p => {
        if (!p.tAdmision) return false;
        const pDate = new Date(p.tAdmision).toISOString().split('T')[0];
        return pDate === date;
      });

      let total = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
      let altas = 0, traslados = 0, constataciones = 0;
      let sumEspera = 0, countEspera = 0;
      let sumEstadia = 0, countEstadia = 0;
      
      const medicosSet = new Set();
      const centrosMap = {};

      // Calcular a nivel de paciente si existen registros
      pacs.forEach(p => {
        const c = String(p.categoria || p.catPrimera || 'sincat').toLowerCase();
        if (c.includes('c1')) c1++;
        else if (c.includes('c2')) c2++;
        else if (c.includes('c3')) c3++;
        else if (c.includes('c4')) c4++;
        else if (c.includes('c5')) c5++;
        
        if (p.estado === 'Cancelada') altas++;
        
        const d = String(p.destinoAlta || p.destino || '').toLowerCase();
        if (d.includes('hospital') || d.includes('emergencia') || d.includes('derivac')) {
          traslados++;
        }
        
        if (p.categoria === 'c3_z518') {
          constataciones++;
        } else {
          const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
          const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
          if (cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC')) {
            constataciones++;
          }
        }

        if (p.medico && p.medico !== 'No Registrado' && p.medico !== 'UNDEFINED' && p.medico.trim() !== '') {
          medicosSet.add(p.medico.trim());
        }

        if (p.establecimiento && p.establecimiento !== 'DESCONOCIDO' && p.establecimiento !== 'UNDEFINED' && p.establecimiento.trim() !== '') {
          const cName = p.establecimiento.trim().toUpperCase();
          centrosMap[cName] = (centrosMap[cName] || 0) + 1;
        }

        if (p.tAdmision && p.tCat1 && p.tCat1 >= p.tAdmision) {
          const diffMin = (p.tCat1 - p.tAdmision) / 60000;
          if (diffMin < 1440) {
            sumEspera += diffMin;
            countEspera++;
          }
        }
        
        if (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) {
          const diffMin = (p.tAlta - p.tAdmision) / 60000;
          if (diffMin < 2880) {
            sumEstadia += diffMin;
            countEstadia++;
          }
        }
      });

      // Si no hay pacientes cargados locales para ese día, usar los turnos agregados del día
      if (pacs.length === 0 && turnosDelDia.length > 0) {
        turnosDelDia.forEach(t => {
          total += Number(t.totalPacientes || 0);
          c1 += Number(t.c1 || 0);
          c2 += Number(t.c2 || 0);
          c3 += Number(t.c3 || 0) + Number(t.c3_z518 || 0);
          c4 += Number(t.c4 || 0);
          c5 += Number(t.c5 || 0);
          altas += Number(t.altasAdmin || 0);
          traslados += Number(t.trasladosCount || 0);
          constataciones += Number(t.constatacionesCount || 0);
        });
      } else {
        total = pacs.length;
      }

      const promEspera = countEspera > 0 ? Math.round(sumEspera / countEspera) : 0;
      const promEstadia = countEstadia > 0 ? Math.round(sumEstadia / countEstadia) : 0;
      
      const medicosActivos = medicosSet.size;
      const pacPorMedico = medicosActivos > 0 ? (pacs.length / medicosActivos).toFixed(1) : 0;

      // Encontrar centro principal
      let topCentro = '-';
      let topCentroPct = 0;
      const centrosEntries = Object.entries(centrosMap);
      if (centrosEntries.length > 0) {
        centrosEntries.sort((a, b) => b[1] - a[1]);
        topCentro = centrosEntries[0][0];
        topCentroPct = (centrosEntries[0][1] / pacs.length) * 100;
      }

      return { 
        total, c1, c2, c3, c4, c5, altas, traslados, constataciones, 
        promEspera, promEstadia, medicosActivos, pacPorMedico, topCentro, topCentroPct 
      };
    };

    const res = {};
    datesToCompare.forEach(d => {
      res[d.date] = getStatsForDate(d.date);
    });
    return res;
  }, [fechaA, fechaB, fechaC, turnosDB, pacientesDB]);

  const chartData = [
    { name: 'C1', [datesToCompare[2].short]: metrics[fechaC].c1, [datesToCompare[1].short]: metrics[fechaB].c1, [datesToCompare[0].short]: metrics[fechaA].c1 },
    { name: 'C2', [datesToCompare[2].short]: metrics[fechaC].c2, [datesToCompare[1].short]: metrics[fechaB].c2, [datesToCompare[0].short]: metrics[fechaA].c2 },
    { name: 'C3', [datesToCompare[2].short]: metrics[fechaC].c3, [datesToCompare[1].short]: metrics[fechaB].c3, [datesToCompare[0].short]: metrics[fechaA].c3 },
    { name: 'C4', [datesToCompare[2].short]: metrics[fechaC].c4, [datesToCompare[1].short]: metrics[fechaB].c4, [datesToCompare[0].short]: metrics[fechaA].c4 },
    { name: 'C5', [datesToCompare[2].short]: metrics[fechaC].c5, [datesToCompare[1].short]: metrics[fechaB].c5, [datesToCompare[0].short]: metrics[fechaA].c5 },
  ];

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-rose-500 animate-pulse" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-emerald-500 animate-pulse" />;
    return <Minus className="w-4 h-4 text-secondary-custom opacity-70" />;
  };

  const getPercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const diff = current - previous;
    const perc = (diff / previous) * 100;
    return `${perc > 0 ? '+' : ''}${perc.toFixed(1)}%`;
  };

  const handleCardClick = (date) => {
    if (setFiltroFechaInicio && setFiltroFechaFin && setActiveTab) {
      setFiltroFechaInicio(date);
      setFiltroFechaFin(date);
      setActiveTab('resumen');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full px-2 md:px-6 pb-8 theme-transition">
      {/* Header y Descripcion */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 rounded-3xl shadow-sm border border-card-custom">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary-custom">Rendimiento de Turnos - Análisis Comparativo</h2>
            <p className="text-xs text-secondary-custom font-semibold mt-0.5">
              Cruza y compara el rendimiento operativo de los turnos, volumen de atenciones, tiempos de espera y clasificación clínica entre tres jornadas independientes seleccionadas.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Periodos Comparativos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {datesToCompare.map((d, i) => {
          const stats = metrics[d.date];
          const prevStats = i === 0 ? metrics[datesToCompare[1].date] : i === 1 ? metrics[datesToCompare[2].date] : null;
          const pctAltas = stats.total > 0 ? ((stats.altas / stats.total) * 100).toFixed(1) : '0.0';

          return (
            <div 
              key={d.date} 
              className="bg-card-custom rounded-[2rem] shadow-sm border-t-4 p-6 md:p-7 relative overflow-hidden border border-card-custom hover:shadow-xl transition-all duration-300 flex flex-col justify-between" 
              style={{ borderTopColor: d.color }}
            >
              <div>
                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-secondary-custom uppercase tracking-widest">{d.label}</h3>
                  <button
                    onClick={() => handleCardClick(d.date)}
                    className="flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-600 bg-indigo-500/5 hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    title="Ir al detalle de este turno"
                  >
                    Detalle <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Selector de fecha */}
                <input 
                  type="date" 
                  value={d.date} 
                  onChange={(e) => d.setter(e.target.value)}
                  className="w-full border-2 rounded-xl p-2.5 text-sm font-black text-primary-custom outline-none focus:border-indigo-500 mb-6 bg-input-custom transition-all cursor-pointer shadow-sm"
                  style={{ borderColor: `${d.color}35` }}
                />
                
                {/* SECCIÓN 1: DEMANDA Y COMPLEJIDAD */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">Demanda & Complejidad</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-secondary-custom uppercase block">Volumen Total</span>
                      <p className="text-3xl font-black text-primary-custom leading-none mt-1">
                        {stats.total} <span className="text-xs font-bold text-secondary-custom">pac.</span>
                      </p>
                    </div>
                    {prevStats && (
                      <div className={`flex items-center gap-0.5 text-xs font-black px-2.5 py-1 rounded-lg ${stats.total < prevStats.total ? 'bg-rose-500/10 text-rose-500' : stats.total > prevStats.total ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-secondary-custom'}`}>
                        {getTrendIcon(stats.total, prevStats.total)}
                        <span className="ml-0.5">{getPercentChange(stats.total, prevStats.total)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-card-custom/10 text-xs">
                    <span className="font-bold text-secondary-custom">Complejidad Alta (C1 + C2)</span>
                    <span className="font-black text-primary-custom">
                      {stats.c1 + stats.c2} ({stats.total > 0 ? (((stats.c1 + stats.c2) / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>

                {/* SECCIÓN 2: TIEMPOS PROMEDIO */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">Tiempos de Atención</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-card-custom rounded-xl p-3 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[8px] font-black text-secondary-custom uppercase tracking-wider block">T. Espera (Triaje)</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1 mt-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {stats.promEspera > 0 ? `${stats.promEspera} min` : '0 min'}
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-xl p-3 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[8px] font-black text-secondary-custom uppercase tracking-wider block">T. Estadía (Alta)</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-500 flex items-center justify-center gap-1 mt-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        {stats.promEstadia > 0 ? `${stats.promEstadia} min` : '0 min'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: RENDIMIENTO Y RECURSOS */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">Recursos & Rendimiento</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-card-custom rounded-xl p-3 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[8px] font-black text-secondary-custom uppercase tracking-wider block">Médicos Activos</span>
                      <span className="text-sm font-black text-indigo-500 flex items-center justify-center gap-1 mt-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        {stats.medicosActivos > 0 ? `${stats.medicosActivos}` : '-'}
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-xl p-3 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[8px] font-black text-secondary-custom uppercase tracking-wider block">Atenciones / Médico</span>
                      <span className="text-sm font-black text-indigo-500 flex items-center justify-center gap-1 mt-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {stats.pacPorMedico > 0 ? `${stats.pacPorMedico}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 4: DESENLACES ESPECIALES */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">Desenlaces Especiales</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-card-custom rounded-xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">Altas Admin</span>
                      <span className="text-xs font-black text-rose-500 block mt-1">
                        {stats.altas} ({pctAltas}%)
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">Traslados</span>
                      <span className="text-xs font-black text-violet-500 block mt-1">
                        {stats.traslados} pac.
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">Constat.</span>
                      <span className="text-xs font-black text-teal-600 dark:text-teal-500 block mt-1">
                        {stats.constataciones} pac.
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 5: CENTRO DE ORIGEN PRINCIPAL */}
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">Principal CESFAM de Origen</span>
                  <div className="flex justify-between items-center text-xs font-bold text-secondary-custom mt-2">
                    <span className="truncate max-w-[170px]" title={stats.topCentro}>{stats.topCentro}</span>
                    <span className="font-black text-primary-custom">{stats.topCentroPct > 0 ? `${stats.topCentroPct.toFixed(0)}%` : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Categorías de Triaje (Mantenidas al final con estilo premium) */}
              <div className="space-y-2 border-t border-card-custom/20 pt-4 mt-6">
                <span className="text-[9px] font-black text-secondary-custom uppercase tracking-widest block mb-1">Detalle de Categorización</span>
                {[
                  { key: 'c1', color: 'bg-red-500' },
                  { key: 'c2', color: 'bg-orange-500' },
                  { key: 'c3', color: 'bg-yellow-500' },
                  { key: 'c4', color: 'bg-emerald-500' },
                  { key: 'c5', color: 'bg-blue-500' }
                ].map(cat => (
                  <div key={cat.key} className="flex items-center justify-between border-b border-card-custom/10 pb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                      <span className="font-bold text-secondary-custom uppercase">{cat.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-primary-custom">{stats[cat.key]}</span>
                      {prevStats && (
                        <span className={`text-[9px] font-bold w-12 text-right ${stats[cat.key] < prevStats[cat.key] ? 'text-rose-400' : stats[cat.key] > prevStats[cat.key] ? 'text-emerald-400' : 'text-secondary-custom opacity-55'}`}>
                          {getPercentChange(stats[cat.key], prevStats[cat.key])}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de Barras Comparativo */}
      <div className="bg-card-custom p-6 rounded-[2rem] shadow-sm border border-card-custom">
        <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider mb-6">Comparación Gráfica de Clasificación (Triaje)</h3>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
              <Bar dataKey={datesToCompare[2].short} name="Periodo C (Histórico)" fill={datesToCompare[2].color} radius={[6, 6, 0, 0]} />
              <Bar dataKey={datesToCompare[1].short} name="Periodo B (Comparativo)" fill={datesToCompare[1].color} radius={[6, 6, 0, 0]} />
              <Bar dataKey={datesToCompare[0].short} name="Periodo A (Principal)" fill={datesToCompare[0].color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
