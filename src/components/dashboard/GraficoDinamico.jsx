import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, 
  Line, LineChart, ResponsiveContainer, CartesianGrid, ComposedChart, Area, AreaChart, LabelList 
} from 'recharts';
import { BarChart2, Activity, Users, Shield, Globe, Building2 } from 'lucide-react';
import { COLORS } from '../../config/constants';

const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

import InfoTooltip from '../InfoTooltip';

export default function GraficoDinamico({
  modoComparativo,
  compareChartData,
  chartData,
  pieData,
  turnosFiltrados,
  demografiaStats
}) {
  const [activeTab, setActiveTab] = React.useState('operacional');

  // Filtros internos
  const [opFilters, setOpFilters] = React.useState(['totalPacientes', 'c3', 'altasAdmin']);
  const [timeFilters, setTimeFilters] = React.useState(['tiempoCatAna', 'tiempoAdmCat', 'tiempoAnaAlt', 'tiempoAdmAlt']);

  const toggleFilter = (setFilter, val) => {
    setFilter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const tabs = [
    { id: 'operacional', label: 'Operacional & Triage', icon: Activity, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { id: 'tiempos', label: 'Tiempos de Atención', icon: BarChart2, color: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    { id: 'demografia', label: 'Demografía', icon: Users, color: 'bg-pink-500', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    { id: 'prevision', label: 'Previsión Médica', icon: Shield, color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    { id: 'origen', label: 'Origen & Centros', icon: Globe, color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  ];

  const CustomLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const porcentaje = demographicData?.centros?.[index]?.porcentaje || 0;
    return (
      <text x={x + width + 5} y={y + height / 2} fill="#64748b" fontSize={10} fontWeight="bold" dy={3}>
        {value} ({porcentaje}%)
      </text>
    );
  };

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

    // Previsión (Agrupando Fonasa vs Isapre vs Otros si hubiese, pero demografiaStats.prevs tiene claves exactas)
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
        <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-xl shadow-xl">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-xs mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-bold text-slate-800">
                {entry.value} {entry.payload && entry.payload.porcentaje ? `(${entry.payload.porcentaje}%)` : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center">
          <BarChart2 className="w-5 h-5 text-blue-500 mr-2" />
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center">
              Análisis Automático
              <InfoTooltip title="Análisis Automático" text="Esta sección construye visualizaciones instantáneas basadas en los datos filtrados en la parte superior. Selecciona diferentes pestañas para explorar métricas operacionales, de tiempo, y demográficas. Usa los 'Filtros Rápidos' dentro de cada pestaña para comparar curvas específicas." />
            </h2>
            <p className="text-xs text-slate-500 font-medium">Exploración visual instantánea de los datos filtrados.</p>
          </div>
        </div>
      </div>

      {!modoComparativo && (
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                  isActive 
                    ? `${tab.bg} ${tab.text} ${tab.border} border shadow-sm ring-2 ring-white` 
                    : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.text : 'text-slate-400'}`} />
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold'}} />
                <Bar dataKey="Periodo A" fill="#6366f1" radius={[4,4,0,0]} name="Periodo A" barSize={40} />
                <Bar dataKey="Periodo B" fill="#fbbf24" radius={[4,4,0,0]} name="Periodo B" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full w-full animate-fade-in">
            {chartData.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-400">
                <Activity className="w-12 h-12 mb-3 text-slate-200" />
                <p className="text-sm font-medium">Sin datos para graficar en este periodo</p>
              </div>
            ) : (
              <>
                {/* VISTA 1: OPERACIONAL */}
                {activeTab === 'operacional' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filtros:</span>
                      {[
                        { id: 'totalPacientes', label: 'Volumen Total', color: 'bg-blue-100 text-blue-700' },
                        { id: 'c1', label: 'C1', color: 'bg-red-100 text-red-700' },
                        { id: 'c2', label: 'C2', color: 'bg-orange-100 text-orange-700' },
                        { id: 'c3', label: 'C3', color: 'bg-yellow-100 text-yellow-700' },
                        { id: 'c4', label: 'C4', color: 'bg-green-100 text-green-700' },
                        { id: 'c5', label: 'C5', color: 'bg-blue-100 text-blue-700' },
                        { id: 'altasAdmin', label: 'Altas Admin', color: 'bg-slate-200 text-slate-700' }
                      ].map(f => (
                        <button key={f.id} onClick={() => toggleFilter(setOpFilters, f.id)} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${opFilters.includes(f.id) ? `${f.color} ring-1 ring-offset-1 ring-slate-200 shadow-sm` : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[22rem]">
                      <div className="lg:col-span-2 h-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                        <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Volumen vs Categorías de Triage</h3>
                        <div className="flex-1 min-h-[300px] w-full">
                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorVolumen" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                              <YAxis fontSize={10} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{fontSize: '11px'}} />
                              {opFilters.includes('totalPacientes') && <Area type="monotone" dataKey="totalPacientes" name="Volumen Total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolumen)" />}
                              {opFilters.includes('c1') && <Bar dataKey="c1" name="C1" stackId="triage" fill={COLORS.c1} />}
                              {opFilters.includes('c2') && <Bar dataKey="c2" name="C2" stackId="triage" fill={COLORS.c2} />}
                              {opFilters.includes('c3') && <Bar dataKey="c3" name="C3" stackId="triage" fill={COLORS.c3} />}
                              {opFilters.includes('c4') && <Bar dataKey="c4" name="C4" stackId="triage" fill={COLORS.c4} />}
                              {opFilters.includes('c5') && <Bar dataKey="c5" name="C5" stackId="triage" fill={COLORS.c5} radius={[4,4,0,0]} />}
                              {opFilters.includes('altasAdmin') && <Line type="monotone" dataKey="altasAdmin" name="Altas Admin" stroke="#ef4444" strokeWidth={2} dot={{r:4}} />}
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="h-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                         <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Distribución Triage Global</h3>
                         <div className="flex-1 min-h-[300px] w-full">
                           <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  {pieData.map((entry, index) => {
                                     const colorKey = entry.name === 'C3 (Lesiones)' ? 'c3_z518' : entry.name.toLowerCase();
                                     return <Cell key={`cell-${index}`} fill={COLORS[colorKey]} />
                                  })}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '10px'}}/>
                              </PieChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VISTA 2: TIEMPOS */}
                {activeTab === 'tiempos' && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex flex-wrap gap-2 items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filtros:</span>
                      {[
                        { id: 'tiempoCatAna', label: 'Espera Médico', color: 'bg-pink-100 text-pink-700' },
                        { id: 'tiempoAdmCat', label: 'Espera Triage', color: 'bg-purple-100 text-purple-700' },
                        { id: 'tiempoAnaAlt', label: 'Tiempo Box', color: 'bg-teal-100 text-teal-700' },
                        { id: 'tiempoAdmAlt', label: 'Estadía Total', color: 'bg-indigo-100 text-indigo-700' }
                      ].map(f => (
                        <button key={f.id} onClick={() => toggleFilter(setTimeFilters, f.id)} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${timeFilters.includes(f.id) ? `${f.color} ring-1 ring-offset-1 ring-slate-200 shadow-sm` : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                      <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Evolución de Tiempos de Espera (Minutos)</h3>
                      <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: '11px'}} />
                            {timeFilters.includes('tiempoCatAna') && <Line type="monotone" dataKey="tiempoCatAna" name="Espera Médico" stroke="#ec4899" strokeWidth={3} dot={{r:3}} />}
                            {timeFilters.includes('tiempoAdmCat') && <Line type="monotone" dataKey="tiempoAdmCat" name="Espera Triage" stroke="#8b5cf6" strokeWidth={3} dot={{r:3}} />}
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
                    <div className="h-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                       <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Distribución por Sexo</h3>
                       <div className="w-full">
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
                    <div className="lg:col-span-2 h-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Distribución de Grupos Etarios</h3>
                      <div className="w-full">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={demographicData.edades} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} angle={-45} textAnchor="end" height={60} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} />
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
                    <div className="h-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
                       <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
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
                    <div className="h-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
                       <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                         {activeTab === 'prevision' ? 'Evolución Previsional' : 'Distribución por Establecimiento'}
                       </h3>
                       <div className="flex-1 min-h-[300px] overflow-y-auto custom-scrollbar pr-2 w-full">
                         {activeTab === 'prevision' ? (
                           <ResponsiveContainer width="100%" height={300}>
                             <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                               <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                               <YAxis fontSize={10} axisLine={false} tickLine={false} />
                               <Tooltip content={<CustomTooltip />} />
                               <Legend wrapperStyle={{fontSize: '11px'}} />
                               <Area type="monotone" dataKey="prev_fonasa" name="FONASA" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                               <Area type="monotone" dataKey="prev_isapre" name="ISAPRE" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                             </AreaChart>
                           </ResponsiveContainer>
                         ) : (
                           <ResponsiveContainer width="100%" height={Math.max(300, demographicData.centros.length * 50)}>
                             <BarChart data={demographicData.centros} layout="vertical" margin={{ top: 5, right: 50, left: 60, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Pacientes" radius={[0,4,4,0]} barSize={20}>
                                  {demographicData.centros.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                  <LabelList 
                                    dataKey="value" 
                                    content={<CustomLabel />}
                                  />
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
