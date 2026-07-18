import React, { useMemo } from 'react';
import { Users, HeartPulse, Shield, Globe, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import InfoTooltip from '../InfoTooltip';
import { perc } from '../../utils/helpers';

const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

export default function AnalisisSociodemografico({ demografiaStats, rankingCentros }) {
  if (!demografiaStats || !rankingCentros) return null;

  const topNacionalidades = useMemo(() => {
    return Object.entries(demografiaStats.nacionalidades)
      .sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [demografiaStats.nacionalidades]);
  
  const topComunas = useMemo(() => {
    return Object.entries(demografiaStats.comunas)
      .sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [demografiaStats.comunas]);
    
  const topPrevisiones = useMemo(() => {
    return Object.entries(demografiaStats.prevs)
      .sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [demografiaStats.prevs]);

  // Population pyramid chart data structure (divergent bar chart)
  const pyramidData = useMemo(() => {
    if (!demografiaStats.edadesSexo) return [];
    return AGE_RANGES.map(range => {
      const mVal = demografiaStats.edadesSexo.M[range] || 0;
      const fVal = demografiaStats.edadesSexo.F[range] || 0;
      return {
        age: range,
        Hombres: -mVal, // negative for left-side rendering
        Mujeres: fVal,  // positive for right-side rendering
        mRaw: mVal,
        fRaw: fVal
      };
    }).reverse(); // older categories at top
  }, [demografiaStats]);

  const CustomPyramidTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const m = Math.abs(payload[0].payload.mRaw || 0);
      const f = Math.abs(payload[0].payload.fRaw || 0);
      const total = m + f;
      return (
        <div className="bg-card-custom border border-card-custom p-3 rounded-2xl shadow-xl text-xs font-bold font-sans theme-transition min-w-[150px]">
          <p className="font-black text-primary-custom border-b border-card-custom pb-1.5 mb-2">{payload[0].payload.age} Años</p>
          <div className="flex justify-between gap-4 text-blue-500 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Hombres:
            </span>
            <span className="font-black">{m}</span>
          </div>
          <div className="flex justify-between gap-4 text-pink-500 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span> Mujeres:
            </span>
            <span className="font-black">{f}</span>
          </div>
          <div className="flex justify-between gap-4 text-primary-custom border-t border-card-custom/50 pt-1.5 mt-1.5 font-black">
            <span>Total:</span>
            <span>{total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card-custom rounded-2xl border border-card-custom p-6 mt-6 theme-transition">
      <div className="flex items-center gap-2 mb-6">
        <Users className="accent-text-custom w-5 h-5"/>
        <h2 className="text-base font-bold text-primary-custom flex items-center gap-2">
          Análisis Sociodemográfico y Origen 
          <InfoTooltip title="Análisis Sociodemográfico" text="Visualiza la estructura demográfica (pirámide poblacional por edad y sexo), previsión de salud, comunas y nacionalidades de procedencia con barras de proporción visual." />
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* COLUMNA 1: PIRÁMIDE POBLACIONAL (Edad y Sexo) */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-primary-custom flex items-center gap-2 mb-1">
              <HeartPulse className="w-4 h-4 text-rose-500"/> Pirámide Poblacional
            </h3>
            <p className="text-[10px] text-secondary-custom font-medium mb-4">Distribución divergente por edad (Hombres izquierda / Mujeres derecha)</p>
          </div>
          
          <div className="flex-1 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                layout="vertical"
                data={pyramidData}
                stackOffset="sign"
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" tickFormatter={(v) => Math.abs(v)} fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis dataKey="age" type="category" fontSize={9} axisLine={false} tickLine={false} width={45} tick={{ fontWeight: 'bold', fill: 'var(--text-secondary)' }} />
                <Tooltip content={<CustomPyramidTooltip />} cursor={{ fill: 'rgba(0,0,0,0.025)' }} />
                <Bar dataKey="Hombres" fill="#3b82f6" stackId="stack" radius={[4, 0, 0, 4]} />
                <Bar dataKey="Mujeres" fill="#ec4899" stackId="stack" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-[10px] font-black mt-2">
            <span className="flex items-center gap-1.5 text-blue-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> Hombres ({perc(demografiaStats.sexo.M, demografiaStats.total)}%)
            </span>
            <span className="flex items-center gap-1.5 text-pink-500">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm"></span> Mujeres ({perc(demografiaStats.sexo.F, demografiaStats.total)}%)
            </span>
          </div>
        </div>

        {/* COLUMNA 2: PREVISIÓN */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-primary-custom flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-500"/> Previsión Médica
            </h3>
            <p className="text-[10px] text-secondary-custom font-medium mb-4">Sistemas de cobertura activa</p>
          </div>
          
          <div className="space-y-4">
            {topPrevisiones.map(([prev, count]) => {
              const share = perc(count, demografiaStats.total);
              return (
                <div key={prev} className="space-y-1.5 group cursor-help relative">
                  <div className="flex justify-between text-xs font-bold text-secondary-custom">
                    <span className="uppercase truncate max-w-[130px]" title={prev}>{prev}</span>
                    <span className="text-emerald-500 font-black">{share}%</span>
                  </div>
                  <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2 overflow-hidden border border-card-custom/20">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <div className="absolute bottom-full right-0 mb-1 px-2.5 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-25 shadow-lg">
                    {count} pacientes
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 3: ORIGEN (Nacionalidad y Comuna) */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-primary-custom flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-500"/> Procedencia y Origen
              </h3>
              <p className="text-[10px] text-secondary-custom font-medium mb-3">Top 3 Nacionalidades</p>
            </div>
            
            <div className="space-y-3.5">
              {topNacionalidades.slice(0, 3).map(([nac, count]) => {
                const share = perc(count, demografiaStats.total);
                return (
                  <div key={nac} className="space-y-1 group cursor-help relative">
                    <div className="flex justify-between text-[11px] font-bold text-secondary-custom">
                      <span className="uppercase truncate max-w-[125px]">{nac}</span>
                      <span className="text-blue-500 font-black">{share}%</span>
                    </div>
                    <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-25 shadow-md">
                      {count} pacientes
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-card-custom/50">
            <p className="text-[10px] font-bold text-secondary-custom uppercase mb-2">Comunas Principales</p>
            <div className="space-y-3.5">
              {topComunas.slice(0, 3).map(([com, count]) => {
                const share = perc(count, demografiaStats.total);
                return (
                  <div key={com} className="space-y-1 group cursor-help relative">
                    <div className="flex justify-between text-[11px] font-bold text-secondary-custom">
                      <span className="uppercase truncate max-w-[125px]">{com}</span>
                      <span className="text-indigo-500 font-black">{share}%</span>
                    </div>
                    <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-25 shadow-md">
                      {count} pacientes
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
