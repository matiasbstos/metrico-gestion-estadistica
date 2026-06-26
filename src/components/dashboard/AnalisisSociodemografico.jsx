import React, { useMemo } from 'react';
import { Users, HeartPulse, Shield, Globe, Building2 } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { perc } from '../../utils/helpers';

export default function AnalisisSociodemografico({ demografiaStats, rankingCentros }) {
  if (!demografiaStats || !rankingCentros) return null;

  const topNacionalidades = Object.entries(demografiaStats.nacionalidades)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  const topComunas = Object.entries(demografiaStats.comunas)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
    
  const topPrevisiones = Object.entries(demografiaStats.prevs)
    .sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-indigo-600 w-5 h-5"/>
        <h2 className="text-base font-bold text-slate-800">Análisis Sociodemográfico y Origen <InfoTooltip title="Análisis Sociodemográfico" text="Visualiza la distribución de pacientes por edad y origen comunal. Ayuda a identificar la huella sociodemográfica de la demanda." /></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* COLUMNA 1: PACIENTES (Sexo y Edad) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <HeartPulse className="w-4 h-4 text-rose-500"/> Pacientes
          </h3>
          
          <div>
            <p className="text-[11px] font-bold text-slate-500 mb-2">Distribución por Sexo</p>
            <div className="flex gap-2 text-xs font-bold">
              <div className="flex-1 bg-pink-50 text-pink-600 p-2 rounded text-center border border-pink-100 cursor-help relative group">
                Mujeres: {perc(demografiaStats.sexo.F, demografiaStats.total)}%
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{demografiaStats.sexo.F} pacientes</div>
              </div>
              <div className="flex-1 bg-blue-50 text-blue-600 p-2 rounded text-center border border-blue-100 cursor-help relative group">
                Hombres: {perc(demografiaStats.sexo.M, demografiaStats.total)}%
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{demografiaStats.sexo.M} pacientes</div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-500 mb-2">Grupos Etarios</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              {['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'].map(r => {
                const count = demografiaStats.edades[r] || 0;
                if (count === 0) return null;
                return (
                  <div key={r} className="flex justify-between font-medium text-slate-600 bg-slate-50 p-1 rounded cursor-help relative group">
                    <span>{r}</span><span className="font-bold">{perc(count, demografiaStats.total)}%</span>
                    <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{count} pacientes</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: PREVISIÓN */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-500"/> Previsión
          </h3>
          <div className="space-y-3 text-xs">
            {topPrevisiones.map(([prev, count]) => (
              <div key={prev} className="flex justify-between font-medium text-slate-600 cursor-help relative group">
                <span className="uppercase truncate max-w-[140px]">{prev}</span>
                <span className="font-bold text-emerald-600">{perc(count, demografiaStats.total)}%</span>
                <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{count} pacientes</div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: ORIGEN (Nacionalidad y Comuna) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-500"/> Origen
          </h3>
          
          <div>
            <p className="text-[11px] font-bold text-slate-500 mb-2">Top Nacionalidades</p>
            <div className="space-y-2 text-xs">
              {topNacionalidades.map(([nac, count]) => (
                <div key={nac} className="flex justify-between font-medium text-slate-600 cursor-help relative group">
                  <span className="uppercase truncate max-w-[120px]">{nac}</span>
                  <span className="font-bold">{perc(count, demografiaStats.total)}%</span>
                  <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{count} pacientes</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-500 mb-2">Comunas Principales</p>
            <div className="space-y-2 text-xs">
              {topComunas.map(([com, count]) => (
                <div key={com} className="flex justify-between font-medium text-slate-600 cursor-help relative group">
                  <span className="uppercase truncate max-w-[120px]">{com}</span>
                  <span className="font-bold">{perc(count, demografiaStats.total)}%</span>
                  <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{count} pacientes</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 4: ESTABLECIMIENTOS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-purple-500"/> Establecimientos
          </h3>
          
          <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
            <p className="text-[11px] font-bold text-purple-600 mb-1 text-center">Centros Base Acumulado</p>
            <div className="text-center mb-3">
              <span className="text-2xl font-black text-purple-700">{rankingCentros.mainCentrosPercent}%</span>
              <span className="text-[10px] text-purple-500 ml-1">del total</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-medium text-purple-700 cursor-help relative group">
                <span>CESFAM Florencia</span><span className="font-bold">{rankingCentros.florencia.perc}%</span>
                <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-purple-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{rankingCentros.florencia.count} pacientes</div>
              </div>
              <div className="flex justify-between font-medium text-purple-700 cursor-help relative group">
                <span>CESFAM Boris Soler</span><span className="font-bold">{rankingCentros.boris.perc}%</span>
                <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-purple-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{rankingCentros.boris.count} pacientes</div>
              </div>
              <div className="flex justify-between font-medium text-purple-700 cursor-help relative group">
                <span>CESFAM Elgueta</span><span className="font-bold">{rankingCentros.elgueta.perc}%</span>
                <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-purple-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{rankingCentros.elgueta.count} pacientes</div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-500 mb-2">Otros Centros (Top 5)</p>
            <div className="space-y-2 text-[10px]">
              {rankingCentros.otrosCentros.map((centro) => (
                <div key={centro.name} className="flex justify-between font-medium text-slate-600 cursor-help relative group">
                  <span className="uppercase truncate max-w-[140px]">{centro.name}</span>
                  <span className="font-bold">{perc(centro.count, demografiaStats.total)}%</span>
                  <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">{centro.count} pacientes</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
