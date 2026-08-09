import React from 'react';
import { Database, RefreshCw, CheckCircle2, CloudDownload, AlertCircle } from 'lucide-react';

export default function BarraProgresoCarga({ syncProgress }) {
  if (!syncProgress || !syncProgress.active) return null;

  const { pct = 0, message = 'Cargando datos...', loadedCount = 0, totalCount = 0, isHistorical = false } = syncProgress;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-fade-in shadow-2xl">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 text-white rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo animado */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 transition-all duration-300"
          style={{ opacity: pct / 100 }}
        />

        <div className="relative z-10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {isHistorical ? (
                  <CloudDownload className="w-5 h-5 animate-bounce text-purple-400" />
                ) : (
                  <Database className="w-5 h-5 animate-pulse text-indigo-400" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {isHistorical ? 'Consulta Histórica En Vivo' : 'Sincronización Pre-Caché (Últimos 6 Meses)'}
                </h4>
                <p className="text-[11px] font-medium text-slate-400 line-clamp-1">
                  {message}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-sm font-black text-emerald-400 font-mono">
                {Math.min(100, Math.max(0, Math.round(pct)))}%
              </span>
            </div>
          </div>

          {/* Barra de Progreso Principal */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/50 relative overflow-hidden"
              style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </div>
          </div>

          {/* Cifras de Registros Descargados */}
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span>
              {totalCount > 0 
                ? `${loadedCount.toLocaleString()} de ${totalCount.toLocaleString()} registros`
                : `${loadedCount.toLocaleString()} registros procesados`}
            </span>
            <span className="flex items-center gap-1 text-indigo-300 font-bold">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Sincronizando...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
