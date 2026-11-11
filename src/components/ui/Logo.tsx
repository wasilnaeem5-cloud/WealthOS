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
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#071210] via-[#0C1E16] to-[#071210] border border-[#10B981]/30 shadow-lg shadow-[#10B981]/10 overflow-hidden shrink-0 ${dimensions} ${className}`}
    >
      {/* Layered background glow — emerald to gold */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/20 via-transparent to-[#F59E0B]/20 opacity-70" />

      {/* Finance Manager logo: coin with dollar sign + gold growth pip */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 relative z-10"
      >
        {/* Outer coin ring */}
        <circle cx="12" cy="12" r="8.5" stroke="#10B981" strokeWidth="1.4" opacity="0.35" />
        {/* Dollar sign body */}
        <path
          d="M12 6.5v11"
          stroke="#10B981"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9.5 9C9.5 8 10.4 7.5 12 7.5s2.5.5 2.5 1.5-1.2 1.75-2.5 1.75S9.5 11.65 9.5 12.75 10.4 15 12 15s2.5-.5 2.5-1.5"
          stroke="#10B981"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Gold growth pip — top-right corner accent */}
        <circle cx="18.5" cy="6" r="2.2" fill="#F59E0B" />
        {/* Upward arrow inside gold pip */}
        <path
          d="M17.6 6.8l.9-1.6.9 1.6"
          stroke="#071210"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
      <span>Finance</span>
      <span className="text-[#10B981]">Manager</span>
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
          <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-semibold">
            PRO
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-[var(--text-muted)] font-medium tracking-wide">
            Your financial future, clearly
          </span>
        )}
      </div>
    </div>
  );
};
