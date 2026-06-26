import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { UserCheck, Search, X, Calendar, Activity, Users, Clock, Users as UsersIcon } from 'lucide-react';
import { DOC_COLORS } from '../../config/constants';
import { formatTime } from '../../utils/helpers';
import InfoTooltip from '../InfoTooltip';

export default function AnalisisProfesionales({
  profFechaInicio,
  setProfFechaInicio,
  profFechaFin,
  setProfFechaFin,
  searchDoctor,
  setSearchDoctor,
  docsToCompare,
  toggleDocToCompare,
  clearDocComparison,
  filteredMetricsByDoctor,
  dailyDoctorData
}) {
  const [versusMetric, setVersusMetric] = useState('total');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <UserCheck className="text-blue-500 w-5 h-5"/> Centro de Análisis de Profesionales (Versus)
          <InfoTooltip title="Tablas Comparativas" text="Selecciona uno o más médicos en la tabla inferior para compararlos visualmente en el gráfico superior." />
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

      <div className="flex flex-col gap-6">
        {/* Gráfico Versus */}
        <div className="w-full h-[350px] bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700">Comparativa Evolutiva de Profesionales</h3>
            {docsToCompare.length > 0 && (
              <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                <button onClick={() => setVersusMetric('total')} className={`px-3 py-1 flex items-center gap-1 text-xs font-bold rounded ${versusMetric === 'total' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><UsersIcon className="w-3 h-3"/> Pacientes Atendidos</button>
                <button onClick={() => setVersusMetric('avg')} className={`px-3 py-1 flex items-center gap-1 text-xs font-bold rounded ${versusMetric === 'avg' ? 'bg-slate-100 text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}><Clock className="w-3 h-3"/> Prom. en Box</button>
              </div>
            )}
          </div>
          {docsToCompare.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <LineChart data={dailyDoctorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="fecha" fontSize={10} tickMargin={5} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize:'11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                {docsToCompare.map((doc, idx) => (
                  <Line key={doc} type="monotone" dataKey={`${doc}_${versusMetric}`} name={doc} stroke={DOC_COLORS[idx % DOC_COLORS.length]} strokeWidth={3} dot={{r: 3}} activeDot={{r: 6}} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Activity className="w-8 h-8 opacity-50" />
              <span className="text-sm font-medium">Selecciona médicos en la tabla inferior para compararlos.</span>
            </div>
          )}
        </div>

        {/* Tabla Completa de Profesionales */}
        <div className="w-full mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500"/> Tabla Completa de Profesionales (Todos)
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input type="text" placeholder="Buscar médico..." value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)} className="w-64 pl-9 p-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"/>
                {searchDoctor && <button onClick={() => setSearchDoctor('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>}
              </div>
              {docsToCompare.length > 0 && <button onClick={clearDocComparison} className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-3 py-2 rounded-lg transition-colors">Limpiar Versus</button>}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100 shadow-sm">
            <table className="w-full text-left text-sm bg-white">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold text-xs border-b border-slate-100">
                  <th className="p-4 w-12 text-center">Nº</th>
                  <th className="p-4">Médico Tratante</th>
                  <th className="p-4 text-center">Pacientes Atendidos</th>
                  <th className="p-4 text-center">Promedio de Atención en Box</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetricsByDoctor.map((doc, index) => {
                  const isSelected = docsToCompare.includes(doc.name);
                  return (
                    <tr 
                      key={doc.name} 
                      onClick={() => toggleDocToCompare(doc.name)}
                      className={`border-b border-slate-50 last:border-b-0 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="p-4 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        {doc.name}
                      </td>
                      <td className="p-4 text-center font-bold text-blue-600 text-base">{doc.total}</td>
                      <td className="p-4 text-center font-bold text-rose-500 text-sm">
                        {doc.promAtencion > 0 ? formatTime(doc.promAtencion) : '-'}
                      </td>
                    </tr>
                  );
                })}
                {filteredMetricsByDoctor.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">No se encontraron profesionales para esta búsqueda o rango de fechas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
