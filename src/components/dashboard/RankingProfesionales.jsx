import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { Trophy, Calendar, Users, Activity } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';

export default function RankingProfesionales({
  profFechaInicio,
  setProfFechaInicio,
  profFechaFin,
  setProfFechaFin,
  filteredMetricsByDoctor
}) {
  
  const rankingVolumen = useMemo(() => {
    return [...filteredMetricsByDoctor]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredMetricsByDoctor]);

  const rankingVelocidad = useMemo(() => {
    return [...filteredMetricsByDoctor]
      .sort((a, b) => b.promHora - a.promHora)
      .slice(0, 10);
  }, [filteredMetricsByDoctor]);

  const CustomTooltip = ({ active, payload, label, suffix }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-xs">
          <p className="font-bold text-slate-700 mb-1">{label}</p>
          <p className="text-slate-600">
            <span className="font-bold" style={{color: payload[0].fill}}>{payload[0].value}</span> {suffix}
          </p>
          {data.turnos !== undefined && (
            <p className="text-slate-500 mt-1 text-[10px]">En <span className="font-bold">{data.turnos}</span> turnos</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="text-yellow-500 w-5 h-5"/> Ranking de Desempeño Médico
          <InfoTooltip title="Rankings de Desempeño" text="Muestra los 3 médicos más destacados en volumen de atención y velocidad de resolución en Box. Premiando la eficiencia." />
        </h2>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
             <Calendar className="w-4 h-4 text-slate-400 ml-2"/>
             <input type="date" value={profFechaInicio} onChange={e => setProfFechaInicio(e.target.value)} className="text-[10px] border-none focus:ring-0 text-slate-600 bg-transparent p-1 outline-none"/>
             <span className="text-slate-300">-</span>
             <input type="date" value={profFechaFin} onChange={e => setProfFechaFin(e.target.value)} className="text-[10px] border-none focus:ring-0 text-slate-600 bg-transparent p-1 outline-none"/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico 1: Por Volumen */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-slate-600 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500"/> Top 10 por Volumen (Atenciones)
          </h3>
          <div className="w-full h-[350px]">
            {rankingVolumen.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={rankingVolumen} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={130} fontSize={10} tick={{fill: '#475569', fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip suffix="pacientes" />} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={16}>
                    {rankingVolumen.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No hay datos</div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Por Velocidad */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-slate-600 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500"/> Top 10 por Rendimiento (Pac/Hora)
          </h3>
          <div className="w-full h-[350px]">
            {rankingVelocidad.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={rankingVelocidad} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={130} fontSize={10} tick={{fill: '#475569', fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip suffix="pac/hora" />} />
                  <Bar dataKey="promHora" radius={[0, 4, 4, 0]} barSize={16}>
                    {rankingVelocidad.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#059669' : '#34d399'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No hay datos</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
