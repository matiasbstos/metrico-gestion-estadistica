import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const tremorColorPalette = [
  '#10b981', // emerald
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

const colorNameToHex = {
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  violet: '#8b5cf6',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  slate: '#64748b',
};

export default function DonutChart({
  data = [],
  category = 'value',
  index = 'name',
  colors = tremorColorPalette,
  valueFormatter = (val) => val?.toLocaleString?.('es-CL') ?? val,
  label = '',
  className = '',
  ...props
}) {
  const resolvedColors = (colors || []).map(
    (c) => colorNameToHex[c] || c || '#6366f1'
  );

  return (
    <div className={`relative w-full h-48 flex items-center justify-center ${className}`} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={category}
            nameKey={index}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="85%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.color ? (colorNameToHex[entry.color] || entry.color) : (resolvedColors[idx % resolvedColors.length])}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0];
              return (
                <div className="bg-card-custom p-2.5 rounded-xl shadow-xl border border-card-custom text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-secondary-custom">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.payload?.fill || resolvedColors[0] }}
                    />
                    <span>{p.name}</span>
                  </div>
                  <div className="text-primary-custom font-black font-mono pl-4">
                    {valueFormatter(p.value)}
                  </div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
