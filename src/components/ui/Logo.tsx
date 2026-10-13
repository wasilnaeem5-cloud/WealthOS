'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const LogoMark: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#0C1727] via-[#101D30] to-[#0C1727] border border-[#63DDF5]/30 shadow-lg shadow-[#63DDF5]/10 overflow-hidden shrink-0 ${dimensions} ${className}`}
    >
      {/* Background glow inside mark */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#63DDF5]/20 via-transparent to-[#8B7CFF]/20 opacity-70" />
      
      {/* Dynamic trajectory graph icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 relative z-10 text-[#63DDF5]"
      >
        <path
          d="M3 17L8.5 11.5L12.5 15.5L21 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 7H21V12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="7" r="1.5" fill="#8B7CFF" />
      </svg>
    </div>
  );
};

export const Wordmark: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-1 font-bold tracking-tight text-[var(--text-primary)] ${textSizes} ${className}`}>
      <span>WEALTH</span>
      <span className="text-[#63DDF5]">OS</span>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <Wordmark size={size} />
          <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#63DDF5]/10 text-[#63DDF5] border border-[#63DDF5]/20 font-semibold">
            LAB
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-[var(--text-muted)] font-medium tracking-wide">
            Model your financial future
          </span>
        )}
      </div>
    </div>
  );
};
