'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated' | 'glass' | 'accent' | 'outlined';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-[var(--bg-surface)] border border-[var(--border-color)]',
    elevated: 'bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] shadow-xl shadow-black/20',
    glass: 'glass-panel shadow-2xl shadow-black/30',
    accent: 'bg-gradient-to-b from-[#101D30] to-[#0C1727] border border-[#63DDF5]/20 shadow-lg shadow-[#63DDF5]/5',
    outlined: 'bg-transparent border border-[var(--border-color)]',
  }[variant];

  const hoverStyle = hoverEffect
    ? 'transition-all duration-300 hover:border-[var(--border-color-hover)] hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl p-6 ${variantStyles} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3
    className={`text-base font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-[var(--text-muted)] font-normal ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] ${className}`}
    {...props}
  >
    {children}
  </div>
);
