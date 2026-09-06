import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ title, text, highlight }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
      {show && (
        <div className="absolute z-[999] top-6 left-0 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 animate-in fade-in zoom-in duration-200">
          <div className="absolute -top-1 left-1.5 w-2 h-2 bg-slate-800 transform rotate-45 border-t border-l border-slate-700"></div>
          {title && <h4 className="font-bold text-slate-200 mb-1">{title}</h4>}
          <p className="text-slate-300 font-medium leading-relaxed">{text}</p>
          {highlight && (
            <div className="mt-2 pt-2 border-t border-slate-600/50">
              <span className="text-blue-300 font-bold">{highlight}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TooltipWrapper({ text, title, highlight, position = 'top', children, className = '' }) {
  const [show, setShow] = useState(false);

  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div className={`absolute z-[9999] pointer-events-none w-56 sm:w-64 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-150 text-left ${
          position === 'top' 
            ? 'bottom-full left-1/2 -translate-x-1/2 mb-2.5' 
            : 'top-full left-1/2 -translate-x-1/2 mt-2.5'
        }`}>
          {/* Triangular Arrow Pointer */}
          <div className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-slate-700 transform rotate-45 ${
            position === 'top' 
              ? '-bottom-1.5 border-b border-r' 
              : '-top-1.5 border-t border-l'
          }`} />
          {title && <h4 className="font-black text-indigo-300 mb-1 leading-snug text-xs">{title}</h4>}
          <p className="text-slate-200 font-medium leading-relaxed text-[11px]">{text}</p>
          {highlight && (
            <div className="mt-2 pt-1.5 border-t border-slate-700/60">
              <span className="text-emerald-400 font-bold text-[10px]">{highlight}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
