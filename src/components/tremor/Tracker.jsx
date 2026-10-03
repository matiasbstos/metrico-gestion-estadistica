import React, { useState } from 'react';

const blockColors = {
  emerald: 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20',
  rose: 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20',
  amber: 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20',
  yellow: 'bg-yellow-500 hover:bg-yellow-400',
  blue: 'bg-blue-500 hover:bg-blue-400',
  indigo: 'bg-indigo-500 hover:bg-indigo-400',
  slate: 'bg-slate-300 dark:bg-slate-700',
  gray: 'bg-slate-300 dark:bg-slate-700',
};

export default function Tracker({ data = [], className = '', ...props }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className={`relative w-full ${className}`} {...props}>
      <div className="flex items-center space-x-1 h-5 w-full">
        {data.map((item, idx) => {
          const colorClass = blockColors[item.color] || blockColors.emerald;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.key ?? idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex-1 h-full rounded-[2.5px] first:rounded-l-lg last:rounded-r-lg transition-all duration-150 cursor-pointer relative group ${colorClass} ${
                isHovered ? 'scale-y-125 z-10' : ''
              }`}
            >
              {/* Tremor Hover Tooltip */}
              {isHovered && item.tooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                  <div className="text-center font-black">{item.tooltip}</div>
                  {item.label && (
                    <div className="text-slate-300 text-[9px] text-center mt-0.5">{item.label}</div>
                  )}
                  {/* Arrow pointer */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-950" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
