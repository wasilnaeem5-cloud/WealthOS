'use client';

import Link from 'next/link';
import React from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../ui/ThemeContext';
import { DemoBadge } from '../ui/Badge';
import { Logo } from '../ui/Logo';
import { Bot, GitCompare, LayoutDashboard, LogOut, Moon, Settings, SlidersHorizontal, Sun, Target } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'simulator', label: 'Simulator', icon: SlidersHorizontal },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'scenarios', label: 'What-If Lab', icon: GitCompare },
  { id: 'copilot', label: 'AI Copilot', icon: Bot },
];

export const Navbar: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const { activeTab, setActiveTab, userProfile, reloadAllData } = useWealth();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)]/92 p-4 backdrop-blur-xl lg:flex">
        <Link href={demo ? '/demo' : '/dashboard'} className="rounded-2xl px-2 py-3 transition hover:bg-[var(--bg-surface-elevated)]">
          <Logo showTagline />
        </Link>

        <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--text-muted)]">Workspace</div>
        <nav aria-label="Main navigation" className="mt-2 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? 'bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)] ring-1 ring-[var(--accent-cyan)]/15'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'chart-glow' : 'opacity-75'}`} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-[var(--border-color)] pt-4">
          {demo && <DemoBadge onReset={() => reloadAllData()} className="w-full justify-center" />}

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              activeTab === 'settings' ? 'bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </button>

          {demo ? (
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]">
              <LogOut className="h-[18px] w-[18px]" />
              Exit demo
            </Link>
          ) : (
            <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--status-danger-bg)] hover:text-[var(--status-danger)]">
              <LogOut className="h-[18px] w-[18px]" />
              Sign out
            </button>
          )}

          <div className="mt-2 flex items-center gap-3 rounded-xl bg-[var(--bg-surface-soft)] px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-violet-soft)] text-sm font-bold text-[var(--accent-violet)]">
              {userProfile?.name?.slice(0, 1).toUpperCase() || 'U'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{demo ? 'Demo User' : userProfile?.name || 'Your profile'}</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{demo ? 'Exhibition sample' : 'Personal workspace'}</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-main)]/88 px-4 backdrop-blur-xl lg:ml-64 lg:px-8">
        <Link href={demo ? '/demo' : '/dashboard'} className="lg:hidden">
          <Logo size="sm" />
        </Link>
        <div className="hidden lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[var(--accent-cyan)]">Future Finance Lab</p>
          <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{navItems.find((item) => item.id === activeTab)?.label || 'Settings'}</p>
        </div>
        <div className="flex items-center gap-2">
          {demo && <DemoBadge onReset={() => reloadAllData()} className="hidden md:inline-flex" />}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-[var(--text-secondary)] transition hover:border-[var(--border-color-hover)] hover:text-[var(--accent-cyan)]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-[var(--border-color)] bg-[var(--bg-surface)]/96 px-2 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        {navItems.filter((item) => ['dashboard', 'simulator', 'goals', 'copilot'].includes(item.id)).map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition ${active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>
              <Icon className="h-[18px] w-[18px]" />
              {label === 'Overview' ? 'Home' : label === 'AI Copilot' ? 'AI' : label}
            </button>
          );
        })}
      </nav>
    </>
  );
};
