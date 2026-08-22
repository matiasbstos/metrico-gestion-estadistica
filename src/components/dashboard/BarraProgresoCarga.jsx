import React from 'react';
import { Database, RefreshCw, CloudDownload } from 'lucide-react';

export default function BarraProgresoCarga({ 
  syncProgress, 
  isOverlayOpen = false,
  isFiltering = false,
  loadingKpis = false,
  syncStatus = 'synced'
}) {
  const isSyncActive = syncProgress && syncProgress.active;
  const isSyncingStatus = syncStatus === 'syncing' || syncStatus === 'connecting';
  const showTopBar = isSyncActive || isSyncingStatus || isFiltering || loadingKpis;

  if (!showTopBar && !isSyncActive) return null;

  const { pct = 0, message = 'Cargando datos...', loadedCount = 0, totalCount = 0, isHistorical = false } = syncProgress || {};

  const isIndeterminate = (!pct || pct <= 0) && (isFiltering || loadingKpis || isSyncingStatus);

  return (
    <>
      {/* 1. BARRA SUPERIOR FIJA EN EL BORDE DE LA PANTALLA (TOP SCREEN LOADING BAR - DESDE EL MINUTO UNO) */}
      {showTopBar && (
        <div className="fixed top-0 left-0 right-0 z-[999999] h-1.5 bg-slate-900/80 overflow-hidden pointer-events-none backdrop-blur-xs transition-opacity duration-300">
          {isIndeterminate ? (
            <div className="h-full w-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" style={{ animationDuration: '1.2s' }} />
            </div>
          ) : (
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 shadow-md shadow-indigo-500/50 transition-all duration-300 relative overflow-hidden"
              style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer" />
            </div>
          )}
        </div>
      )}

      {/* 2. WIDGET FLOTANTE DE NOTIFICACIÓN DE AVANCE (SOLO SI SYNC ESTÁ ACTIVO Y NO HAY OVERLAY BLOQUEANTE) */}
      {isSyncActive && !isOverlayOpen && (
        <div className="fixed bottom-6 right-6 z-[100000] max-w-md w-full animate-fade-in shadow-2xl">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 text-white rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            {/* Glow de fondo animado */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-indigo-500/10 transition-all duration-300 pointer-events-none"
              style={{ opacity: pct ? pct / 100 : 0.4 }}
            />

            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {isHistorical ? (
                      <CloudDownload className="w-5 h-5 animate-bounce text-sky-400" />
                    ) : (
                      <Database className="w-5 h-5 animate-pulse text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      {isHistorical ? 'Consulta Histórica En Vivo' : 'Sincronización de Datos'}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 line-clamp-1">
                      {message}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-sm font-black text-sky-400 font-mono">
                    {pct > 0 ? `${Math.min(100, Math.max(0, Math.round(pct)))}%` : 'Procesando...'}
                  </span>
                </div>
              </div>

              {/* Barra de Progreso Principal */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-400 rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/50 relative overflow-hidden"
                  style={{ width: `${Math.min(100, Math.max(4, pct || 10))}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>

              {/* Cifras de Registros Descargados */}
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span>
                  {totalCount > 0 
                    ? `${loadedCount.toLocaleString()} de ${totalCount.toLocaleString()} registros`
                    : `${(loadedCount || 0).toLocaleString()} registros procesados`}
                </span>
                <span className="flex items-center gap-1 text-indigo-300 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Sincronizando...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
