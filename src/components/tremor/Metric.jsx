import React from 'react';

export default function Metric({ children, className = '', color, ...props }) {
  const colorClass = color ? `text-${color}-600 dark:text-${color}-400` : 'text-primary-custom';
  return (
    <p
      className={`font-black text-2xl md:text-3xl tracking-tight leading-none ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
