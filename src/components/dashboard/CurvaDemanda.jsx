import React from 'react';
import { 
  XAxis, YAxis, Tooltip, Legend, Area, Line, ResponsiveContainer, CartesianGrid, ComposedChart 
} from 'recharts';
import { Zap, Calendar } from 'lucide-react';
import { DOC_COLORS } from '../../config/constants';
import InfoTooltip from '../InfoTooltip';

export default function CurvaDemanda({
  peakHoursData,
  demandaFechaInicio,
  setDemandaFechaInicio,
  demandaFechaFin,
  setDemandaFechaFin,
  demandaViewMode,
  modoComparativo,
  docsToCompare
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6 w-full flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
         <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500"/>
            <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
              Curva de Demanda Continua (00:00 - 23:59)
              <InfoTooltip title="Curva de Demanda" text="Analiza los 'Peak Hours' o picos de congestión a lo largo del día seleccionado." />
            </h2>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
               <Calendar className="w-4 h-4 text-slate-400 ml-2"/>
               <input type="date" value={demandaFechaInicio} onChange={e => setDemandaFechaInicio(e.target.value)} className="text-xs border-none focus:ring-0 text-slate-600 bg-transparent p-1 outline-none"/>
               <span className="text-slate-300">-</span>
               <input type="date" value={demandaFechaFin} onChange={e => setDemandaFechaFin(e.target.value)} className="text-xs border-none focus:ring-0 text-slate-600 bg-transparent p-1 outline-none"/>
            </div>
         </div>
      </div>
      <div className="h-full w-full">
        {peakHoursData.some(d => d.atenciones > 0 || (modoComparativo && d.periodoB > 0)) ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemanda" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="horaCorta" fontSize={10} tickMargin={5} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize:'11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} labelFormatter={(label, payload) => String((payload && payload.length > 0) ? payload[0].payload.horaTooltip : label)} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              
              {demandaViewMode === 'total' ? (
                  <Area type="monotone" dataKey="atenciones" name="Total Pacientes" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorDemanda)" />
              ) : null}
              
              {demandaViewMode === 'periodos' ? (
                  <Line type="monotone" dataKey="atenciones" name="Periodo A" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{r: 5}} />
              ) : null}
              
              {demandaViewMode === 'periodos' ? (
                  <Line type="monotone" dataKey="periodoB" name="Periodo B" stroke="#fbbf24" strokeWidth={3} dot={false} activeDot={{r: 5}} />
              ) : null}
              
              {demandaViewMode === 'doctores' ? (
                  docsToCompare.map((doc, idx) => (
                      <Line key={doc} type="monotone" dataKey={doc} name={doc} stroke={DOC_COLORS[idx % DOC_COLORS.length]} strokeWidth={2} dot={false} activeDot={{r: 5}} />
                  ))
              ) : null}

            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">Sin datos de admisión registrados en este periodo.</div>
        )}
      </div>
    </div>
  );
}
