import React from 'react';
import { Clock } from 'lucide-react';
import { COLORS } from '../../config/constants';
import { formatTime } from '../../utils/helpers';
import InfoTooltip from '../InfoTooltip';

export default function TablaTiemposEspera({ metricsByCategory, promediosGlobales }) {
  if (!metricsByCategory || !promediosGlobales) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-blue-500 w-5 h-5"/>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          Tiempos de Espera y Estadía por Triaje
          <InfoTooltip title="Tiempos de Espera" text="Detalle en minutos del viaje del paciente según su categoría de riesgo. Observa la fila inferior para el Promedio Global institucional." />
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="p-3 pb-2 rounded-tl-lg font-bold">Categoría</th>
              <th className="p-3 pb-2 text-center font-bold">Pacientes</th>
              <th className="p-3 pb-2 text-center font-bold">T. Admisión - Triage</th>
              <th className="p-3 pb-2 text-center font-bold">T. Triage - Atención</th>
              <th className="p-3 pb-2 text-center font-bold">T. Atención - Alta</th>
              <th className="p-3 pb-2 text-center rounded-tr-lg font-bold">Estadía Total</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            {['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5', 'sincat'].map(cat => {
              const data = metricsByCategory ? metricsByCategory[cat] : null;
              if (!data || (data.total === 0 && cat === 'sincat')) return null; 
              return (
                <tr key={cat} className="hover:bg-slate-50 transition group rounded-lg">
                  <td className="p-3 font-bold uppercase text-[11px] rounded-l-lg" style={{ color: COLORS[cat] }}>{cat === 'sincat' ? 'Sin Categorizar' : (cat === 'c3_z518' ? 'CATEGORÍA C3 (LESIONES)' : `CATEGORÍA ${cat.toUpperCase()}`)}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{data.total}</td>
                  <td className="p-3 text-center text-slate-600 font-medium">{formatTime(data.avgAdmCat)}</td>
                  <td className="p-3 text-center text-slate-600 font-medium">{formatTime(data.avgCatAna)}</td>
                  <td className="p-3 text-center text-emerald-600 font-medium">{formatTime(data.avgAnaAlt)}</td>
                  <td className="p-3 text-center font-bold text-indigo-700 rounded-r-lg group-hover:bg-indigo-50/50 transition">{formatTime(data.avgAdmAlt)}</td>
                </tr>
              )
            })}
            <tr><td colSpan="6" className="h-4"></td></tr>
            <tr className="bg-slate-50 rounded-lg font-black text-xs">
              <td className="p-4 text-slate-700 rounded-l-lg uppercase">Total / Promedio Global</td>
              <td className="p-4 text-center text-slate-800">{promediosGlobales?.totalPacientes || 0}</td>
              <td className="p-4 text-center text-slate-700">{formatTime(promediosGlobales?.avgAdmCat)}</td>
              <td className="p-4 text-center text-slate-700">{formatTime(promediosGlobales?.avgCatAna)}</td>
              <td className="p-4 text-center text-emerald-700">{formatTime(promediosGlobales?.avgAnaAlt)}</td>
              <td className="p-4 text-center text-indigo-800 rounded-r-lg bg-indigo-100/30">{formatTime(promediosGlobales?.avgAdmAlt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
