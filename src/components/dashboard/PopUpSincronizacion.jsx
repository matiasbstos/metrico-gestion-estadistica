import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Sparkles, X, ShieldCheck } from 'lucide-react';

export default function PopUpSincronizacion({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300);
      }, 4500);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onClose]);

  if (!toast || !visible) return null;

  const isManual = toast.type === 'manual';

  return (
    <div className="fixed bottom-6 right-6 z-[99999] max-w-sm w-full animate-slide-up transition-all duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start gap-3.5 relative overflow-hidden theme-transition ${
        isManual 
          ? 'bg-slate-900/95 dark:bg-slate-950/95 text-white border-emerald-500/30 shadow-emerald-500/10'
          : 'bg-slate-900/90 dark:bg-slate-950/90 text-white border-indigo-500/30 shadow-indigo-500/10'
      }`}>
        {/* Top Glow Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isManual ? 'from-emerald-500 via-teal-400 to-emerald-500' : 'from-indigo-500 via-sky-400 to-indigo-500'
        } animate-pulse`} />

        {/* Icon Badge */}
        <div className={`p-2.5 rounded-xl shrink-0 border ${
          isManual 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
            : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
        }`}>
          {isManual ? (
            <CheckCircle2 className="w-5 h-5 animate-bounce" />
          ) : (
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black tracking-wide uppercase text-white truncate">
              {toast.title}
            </h4>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
              {toast.timestamp}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-semibold mt-1 leading-relaxed">
            {toast.message}
          </p>

          <div className="flex items-center gap-2 mt-2 pt-1 border-t border-white/10">
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              Paridad 100% Verificada
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          title="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
