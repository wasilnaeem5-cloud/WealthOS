'use client';

import React from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { useAuth } from '../../lib/context/AuthContext';
import { LayoutDashboard, TrendingUp, Target, GitCompare, Bot, Settings, Database, HardDrive, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, dataMode, userProfile } = useWealth();
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulator', label: 'Wealth Simulator', icon: TrendingUp },
    { id: 'goals', label: 'Goal Planner', icon: Target },
    { id: 'scenarios', label: 'What-If Lab', icon: GitCompare },
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            W
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              WealthOS
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400">
              Future Simulator
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
            {dataMode === 'supabase' ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Supabase</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">Demo (Local)</span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-400 hidden sm:block font-medium">
            {userProfile?.name || 'Alex Morgan'}
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-900 px-2 py-1.5 gap-1 bg-slate-950">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
