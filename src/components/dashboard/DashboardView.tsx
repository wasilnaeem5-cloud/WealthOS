'use client';

import React from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    userProfile,
    financialProfile,
    calculationResult,
    setActiveTab,
    dataMode,
  } = useWealth();

  if (!financialProfile || !calculationResult) {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 max-w-lg mx-auto my-12">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 inline-block">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-100">No Financial Profile Found</h3>
        <p className="text-xs text-slate-400">
          Please complete your personal financial setup to generate your deterministic projections.
        </p>
        <button
          onClick={() => (window.location.href = '/onboarding')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
        >
          Start Financial Setup
        </button>
      </div>
    );
  }

  const curr = userProfile?.currency || '$';
  const assumptions = financialProfile.assumptions;

  const chartData = calculationResult.yearlyBreakdown.map((item) => ({
    age: `Age ${item.age}`,
    year: `Yr ${item.year}`,
    Nominal: item.nominalValue,
    Real: item.realValue,
    Invested: item.totalContributions,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Person-Based Financial Projection Active
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic calculations based on current age {userProfile?.age}, {(assumptions.expectedAnnualReturn * 100).toFixed(1)}% return assumption, and {(assumptions.inflationRate * 100).toFixed(1)}% inflation.
            </p>
          </div>
        </div>
        <div className="text-xs px-3 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
          {assumptions.projectionYears}-Year Horizon
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Current Net Worth
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">
              {curr} {calculationResult.netWorthCurrent.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Savings ({curr}{financialProfile.savings.toLocaleString()}) + Investments ({curr}{financialProfile.investments.toLocaleString()}) - Debt ({curr}{financialProfile.debt.toLocaleString()})
            </div>
          </div>
        </div>

        {/* Monthly Surplus */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Monthly Surplus
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">
              {curr} {calculationResult.monthlySurplus.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Income ({curr}{financialProfile.income.toLocaleString()}) - Expenses ({curr}{financialProfile.expenses.toLocaleString()})
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Savings / Invest Rate
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">
              {calculationResult.savingsRate}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Allocated Monthly: {curr}{financialProfile.monthlyContribution.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Projected Wealth */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">
              Projected Wealth ({assumptions.projectionYears}y)
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-200">
              {curr} {calculationResult.projectedNominalFutureValue.toLocaleString()}
            </div>
            <div className="text-xs text-indigo-300/80 mt-1">
              Real (Inflation-Adj): {curr} {calculationResult.projectedRealFutureValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Projection Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Financial Trajectory Projection
            </h2>
            <p className="text-xs text-slate-400">
              Comparing Total Invested vs Nominal Future Value vs Inflation-Adjusted Real Value over time.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition-all"
          >
            Open Wealth Simulator
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="age" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${curr}${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                formatter={(val: any) => [`${curr} ${Number(val).toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="Nominal" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorNominal)" name="Nominal Value" />
              <Area type="monotone" dataKey="Real" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" name="Real Value (Inflation-Adj)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('goals')}
          className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-left hover:border-slate-700 hover:bg-slate-900/60 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Goal Planner</h4>
            <p className="text-xs text-slate-400 mt-1">
              Track target deadlines, required monthly contributions, and achievement gap.
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-left hover:border-slate-700 hover:bg-slate-900/60 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">What-If Lab</h4>
            <p className="text-xs text-slate-400 mt-1">
              Compare baseline vs alternative return rates and step-up scenarios side-by-side.
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-left hover:border-slate-700 hover:bg-slate-900/60 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">AI Copilot</h4>
            <p className="text-xs text-slate-400 mt-1">
              Ask questions to receive structured explanations grounded strictly in engine outputs.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
