import React from 'react';
import { Sparkles, CheckCircle2, RefreshCw, ShieldCheck, Database, Check } from 'lucide-react';

export default function ModalProgresoConciliacion({
  isOpen,
  progress = 0,
  stageText = 'Iniciando conciliación...',
  indicatorName = 'General',
  isCompleted = false,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 theme-transition relative overflow-hidden animate-scale-up">
        
        {/* Glow dinámico de fondo */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-teal-500/10 pointer-events-none transition-all duration-300"
          style={{ opacity: Math.max(0.3, progress / 100) }}
        />

        {/* Icono Central / Spinner */}
        <div className="relative flex items-center justify-center pt-2">
          {isCompleted ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center animate-bounce-in shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-full animate-pulse absolute flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </div>

        {/* Textos de Estado */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            {indicatorName === 'General' ? 'Conciliación Global SSOT' : `Conciliación: ${indicatorName}`}
          </span>
          <h3 className="text-xl font-black text-primary-custom tracking-tight mt-1">
            {isCompleted ? '¡Conciliación 100% Exitosa!' : 'Ejecutando Conciliación de Datos...'}
          </h3>
          <p className="text-xs text-secondary-custom font-medium leading-relaxed">
            {stageText}
          </p>
        </div>

        {/* Barra de Progreso Interna */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-card-custom p-0.5 relative z-10">
          <div 
            className={`h-full rounded-full transition-all duration-300 shadow-md ${
              isCompleted 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : 'bg-gradient-to-r from-indigo-600 via-sky-400 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          />
        </div>

        {/* Estado Final con Botón de Cierre */}
        <div className="pt-2 relative z-10 flex flex-col items-center gap-3">
          {isCompleted ? (
            <div className="space-y-3 w-full animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Paridad y Coherencia 100% Validadas</span>
              </span>

              <div>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Entendido y Continuar
                </button>
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-secondary-custom font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Sincronizando registros con el motor SSOT...</span>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
