'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { useAuth } from '../../lib/context/AuthContext';
import { useTheme } from '../ui/ThemeContext';
import { DemoBadge } from '../ui/Badge';
import { Logo } from '../ui/Logo';
import {
  Bot,
  GitCompare,
  LayoutDashboard,
  LogOut,
  Moon,
  MoreHorizontal,
  Settings,
  SlidersHorizontal,
  Sun,
  Target,
  X,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'simulator', label: 'Simulator', icon: SlidersHorizontal },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'scenarios', label: 'What-If Lab', icon: GitCompare },
  { id: 'copilot', label: 'AI Copilot', icon: Bot },
];

// Items shown in the mobile bottom nav (max 4 + More)
const mobileBottomIds = ['dashboard', 'simulator', 'goals', 'scenarios'];

export const Navbar: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const { activeTab, setActiveTab, userProfile, reloadAllData } = useWealth();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" menu on outside click or tap
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [moreOpen]);

  // Close "More" menu on Escape
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [moreOpen]);

  const handleMoreNav = (id: string) => {
    setActiveTab(id);
    setMoreOpen(false);
  };

  const handleSignOut = () => {
    setMoreOpen(false);
    void signOut();
  };

  // Items shown in "More" menu
  const moreMenuItems = navItems.filter((item) => !mobileBottomIds.includes(item.id));
  // Is any "More" item currently active?
  const moreActive = activeTab === 'settings' || moreMenuItems.some((item) => item.id === activeTab);

  return (
    <>
      {/* ─── Desktop sidebar ──────────────────────────────────────────────── */}
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

      {/* ─── Mobile top header ────────────────────────────────────────────── */}
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

      {/* ─── Mobile backdrop when More menu is open ─────────────────────────── */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Mobile bottom navigation ─────────────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[var(--border-color)] bg-[var(--bg-surface)]/96 px-1 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      >
        {/* 4 primary nav items */}
        {navItems
          .filter((item) => mobileBottomIds.includes(item.id))
          .map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-label={label}
                className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-1 text-[10px] font-semibold transition active:scale-95 ${
                  active ? 'text-[var(--accent-cyan)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'chart-glow' : ''}`} aria-hidden="true" />
                <span className="truncate max-w-full">{label === 'Overview' ? 'Home' : label === 'What-If Lab' ? 'What-If' : label}</span>
              </button>
            );
          })}

        {/* More button */}
        <div ref={moreRef} className="relative flex-1 min-w-0 flex justify-center">
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            aria-label="More navigation options"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-1 text-[10px] font-semibold transition active:scale-95 ${
              moreActive || moreOpen ? 'text-[var(--accent-cyan)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {moreOpen ? <X className="h-[18px] w-[18px]" aria-hidden="true" /> : <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />}
            <span>More</span>
          </button>

          {/* More menu popup */}
          {moreOpen && (
            <div
              role="menu"
              className="absolute bottom-full right-1 mb-3 w-52 overflow-hidden rounded-2xl border border-[var(--border-color-strong)] bg-[var(--bg-surface-elevated)] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              {/* Dynamic nav items in More (currently: AI Copilot) */}
              {moreMenuItems.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    role="menuitem"
                    onClick={() => handleMoreNav(id)}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition ${
                      active
                        ? 'bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="mx-3 border-t border-[var(--border-color)]" />

              {/* Settings */}
              <button
                role="menuitem"
                onClick={() => handleMoreNav('settings')}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition ${
                  activeTab === 'settings'
                    ? 'bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Settings className="h-[18px] w-[18px] shrink-0 opacity-80" aria-hidden="true" />
                Settings
              </button>

              {/* Divider */}
              <div className="mx-3 border-t border-[var(--border-color)]" />

              {/* Sign out / Exit demo */}
              {demo ? (
                <Link
                  href="/"
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                  onClick={() => setMoreOpen(false)}
                >
                  <LogOut className="h-[18px] w-[18px] shrink-0 opacity-80" aria-hidden="true" />
                  Exit demo
                </Link>
              ) : (
                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--status-danger-bg)] hover:text-[var(--status-danger)]"
                >
                  <LogOut className="h-[18px] w-[18px] shrink-0 opacity-80" aria-hidden="true" />
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
