import React, { useMemo } from 'react';

const barColorMap = {
  emerald: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  rose: 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
  amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  violet: 'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  indigo: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
  blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  cyan: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  slate: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
};

const barFillColorMap = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  violet: 'bg-violet-500',
  indigo: 'bg-indigo-500',
  blue: 'bg-blue-500',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-500',
};

export default function BarList({
  data = [],
  valueFormatter = (val) => val?.toLocaleString?.('es-CL') ?? val,
  color = 'indigo',
  sortOrder = 'descending',
  className = '',
  ...props
}) {
  const sortedData = useMemo(() => {
    if (sortOrder === 'none') return data;
    return [...data].sort((a, b) => {
      return sortOrder === 'ascending' ? a.value - b.value : b.value - a.value;
    });
  }, [data, sortOrder]);

  const maxValue = useMemo(() => {
    return Math.max(...sortedData.map((item) => Number(item.value) || 0), 1);
  }, [sortedData]);

  return (
    <div className={`w-full space-y-2 select-none ${className}`} {...props}>
      {sortedData.map((item, index) => {
        const itemColor = item.color || color;
        const barBg = barColorMap[itemColor] || barColorMap.indigo;
        const fillBar = barFillColorMap[itemColor] || barFillColorMap.indigo;
        const widthPercent = Math.max(3, Math.round(((Number(item.value) || 0) / maxValue) * 100));
        const Icon = item.icon;

        return (
          <div
            key={item.key ?? index}
            className="group relative flex items-center justify-between h-8 rounded-lg overflow-hidden transition-all duration-150"
          >
            {/* Background Bar */}
            <div
              className={`absolute top-0 bottom-0 left-0 rounded-lg transition-all duration-300 ${barBg}`}
              style={{ width: `${widthPercent}%` }}
            >
              <div className={`w-1 h-full rounded-l-lg ${fillBar}`} />
            </div>

            {/* Left Label */}
            <div className="relative z-10 flex items-center gap-2 pl-2.5 truncate max-w-[70%]">
              {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0 text-secondary-custom group-hover:text-primary-custom" />}
              <span className="text-xs font-bold text-primary-custom truncate">
                {item.name}
              </span>
            </div>

            {/* Right Value */}
            <div className="relative z-10 pr-2.5 flex-shrink-0">
              <span className="text-xs font-black text-primary-custom font-mono">
                {valueFormatter(item.value)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
