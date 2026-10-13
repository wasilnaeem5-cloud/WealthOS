'use client';

import React from 'react';

export interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (val: number) => string;
  unit?: string;
  helperText?: string;
  className?: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  unit = '',
  helperText,
  className = '',
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value.toLocaleString()}${unit}`;

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[var(--text-secondary)]">{label}</label>
        <span className="text-xs font-bold font-mono-numbers px-2.5 py-1 rounded-lg bg-[var(--bg-main)] text-[#63DDF5] border border-[#63DDF5]/20">
          {displayValue}
        </span>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-[#63DDF5] focus:outline-none focus:ring-2 focus:ring-[#63DDF5]/40"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
        <span>{formatValue ? formatValue(min) : `${min}${unit}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${unit}`}</span>
      </div>

      {helperText && <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>}
    </div>
  );
};
