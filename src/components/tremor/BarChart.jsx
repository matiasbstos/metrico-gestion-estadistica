import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const tremorColors = {
  indigo: '#6366f1',
  purple: '#a855f7',
  violet: '#8b5cf6',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  slate: '#64748b',
};

export default function BarChart({
  data = [],
  index = 'name',
  categories = [],
  colors = ['indigo', 'purple', 'emerald'],
  valueFormatter = (val) => val?.toLocaleString?.('es-CL') ?? val,
  layout = 'horizontal',
  stack = false,
  yAxisWidth = 50,
  showLegend = true,
  showGridLines = true,
  className = '',
  ...props
}) {
  const resolvedColors = categories.map((cat, idx) => {
    const col = colors[idx % colors.length];
    return tremorColors[col] || col || '#6366f1';
  });

  return (
    <div className={`w-full h-80 ${className}`} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
          barGap={4}
          barCategoryGap="20%"
        >
          {showGridLines && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(128,128,128,0.15)"
            />
          )}

          <XAxis
            dataKey={index}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary, #64748b)', fontSize: 12, fontWeight: 'bold' }}
          />

          <YAxis
            width={yAxisWidth}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary, #64748b)', fontSize: 12, fontWeight: 'bold' }}
            tickFormatter={valueFormatter}
          />

          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              return (
                <div className="bg-card-custom p-3 rounded-2xl shadow-xl border border-card-custom min-w-[200px] space-y-2">
                  <div className="border-b border-card-custom/40 pb-1">
                    <span className="text-xs font-black text-primary-custom">{label}</span>
                  </div>
                  <div className="space-y-1">
                    {payload.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-secondary-custom">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}
                        </span>
                        <span className="font-black text-primary-custom font-mono">
                          {valueFormatter(entry.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />

          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold' }}
            />
          )}

          {categories.map((cat, idx) => (
            <Bar
              key={cat}
              dataKey={cat}
              name={cat}
              fill={resolvedColors[idx]}
              stackId={stack ? 'a' : undefined}
              radius={stack ? [0, 0, 0, 0] : [6, 6, 0, 0]}
              barSize={stack ? 26 : 18}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
