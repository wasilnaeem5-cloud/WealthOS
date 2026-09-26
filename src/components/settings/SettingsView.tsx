'use client';

import React, { useState } from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { useAuth } from '../../lib/context/AuthContext';
import { Settings, Save, CheckCircle2, User, DollarSign, Database, LogOut, Shield } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    financialProfile,
    updateUserProfile,
    updateFinancialProfile,
    dataMode,
  } = useWealth();
  const { user, signOut } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState(userProfile?.name || 'Alex Morgan');
  const [age, setAge] = useState(userProfile?.age || 26);
  const [currency, setCurrency] = useState(userProfile?.currency || 'USD');

  const [income, setIncome] = useState(financialProfile?.income || 5000);
  const [expenses, setExpenses] = useState(financialProfile?.expenses || 3200);
  const [savings, setSavings] = useState(financialProfile?.savings || 12000);
  const [investments, setInvestments] = useState(financialProfile?.investments || 18000);
  const [debt, setDebt] = useState(financialProfile?.debt || 4000);

  if (!userProfile || !financialProfile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ name, age, currency });
    await updateFinancialProfile({
      income,
      expenses,
      savings,
      investments,
      debt,
      monthlyContribution: financialProfile.monthlyContribution,
      assumptions: { ...financialProfile.assumptions, currency },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Financial Profile & System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your baseline personal financial context, currency settings, and active data mode.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-indigo-400" />
            User Personal Context
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Current Age</label>
              <input
                type="number"
                min="13"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Currency Code</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Situation Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Financial Situation & Assets
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Monthly Gross Income</label>
              <input
                type="number"
                min="0"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Monthly Living Expenses</label>
              <input
                type="number"
                min="0"
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Liquid Bank Savings</label>
              <input
                type="number"
                min="0"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Existing Investments Portfolio</label>
              <input
                type="number"
                min="0"
                value={investments}
                onChange={(e) => setInvestments(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Outstanding Liabilities / Debt</label>
              <input
                type="number"
                min="0"
                value={debt}
                onChange={(e) => setDebt(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Account & Security Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            Account Security & Session
          </h3>
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="text-slate-200 font-medium">{user?.email || 'alex.morgan@example.com'}</div>
              <div className="text-slate-500 text-[11px]">Active Session ID: {user?.id}</div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Data Architecture Mode */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-4 h-4 text-cyan-400" />
            Persistence Layer Mode
          </h3>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Active Strategy: <strong className="text-slate-200">{dataMode === 'supabase' ? 'Supabase PostgreSQL' : 'Local Storage Demo Mode'}</strong></span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              DATA_MODE={dataMode}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Settings Saved!' : 'Save Financial Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
