import React from 'react';

const decorationColors = {
  indigo: 'border-indigo-500 dark:border-indigo-400',
  emerald: 'border-emerald-500 dark:border-emerald-400',
  purple: 'border-purple-500 dark:border-purple-400',
  violet: 'border-violet-500 dark:border-violet-400',
  rose: 'border-rose-500 dark:border-rose-400',
  amber: 'border-amber-500 dark:border-amber-400',
  blue: 'border-blue-500 dark:border-blue-400',
  cyan: 'border-cyan-500 dark:border-cyan-400',
  slate: 'border-slate-500 dark:border-slate-400',
};

const decorationAlignments = {
  top: 'border-t-4',
  bottom: 'border-b-4',
  left: 'border-l-4',
  right: 'border-r-4',
};

export default function Card({
  children,
  className = '',
  decoration = '',
  decorationColor = 'indigo',
  ...props
}) {
  const decAlignmentClass = decorationAlignments[decoration] || '';
  const decColorClass = decoration ? (decorationColors[decorationColor] || 'border-indigo-500') : '';

  return (
    <div
      className={`relative w-full text-left rounded-2xl p-6 bg-card-custom border border-card-custom shadow-xs hover:shadow-sm transition-all duration-200 ${decAlignmentClass} ${decColorClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
