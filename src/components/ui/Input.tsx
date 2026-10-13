'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixSymbol?: string;
  suffixSymbol?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      prefixSymbol,
      suffixSymbol,
      leftIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixSymbol && (
            <span className="absolute left-3 text-xs font-mono font-medium text-[var(--text-muted)] pointer-events-none select-none">
              {prefixSymbol}
            </span>
          )}
          {leftIcon && !prefixSymbol && (
            <span className="absolute left-3 text-[var(--text-muted)] pointer-events-none shrink-0">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[var(--bg-main)] text-[var(--text-primary)] border ${
              error ? 'border-[var(--status-danger)]' : 'border-[var(--border-color)]'
            } rounded-xl py-2.5 text-xs font-medium focus:outline-none focus:border-[#63DDF5] focus:ring-1 focus:ring-[#63DDF5] transition-all disabled:opacity-50 ${
              prefixSymbol ? 'pl-8 pr-3' : leftIcon ? 'pl-9 pr-3' : 'px-3.5'
            } ${suffixSymbol ? 'pr-10' : ''} ${className}`}
            {...props}
          />

          {suffixSymbol && (
            <span className="absolute right-3 text-xs font-mono text-[var(--text-muted)] pointer-events-none select-none">
              {suffixSymbol}
            </span>
          )}
        </div>

        {error && <p className="text-[11px] font-medium text-[var(--status-danger)]">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-[var(--bg-main)] text-[var(--text-primary)] border ${
            error ? 'border-[var(--status-danger)]' : 'border-[var(--border-color)]'
          } rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#63DDF5] focus:ring-1 focus:ring-[#63DDF5] transition-all ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] font-medium text-[var(--status-danger)]">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
