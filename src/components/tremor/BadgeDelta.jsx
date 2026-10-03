import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function BadgeDelta({
  deltaType = 'increase',
  isIncreasePositive = true,
  size = 'sm',
  tooltip,
  children,
  className = '',
  ...props
}) {
  const isIncrease = deltaType === 'increase' || deltaType === 'moderateIncrease';
  const isDecrease = deltaType === 'decrease' || deltaType === 'moderateDecrease';
  const isUnchanged = deltaType === 'unchanged';

  // Determine if the delta is considered "positive" (green) or "negative" (red)
  let isPositive = false;
  if (isIncrease) {
    isPositive = isIncreasePositive;
  } else if (isDecrease) {
    isPositive = !isIncreasePositive;
  }

  // Icons
  let Icon = TrendingUp;
  if (deltaType === 'moderateIncrease') Icon = ArrowUpRight;
  else if (deltaType === 'decrease') Icon = TrendingDown;
  else if (deltaType === 'moderateDecrease') Icon = ArrowDownRight;
  else if (isUnchanged) Icon = Minus;

  // Sizes
  const sizeClasses = {
    xs: 'text-[9.5px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  }[size] || 'text-xs px-2 py-0.5 gap-1';

  // Colors
  let colorClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20';
  if (!isUnchanged) {
    if (isPositive) {
      colorClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20';
    } else {
      colorClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20';
    }
  }

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center font-black rounded-lg transition-all select-none ${sizeClasses} ${colorClasses} ${className}`}
      {...props}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {children && <span className="whitespace-nowrap">{children}</span>}
    </span>
  );
}
