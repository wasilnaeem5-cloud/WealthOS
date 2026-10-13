'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'violet' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default: 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)]',
    cyan: 'bg-[#63DDF5]/10 text-[#63DDF5] border border-[#63DDF5]/20 font-semibold',
    violet: 'bg-[#8B7CFF]/10 text-[#8B7CFF] border border-[#8B7CFF]/20 font-semibold',
    success: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success)]/20 font-semibold',
    warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning)]/20 font-semibold',
    danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger)]/20 font-semibold',
    outline: 'bg-transparent text-[var(--text-muted)] border border-[var(--border-color)]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide leading-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const DemoBadge: React.FC<{ onReset?: () => void; className?: string }> = ({
  onReset,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs shadow-lg shadow-amber-500/5 ${className}`}
    >
      <div className="flex items-center gap-1.5 font-bold tracking-wider text-[11px] uppercase">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        DEMO MODE
      </div>
      <span className="hidden sm:inline text-amber-300/80 text-[11px]">
        Sample data — no personal info required
      </span>
      {onReset && (
        <button
          onClick={onReset}
          className="ml-1 text-[11px] font-semibold underline hover:text-amber-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Demo
        </button>
      )}
    </div>
  );
};
