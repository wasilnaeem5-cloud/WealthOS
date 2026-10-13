'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-xs font-semibold rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm font-semibold rounded-2xl gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#0891B2] to-[#0284C7] dark:from-[#63DDF5] dark:to-[#38BDF8] text-white dark:text-[#07111F] hover:opacity-95 shadow-md shadow-[#63DDF5]/15 focus-visible:ring-2 focus-visible:ring-[#63DDF5]',
    accent:
      'bg-gradient-to-r from-[#6D5CE7] to-[#8B7CFF] text-white hover:opacity-95 shadow-md shadow-[#8B7CFF]/20 focus-visible:ring-2 focus-visible:ring-[#8B7CFF]',
    secondary:
      'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] hover:bg-[var(--bg-surface-elevated)]/80 focus-visible:ring-2 focus-visible:ring-[#63DDF5]',
    outline:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-cyan)] hover:bg-[#63DDF5]/5 focus-visible:ring-2 focus-visible:ring-[#63DDF5]',
    ghost:
      'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] focus-visible:ring-2 focus-visible:ring-[#63DDF5]',
    danger:
      'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger)]/30 hover:bg-[var(--status-danger)] hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--status-danger)]',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
