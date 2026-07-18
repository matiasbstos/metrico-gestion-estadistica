import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function TopDiagnosticos({ topDiagnosticos }) {
  if (!topDiagnosticos || topDiagnosticos.length === 0) return null;

  const totalCases = topDiagnosticos.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = topDiagnosticos[0]?.count || 1;

  return (
    <div className="bg-card-custom p-6 rounded-2xl border border-card-custom mt-6 shadow-sm animate-fade-in theme-transition">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-primary-custom">Top 10 Diagnósticos Principales</h2>
          <p className="text-xs text-secondary-custom font-medium">Condiciones más frecuentes en urgencias y su proporción relativa</p>
        </div>
      </div>

      <div className="space-y-4">
        {topDiagnosticos.map((diag, index) => {
          const relativePct = (diag.count / maxCount) * 100;
          const sharePct = totalCases > 0 ? ((diag.count / totalCases) * 100).toFixed(1) : 0;
          
          return (
            <div key={index} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black ${index < 3 ? 'bg-rose-500 text-white shadow-sm' : 'bg-black/5 dark:bg-white/5 text-secondary-custom'}`}>
                    {index + 1}
                  </span>
                  <span className="text-primary-custom truncate max-w-[280px] sm:max-w-md md:max-w-xl" title={diag.name}>
                    {diag.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-rose-500 font-black">{diag.count}</span>
                  <span className="text-secondary-custom opacity-70 font-medium">({sharePct}%)</span>
                </div>
              </div>
              
              <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${relativePct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
