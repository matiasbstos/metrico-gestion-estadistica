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
