import React, { useState, useMemo } from 'react';
import { Grid, ArrowRight, Activity, Zap, CheckCircle2 } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';

const VARIABLES = [
  { id: 'categoria', label: 'Categoría de Triaje' },
  { id: 'sexo', label: 'Sexo' },
  { id: 'edad', label: 'Rango Etario' },
  { id: 'prevision', label: 'Previsión' },
  { id: 'comuna', label: 'Comuna' },
  { id: 'nacionalidad', label: 'Nacionalidad' },
  { id: 'establecimiento', label: 'Establecimiento' }
];

export default function MatrizCruzada({ pacientesFiltrados }) {
  const [ejeX, setEjeX] = useState('categoria');
  const [ejeY, setEjeY] = useState('edad');

  // Helper to categorize numeric/raw values
  const getValue = (paciente, variable) => {
    if (variable === 'edad') {
      if (paciente.edad === null || paciente.edad === undefined) return 'Sin Registro';
      if (paciente.edad >= 80) return '80+ años';
      const min = Math.floor(paciente.edad / 5) * 5;
      return `${min}-${min + 4} años`;
    }
    if (variable === 'categoria') {
      const c = paciente.categoria;
      if (c === 'c3_z518') return 'C3 (Lesiones)';
      if (c === 'sincat') return 'Sin Categorizar';
      return c ? c.toUpperCase() : 'Sin Categorizar';
    }
    
    let val = paciente[variable];
    if (!val) return 'Sin Registro';
    
    // Normalize text
    val = String(val).toUpperCase().trim();
    if (variable === 'nacionalidad' && val.includes('CHILEN')) return 'CHILENA';
    if (variable === 'sexo') {
      if (val.includes('MUJER') || val.includes('FEM') || val === 'F') return 'MUJER';
      if (val.includes('HOMBRE') || val.includes('MASC') || val === 'M') return 'HOMBRE';
      return val;
    }
    
    return val;
  };

  const matrizData = useMemo(() => {
    if (!pacientesFiltrados || pacientesFiltrados.length === 0) return { matrix: {}, xLabels: [], yLabels: [], maxVal: 0, total: 0 };

    const matrix = {};
    const xSet = new Set();
    const ySet = new Set();
    let maxVal = 0;
    let total = 0;

    pacientesFiltrados.forEach(p => {
      const vx = getValue(p, ejeX);
      const vy = getValue(p, ejeY);
      
      xSet.add(vx);
      ySet.add(vy);

      if (!matrix[vy]) matrix[vy] = {};
      if (!matrix[vy][vx]) matrix[vy][vx] = 0;
      matrix[vy][vx]++;
      
      if (matrix[vy][vx] > maxVal) maxVal = matrix[vy][vx];
      total++;
    });

    const sortLabels = (set, type) => {
      const arr = Array.from(set);
      if (type === 'edad') {
        const order = ['0-4 años', '5-9 años', '10-14 años', '15-19 años', '20-24 años', '25-29 años', '30-34 años', '35-39 años', '40-44 años', '45-49 años', '50-54 años', '55-59 años', '60-64 años', '65-69 años', '70-74 años', '75-79 años', '80+ años', 'Sin Registro'];
        return arr.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }
      if (type === 'categoria') {
        const order = ['C1', 'C2', 'C3', 'C3 (Lesiones)', 'C4', 'C5', 'Sin Categorizar'];
        return arr.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }
      return arr.sort();
    };

    return {
      matrix,
      xLabels: sortLabels(xSet, ejeX),
      yLabels: sortLabels(ySet, ejeY),
      maxVal,
      total
    };
  }, [pacientesFiltrados, ejeX, ejeY]);

  // Heatmap color generator
  const getCellColor = (val, max) => {
    if (!val || max === 0) return 'bg-slate-50 text-slate-400';
    const intensity = val / max;
    if (intensity > 0.8) return 'bg-indigo-600 text-white font-bold';
    if (intensity > 0.5) return 'bg-indigo-400 text-white font-bold';
    if (intensity > 0.2) return 'bg-indigo-200 text-indigo-900';
    return 'bg-indigo-50 text-indigo-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Grid className="text-indigo-600 w-5 h-5"/>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Relación de Datos Multivariables
              <InfoTooltip title="Relación de Datos Multivariables" text="Compara dos variables simultáneamente (ej. Triaje vs Rango Etario) para descubrir patrones ocultos de demanda en la urgencia." />
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Descubre correlaciones y volúmenes cruzando dos variables operacionales.</p>
        </div>
        
        <div className="flex gap-4 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Eje Y (Filas):</span>
            <select 
              value={ejeY} 
              onChange={e => setEjeY(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 focus:outline-none focus:border-indigo-500 font-medium text-slate-700 bg-white"
            >
              {VARIABLES.map(v => <option key={`y-${v.id}`} value={v.id} disabled={v.id === ejeX}>{v.label}</option>)}
            </select>
          </div>
          <span className="text-slate-300">×</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Eje X (Columnas):</span>
            <select 
              value={ejeX} 
              onChange={e => setEjeX(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 focus:outline-none focus:border-indigo-500 font-medium text-slate-700 bg-white"
            >
              {VARIABLES.map(v => <option key={`x-${v.id}`} value={v.id} disabled={v.id === ejeY}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-3 border-b-2 border-slate-200 bg-white text-left min-w-[150px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{VARIABLES.find(v=>v.id===ejeY)?.label} ↓</div>
              </th>
              {matrizData.xLabels.map(x => (
                <th key={x} className="p-3 border-b-2 border-slate-200 bg-white text-center font-bold text-slate-700 min-w-[100px]">
                  {x}
                </th>
              ))}
              <th className="p-3 border-b-2 border-slate-200 bg-slate-50 text-center font-black text-slate-800 min-w-[100px]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {matrizData.total === 0 ? (
              <tr><td colSpan={matrizData.xLabels.length + 2} className="text-center p-8 text-slate-400">No hay datos de pacientes masivos para generar la matriz.</td></tr>
            ) : (
              matrizData.yLabels.map(y => {
                let rowTotal = 0;
                return (
                  <tr key={y} className="border-b border-slate-100 group hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-600 border-r border-slate-100">{y}</td>
                    {matrizData.xLabels.map(x => {
                      const val = (matrizData.matrix[y] && matrizData.matrix[y][x]) || 0;
                      rowTotal += val;
                      return (
                        <td key={x} className="p-1 border-r border-slate-50">
                          <div className={`w-full h-full p-2 text-center rounded transition-colors ${getCellColor(val, matrizData.maxVal)}`} title={`${val} pacientes (${((val/matrizData.total)*100).toFixed(1)}%)`}>
                            {val > 0 ? val : '-'}
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-black text-slate-800 bg-slate-50/50 border-l border-slate-200">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
