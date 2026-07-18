import React, { useState } from 'react';
import { Stethoscope, BarChart2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TopDiagnosticos({ topDiagnosticos }) {
  const [showSidebar, setShowSidebar] = useState(false);

  if (!topDiagnosticos || topDiagnosticos.length === 0) return null;

  return (
    <div className="bg-card-custom p-6 rounded-2xl border border-card-custom mt-6 shadow-sm animate-fade-in relative overflow-hidden theme-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-primary-custom">Top 10 Diagnósticos Principales</h2>
            <p className="text-xs text-secondary-custom font-medium">Condiciones más frecuentes en urgencias del periodo seleccionado</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSidebar(true)}
          className="flex items-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 text-primary-custom hover:text-rose-500 border border-card-custom px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <BarChart2 className="w-4 h-4" />
          Ver Desglose Gráfico
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topDiagnosticos.map((diag, index) => {
          const maxCount = topDiagnosticos[0]?.count || 1;
          const w = (diag.count / maxCount) * 100;
          return (
            <div key={index} className="relative flex items-center justify-between p-3 bg-card-custom border border-card-custom rounded-xl overflow-hidden hover:border-rose-500/30 hover:shadow-md transition-all group">
              {/* Barra de progreso de fondo */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-rose-500/10 transition-all duration-1000 group-hover:bg-rose-500/20" 
                style={{ width: `${w}%` }} 
              />
              <div className="relative flex items-center gap-3 z-10 w-full pr-4">
                <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm ${index < 3 ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white' : 'bg-black/5 dark:bg-white/5 text-secondary-custom'}`}>
                  {index + 1}
                </div>
                <p className="text-xs font-bold text-primary-custom truncate flex-1" title={diag.name}>{diag.name}</p>
              </div>
              <span className="relative z-10 text-sm font-black text-rose-500 bg-card-custom px-2.5 py-1 rounded-lg border border-rose-500/20 shadow-sm">
                {diag.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Barra lateral / Drawer para el gráfico */}
      {showSidebar && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay oscuro */}
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowSidebar(false)} 
          />
          
          {/* Panel lateral */}
          <div className="relative w-full max-w-lg bg-card-custom h-full shadow-2xl border-l border-card-custom flex flex-col animate-fade-in theme-transition">
            <div className="p-6 border-b border-card-custom flex justify-between items-center bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-primary-custom text-lg">Desglose de Diagnósticos</h3>
                  <p className="text-xs text-secondary-custom font-medium">Distribución gráfica de casos</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSidebar(false)} 
                className="p-2 bg-card-custom border border-card-custom hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-primary-custom shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-hidden bg-black/5 dark:bg-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topDiagnosticos}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={160}
                    tick={{fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 'bold'}} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', border: '1px solid', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Contabilización" 
                    fill="#fb7185" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
