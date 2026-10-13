'use client';

import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KpiCardProps {
  label: string;
  value: string | number;
  currency?: string;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  highlight?: boolean;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  currency,
  subtext,
  icon,
  trend,
  highlight = false,
  className = '',
}) => {
  const formattedValue =
    typeof value === 'number'
      ? `${currency ? currency + ' ' : ''}${value.toLocaleString()}`
      : value;

  return (
    <Card
      variant={highlight ? 'accent' : 'elevated'}
      hoverEffect
      className={`relative overflow-hidden ${className}`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#63DDF5]/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[#63DDF5] shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl lg:text-3xl font-bold font-mono-numbers tracking-tight text-[var(--text-primary)]">
          {formattedValue}
        </div>

        {(subtext || trend) && (
          <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-muted)]">
            {trend && (
              <span
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                  trend.direction === 'up'
                    ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]'
                    : trend.direction === 'down'
                    ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'
                    : 'bg-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
                {trend.text}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
