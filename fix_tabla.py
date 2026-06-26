import sys

code = """import React from 'react';
import { Clock } from 'lucide-react';
import { COLORS } from '../../config/constants';
import { formatTime } from '../../utils/helpers';

export default function TablaTiemposEspera({ metricsByCategory, promediosGlobales }) {
  if (!metricsByCategory || !promediosGlobales) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-blue-500 w-5 h-5"/>
        <h2 className="text-base font-bold text-slate-800">Tiempos de Espera y Estadía por Triaje</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <th className="p-3 rounded-tl-lg">Categoría</th>
              <th className="p-3 text-center">Pacientes</th>
              <th className="p-3 text-center">T. Admisión - Triage</th>
              <th className="p-3 text-center">T. Triage - Atención</th>
              <th className="p-3 text-center">T. Atención - Alta</th>
              <th className="p-3 text-center rounded-tr-lg">Estadía Total</th>
            </tr>
          </thead>
          <tbody>
            {['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5', 'sincat'].map(cat => {
              const data = metricsByCategory ? metricsByCategory[cat] : null;
              if (!data || (data.total === 0 && cat === 'sincat')) return null; 
              return (
                <tr key={cat} className="border-b hover:bg-slate-50 transition">
                  <td className="p-3 font-bold uppercase" style={{ color: COLORS[cat] }}>{cat === 'sincat' ? 'Sin Categorizar' : (cat === 'c3_z518' ? 'CATEGORÍA C3 (LESIONES)' : `CATEGORÍA ${cat.toUpperCase()}`)}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{data.total}</td>
                  <td className="p-3 text-center border-l text-slate-600">{formatTime(data.avgAdmCat)}</td>
                  <td className="p-3 text-center border-l text-slate-600">{formatTime(data.avgCatAna)}</td>
                  <td className="p-3 text-center border-l text-emerald-600">{formatTime(data.avgAnaAlt)}</td>
                  <td className="p-3 text-center border-l font-bold text-indigo-700 bg-indigo-50/30">{formatTime(data.avgAdmAlt)}</td>
                </tr>
              )
            })}
            <tr className="bg-slate-100/50 font-black border-t-2 border-slate-200">
              <td className="p-3 text-slate-800">TOTAL / PROMEDIO GLOBAL</td>
              <td className="p-3 text-center text-slate-800">{promediosGlobales?.totalPacientes || 0}</td>
              <td className="p-3 text-center border-l text-slate-800">{formatTime(promediosGlobales?.avgAdmCat)}</td>
              <td className="p-3 text-center border-l text-slate-800">{formatTime(promediosGlobales?.avgCatAna)}</td>
              <td className="p-3 text-center border-l text-emerald-700">{formatTime(promediosGlobales?.avgAnaAlt)}</td>
              <td className="p-3 text-center border-l text-indigo-800 bg-indigo-100/50">{formatTime(promediosGlobales?.avgAdmAlt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""

with open("src/components/dashboard/TablaTiemposEspera.jsx", "w", encoding="utf-8") as f:
    f.write(code)
