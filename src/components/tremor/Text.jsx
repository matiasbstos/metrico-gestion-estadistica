import React from 'react';

export default function Text({ children, className = '', color, ...props }) {
  const colorClass = color ? `text-${color}-500` : 'text-secondary-custom';
  return (
    <p
      className={`text-xs md:text-sm font-semibold ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
