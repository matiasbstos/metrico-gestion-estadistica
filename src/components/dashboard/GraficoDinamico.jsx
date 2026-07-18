import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, 
  Line, LineChart, ResponsiveContainer, CartesianGrid, ComposedChart, Area, AreaChart, LabelList 
} from 'recharts';
import { BarChart2, Activity, Users, Shield, Globe, Building2, AlertTriangle } from 'lucide-react';
import { COLORS } from '../../config/constants';
import InfoTooltip from '../InfoTooltip';

const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

export default function GraficoDinamico({
  modoComparativo,
  compareChartData,
  chartData,
  pieData,
  turnosFiltrados,
  demografiaStats
}) {
  const [activeTab, setActiveTab] = React.useState('operacional');

  // Filtros internos - Por defecto activos
  const [opFilters, setOpFilters] = React.useState(['totalPacientes', 'c3', 'altasAdmin']);
  const [timeFilters, setTimeFilters] = React.useState(['tiempoCatAna', 'tiempoAdmCat', 'tiempoAnaAlt', 'tiempoAdmAlt']);

  const isAltasAlert = useMemo(() => {
    if (!turnosFiltrados || turnosFiltrados.length === 0) return false;
    const total = turnosFiltrados.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
    const altas = turnosFiltrados.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
    return total > 0 ? (altas / total) * 100 > 5 : false;
  }, [turnosFiltrados]);

  const toggleFilter = (setFilter, val) => {
    setFilter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const tabs = [
    { id: 'operacional', label: 'Operacional & Triaje', icon: Activity, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'tiempos', label: 'Tiempos de Atención', icon: BarChart2, color: 'text-indigo-500 bg-indigo-500/10' },
    { id: 'demografia', label: 'Demografía', icon: Users, color: 'text-pink-500 bg-pink-500/10' },
    { id: 'prevision', label: 'Previsión Médica', icon: Shield, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'origen', label: 'Origen & Centros', icon: Globe, color: 'text-orange-500 bg-orange-500/10' },
  ];

  // Preparar datos usando demografiaStats para mayor precisión
  const demographicData = useMemo(() => {
    if (!demografiaStats) return { sexo: [], edades: [], prevs: [], centros: [] };
    
    // Sexo
    const sexo = [
      { name: 'Mujeres', value: demografiaStats.sexo.F, color: '#ec4899' },
      { name: 'Hombres', value: demografiaStats.sexo.M, color: '#3b82f6' }
    ].filter(d => d.value > 0);

    // Edades (Formato para BarChart simple)
    const edades = AGE_RANGES.map(r => ({ name: r, value: demografiaStats.edades[r] || 0 })).filter(d => d.value > 0);

    // Previsión
    const fonasaCount = Object.entries(demografiaStats.prevs).filter(([k]) => k.includes('FONASA')).reduce((acc, [_, v]) => acc + v, 0);
    const isapreCount = Object.entries(demografiaStats.prevs).filter(([k]) => k.includes('ISAPRE')).reduce((acc, [_, v]) => acc + v, 0);
    const otrasPrev = demografiaStats.total - fonasaCount - isapreCount;
    
    const prevs = [
      { name: 'FONASA', value: fonasaCount, color: '#10b981' },
      { name: 'ISAPRE', value: isapreCount, color: '#0ea5e9' },
      otrasPrev > 0 ? { name: 'Otras', value: otrasPrev, color: '#94a3b8' } : null
    ].filter(Boolean);

    // Centros (SAR vs CESFAM) con porcentajes
    const totalCentros = Object.values(demografiaStats.establecimientos).reduce((a, b) => a + b, 0);
    const centros = Object.entries(demografiaStats.establecimientos)
      .filter(([_, v]) => v > 0)
      .map(([name, value], i) => ({
        name: name,
        value: value,
        porcentaje: totalCentros > 0 ? ((value / totalCentros) * 100).toFixed(1) : 0,
        color: ['#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e', '#06b6d4'][i % 5]
      }))
      .sort((a, b) => b.value - a.value);

    // Origen
    const nacChilena = Object.entries(demografiaStats.nacionalidades).filter(([k]) => k.includes('CHILEN')).reduce((acc, [_, v]) => acc + v, 0);
    const nacOtra = demografiaStats.total - nacChilena;
    const origen = [
      { name: 'Chilenos', value: nacChilena, color: '#ef4444' },
      { name: 'Extranjeros', value: nacOtra, color: '#06b6d4' }
    ].filter(d => d.value > 0);

    return { sexo, edades, prevs, centros, origen };
  }, [demografiaStats]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card-custom border border-card-custom p-3 rounded-xl shadow-xl font-bold text-xs theme-transition">
          <p className="font-black text-primary-custom mb-2 border-b border-card-custom pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 mb-1">
              <span className="flex items-center gap-1.5 text-secondary-custom">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-black text-primary-custom">
                {entry.value} {entry.payload && entry.payload.porcentaje ? `(${entry.payload.porcentaje}%)` : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalTriageVal = useMemo(() => {
    return pieData ? pieData.reduce((acc, curr) => acc + (curr.value || 0), 0) : 0;
  }, [pieData]);

  return (
    <div className="bg-card-custom rounded-2xl border border-card-custom p-6 mt-6 theme-transition">
      <div className="flex justify-between items-center mb-6 border-b border-card-custom pb-4">
        <div className="flex items-center">
          <BarChart2 className="w-5 h-5 accent-text-custom mr-2" />
          <div>
            <h2 className="text-base font-bold text-primary-custom flex items-center">
              Análisis Automático y Tendencias
              <InfoTooltip title="Análisis Automático" text="Gráficos dinámicos basados en tus filtros. Los datos acumulados se apilan para ver la proporción y evolución de la demanda sin solapes." />
            </h2>
            <p className="text-xs text-secondary-custom font-medium">Exploración visual instantánea de los datos filtrados.</p>
          </div>
        </div>
      </div>

      {!modoComparativo && (
        <div className="flex flex-wrap gap-2 mb-6 border-b border-card-custom pb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                  isActive 
                    ? `accent-bg-custom text-white shadow-sm` 
                    : 'text-secondary-custom hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="w-full min-h-[24rem]">
        {modoComparativo ? (
          <div className="h-80 w-full animate-fade-in">
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={compareChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold'}} />
                <Bar dataKey="Periodo A" fill="#3b82f6" radius={[4,4,0,0]} name="Periodo A" barSize={40} />
                <Bar dataKey="Periodo B" fill="#fbbf24" radius={[4,4,0,0]} name="Periodo B" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full w-full animate-fade-in">
            {chartData.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-secondary-custom">
                <Activity className="w-12 h-12 mb-3 text-secondary-custom opacity-30" />
                <p className="text-sm font-medium">Sin datos para graficar en este periodo</p>
              </div>
            ) : (
              <>
                {/* VISTA 1: OPERACIONAL */}
                {activeTab === 'operacional' && (
                  <div className="flex flex-col gap-4">
                    {isAltasAlert && (
                      <div className="bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 animate-pulse shadow-sm">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 animate-bounce" />
                        <span>Alerta de Gestión: Las Altas Administrativas del período seleccionado superan la meta del 5% del volumen total de pacientes atendidos.</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-card-custom">
                      <span className="text-xs font-bold text-secondary-custom mr-2">Filtros Rápidos:</span>
                      {[
                        { id: 'totalPacientes', label: 'Línea de Volumen Total', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
                        { id: 'c1', label: 'C1', color: 'bg-red-500/10 text-red-500 border border-red-500/20' },
                        { id: 'c2', label: 'C2', color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' },
                        { id: 'c3', label: 'C3', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' },
                        { id: 'c4', label: 'C4', color: 'bg-green-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
                        { id: 'c5', label: 'C5', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
                        { id: 'altasAdmin', label: 'Altas Admin', color: 'bg-red-500/10 text-red-600 border border-red-500/20' }
                      ].map(f => (
                        <button key={f.id} onClick={() => toggleFilter(setOpFilters, f.id)} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${opFilters.includes(f.id) ? `${f.color} ring-2 ring-white dark:ring-slate-800 shadow-sm` : 'bg-card-custom text-secondary-custom border border-card-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Gráfico de evolución en tiempo */}
                      <div className="lg:col-span-2 h-full bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom flex flex-col">
                        <h3 className="text-xs font-bold text-primary-custom mb-1 uppercase tracking-wider">Evolución de Atenciones</h3>
                        <p className="text-[10px] text-secondary-custom font-medium mb-3">Áreas apiladas para ver aportes individuales sin superposición molesta</p>
                        
                        <div className="flex-1 min-h-[280px] w-full">
                          <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorVolumen" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: 'var(--text-secondary)' }} />
                              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{fontSize: '11px'}} />
                              {opFilters.includes('totalPacientes') && <Area type="monotone" dataKey="totalPacientes" name="Volumen Total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolumen)" />}
                              {opFilters.includes('c1') && <Bar dataKey="c1" name="C1" stackId="triage" fill={COLORS.c1} />}
                              {opFilters.includes('c2') && <Bar dataKey="c2" name="C2" stackId="triage" fill={COLORS.c2} />}
                              {opFilters.includes('c3') && <Bar dataKey="c3" name="C3" stackId="triage" fill={COLORS.c3} />}
                              {opFilters.includes('c4') && <Bar dataKey="c4" name="C4" stackId="triage" fill={COLORS.c4} />}
                              {opFilters.includes('c5') && <Bar dataKey="c5" name="C5" stackId="triage" fill={COLORS.c5} radius={[4,4,0,0]} />}
                              {opFilters.includes('altasAdmin') && <Line type="monotone" dataKey="altasAdmin" name="Altas Admin" stroke="#ef4444" strokeWidth={2.5} dot={{r: 4}} />}
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* 100% Stacked Bar de Triajes (Reducción de espacio y mayor eficiencia lineal) */}
                      <div className="h-full bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom flex flex-col justify-between theme-transition">
                         <div>
                           <h3 className="text-xs font-bold text-primary-custom mb-1 uppercase tracking-wider">Distribución Triaje Global</h3>
                           <p className="text-[10px] text-secondary-custom font-medium mb-4">Proporción lineal del total atendido</p>
                           
                           {totalTriageVal > 0 ? (
                             <div className="w-full flex h-8 rounded-xl overflow-hidden border border-card-custom shadow-inner bg-card-custom theme-transition">
                               {pieData.map((item) => {
                                 const pct = (item.value / totalTriageVal) * 100;
                                 if (pct <= 0) return null;
                                 const colorKey = item.name === 'C3 (Lesiones)' ? 'c3_z518' : item.name.toLowerCase();
                                 return (
                                   <div 
                                     key={item.name} 
                                     style={{ width: `${pct}%`, backgroundColor: COLORS[colorKey] }} 
                                     className="h-full flex items-center justify-center relative group cursor-help transition-all duration-300 hover:opacity-90 border-r border-white/10 last:border-r-0"
                                   >
                                     {pct > 12 && (
                                       <span className="text-[9px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
                                         {item.name}: {pct.toFixed(0)}%
                                       </span>
                                     )}
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
                                       <span className="font-bold">{item.name}</span>: {item.value} pacientes ({pct.toFixed(1)}%)
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           ) : (
                             <div className="h-8 flex items-center justify-center text-[10px] text-secondary-custom opacity-55">Sin datos</div>
                           )}
                         </div>

                         {/* Leyenda de triajes interactiva */}
                         <div className="grid grid-cols-2 gap-2 mt-4">
                           {pieData.map(item => {
                             const pct = totalTriageVal > 0 ? (item.value / totalTriageVal) * 100 : 0;
                             const colorKey = item.name === 'C3 (Lesiones)' ? 'c3_z518' : item.name.toLowerCase();
                             return (
                               <div key={item.name} className="flex items-center gap-2 bg-card-custom p-1.5 rounded-xl border border-card-custom shadow-sm text-[11px] font-bold">
                                 <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[colorKey] }}></span>
                                 <span className="text-secondary-custom opacity-85 truncate flex-1">{item.name}</span>
                                 <span className="text-primary-custom ml-1 whitespace-nowrap">{item.value} <span className="text-[9px] text-secondary-custom opacity-70 font-medium">({pct.toFixed(1)}%)</span></span>
                               </div>
                             );
                           })}
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VISTA 2: TIEMPOS */}
                {activeTab === 'tiempos' && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex flex-wrap gap-2 items-center bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-card-custom">
                      <span className="text-xs font-bold text-secondary-custom mr-2">Filtros Rápidos:</span>
                      {[
                        { id: 'tiempoCatAna', label: 'Espera Médico', color: 'bg-pink-500/10 text-pink-500 border border-pink-500/20' },
                        { id: 'tiempoAdmCat', label: 'Espera Triaje', color: 'bg-purple-500/10 text-purple-500 border border-purple-500/20' },
                        { id: 'tiempoAnaAlt', label: 'Tiempo Box', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' },
                        { id: 'tiempoAdmAlt', label: 'Estadía Total', color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' }
                      ].map(f => (
                        <button key={f.id} onClick={() => toggleFilter(setTimeFilters, f.id)} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${timeFilters.includes(f.id) ? `${f.color} ring-2 ring-white dark:ring-slate-800 shadow-sm` : 'bg-card-custom text-secondary-custom border border-card-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom flex flex-col">
                      <h3 className="text-xs font-bold text-primary-custom mb-2 uppercase tracking-wider">Evolución de Tiempos de Espera (Minutos)</h3>
                      <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: 'var(--text-secondary)' }} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: '11px'}} />
                            {timeFilters.includes('tiempoCatAna') && <Line type="monotone" dataKey="tiempoCatAna" name="Espera Médico" stroke="#ec4899" strokeWidth={3} dot={{r:3}} />}
                            {timeFilters.includes('tiempoAdmCat') && <Line type="monotone" dataKey="tiempoAdmCat" name="Espera Triaje" stroke="#8b5cf6" strokeWidth={3} dot={{r:3}} />}
                            {timeFilters.includes('tiempoAnaAlt') && <Line type="monotone" dataKey="tiempoAnaAlt" name="Tiempo Box" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" />}
                            {timeFilters.includes('tiempoAdmAlt') && <Line type="monotone" dataKey="tiempoAdmAlt" name="Estadía Total" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" />}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* VISTA 3: DEMOGRAFÍA */}
                {activeTab === 'demografia' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[350px]">
                    <div className="h-full bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom flex flex-col justify-between">
                       <h3 className="text-xs font-bold text-primary-custom mb-4 uppercase tracking-wider">Distribución por Sexo</h3>
                       <div className="w-full flex-1">
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                            <Pie data={demographicData.sexo} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label={({percent}) => `${(percent * 100).toFixed(0)}%`}>
                              {demographicData.sexo.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="lg:col-span-2 h-full bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom flex flex-col">
                      <h3 className="text-xs font-bold text-primary-custom mb-4 uppercase tracking-wider">Distribución de Grupos Etarios</h3>
                      <div className="w-full flex-1">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={demographicData.edades} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} angle={-45} textAnchor="end" height={60} tick={{ fill: 'var(--text-secondary)' }} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Pacientes" fill="#8b5cf6" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* VISTA 4: PREVISIÓN Y ORIGEN */}
                {(activeTab === 'prevision' || activeTab === 'origen') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[350px]">
                    <div className="h-full bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom flex flex-col overflow-hidden">
                       <h3 className="text-xs font-bold text-primary-custom mb-4 uppercase tracking-wider">
                         {activeTab === 'prevision' ? 'Distribución de Previsión' : 'Distribución por Nacionalidad'}
                       </h3>
                       <div className="flex-1 min-h-[300px] w-full">
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie 
                                data={activeTab === 'prevision' ? demographicData.prevs : demographicData.origen} 
                                cx="50%" cy="50%" innerRadius={60} outerRadius={75} paddingAngle={2} dataKey="value"
                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {(activeTab === 'prevision' ? demographicData.prevs : demographicData.origen).map((entry, index) => 
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                )}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                    <div className="h-full bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom flex flex-col overflow-hidden">
                       <h3 className="text-xs font-bold text-primary-custom mb-4 uppercase tracking-wider">
                         {activeTab === 'prevision' ? 'Evolución Previsional' : 'Distribución por Establecimiento'}
                       </h3>
                       <div className="flex-1 min-h-[300px] overflow-y-auto custom-scrollbar pr-2 w-full">
                         {activeTab === 'prevision' ? (
                           <ResponsiveContainer width="100%" height={300}>
                             <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                               <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: 'var(--text-secondary)' }} />
                               <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                               <Tooltip content={<CustomTooltip />} />
                               <Area type="monotone" dataKey="totalPacientes" name="Total Pacientes" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                             </AreaChart>
                           </ResponsiveContainer>
                         ) : (
                           <ResponsiveContainer width="100%" height={300}>
                             <BarChart data={demographicData.centros} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                               <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                               <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                               <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={120} tick={{ fill: 'var(--text-secondary)' }} />
                               <Tooltip content={<CustomTooltip />} />
                               <Bar dataKey="value" name="Pacientes" fill="#8b5cf6" radius={[0,4,4,0]}>
                                 <LabelList dataKey="value" content={<CustomLabel />} />
                               </Bar>
                             </BarChart>
                           </ResponsiveContainer>
                         )}
                       </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
