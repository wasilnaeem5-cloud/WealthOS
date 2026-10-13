'use client';

import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cyan' | 'violet' | 'success' | 'warning';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  variant = 'cyan',
  showPercentage = false,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const gradients = {
    cyan: 'bg-gradient-to-r from-[#0891B2] to-[#63DDF5]',
    violet: 'bg-gradient-to-r from-[#6D5CE7] to-[#8B7CFF]',
    success: 'bg-gradient-to-r from-emerald-600 to-[#5ED6A0]',
    warning: 'bg-gradient-to-r from-amber-600 to-[#F4C96B]',
  }[variant];

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] font-medium">
          <span>Progress</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)] ${heights}`}>
        <div
          className={`h-full ${gradients} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
