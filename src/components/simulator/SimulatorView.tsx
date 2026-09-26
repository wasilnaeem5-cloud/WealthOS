'use client';

import React, { useState } from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { Sliders, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const SimulatorView: React.FC = () => {
  const {
    financialProfile,
    userProfile,
    calculationResult,
    updateFinancialProfile,
    saveCurrentScenario,
  } = useWealth();

  const [scenarioName, setScenarioName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!financialProfile || !calculationResult) return null;

  const curr = userProfile?.currency || '$';
  const assumptions = financialProfile.assumptions;

  const handleReturnChange = (val: number) => {
    updateFinancialProfile({
      income: financialProfile.income,
      expenses: financialProfile.expenses,
      savings: financialProfile.savings,
      investments: financialProfile.investments,
      debt: financialProfile.debt,
      monthlyContribution: financialProfile.monthlyContribution,
      assumptions: { ...assumptions, expectedAnnualReturn: val },
    });
  };

  const handleMonthlyContribChange = (val: number) => {
    updateFinancialProfile({
      income: financialProfile.income,
      expenses: financialProfile.expenses,
      savings: financialProfile.savings,
      investments: financialProfile.investments,
      debt: financialProfile.debt,
      monthlyContribution: val,
      assumptions,
    });
  };

  const handleInflationChange = (val: number) => {
    updateFinancialProfile({
      income: financialProfile.income,
      expenses: financialProfile.expenses,
      savings: financialProfile.savings,
      investments: financialProfile.investments,
      debt: financialProfile.debt,
      monthlyContribution: financialProfile.monthlyContribution,
      assumptions: { ...assumptions, inflationRate: val },
    });
  };

  const handleStepUpChange = (val: number) => {
    updateFinancialProfile({
      income: financialProfile.income,
      expenses: financialProfile.expenses,
      savings: financialProfile.savings,
      investments: financialProfile.investments,
      debt: financialProfile.debt,
      monthlyContribution: financialProfile.monthlyContribution,
      assumptions: { ...assumptions, annualContributionIncrease: val },
    });
  };

  const handleDurationChange = (val: number) => {
    updateFinancialProfile({
      income: financialProfile.income,
      expenses: financialProfile.expenses,
      savings: financialProfile.savings,
      investments: financialProfile.investments,
      debt: financialProfile.debt,
      monthlyContribution: financialProfile.monthlyContribution,
      assumptions: { ...assumptions, projectionYears: val },
    });
  };

  const handleTimingChange = (timing: 'beginning' | 'end') => {
    updateFinancialProfile({
      income: financialProfile.income,
      expenses: financialProfile.expenses,
      savings: financialProfile.savings,
      investments: financialProfile.investments,
      debt: financialProfile.debt,
      monthlyContribution: financialProfile.monthlyContribution,
      assumptions: { ...assumptions, contributionTiming: timing },
    });
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) return;
    await saveCurrentScenario(scenarioName.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setScenarioName('');
  };

  const chartData = calculationResult.yearlyBreakdown.map((item) => ({
    year: `Year ${item.year}`,
    Nominal: item.nominalValue,
    Real: item.realValue,
    Invested: item.totalContributions,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Wealth Simulator & Interactive Inputs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Adjust financial assumptions in real-time to simulate future compound growth and inflation impact.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Scenario Name (e.g. Aggressive 10%)"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-56"
          />
          <button
            onClick={handleSaveScenario}
            disabled={!scenarioName.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all whitespace-nowrap"
          >
            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {isSaved ? 'Saved!' : 'Save Scenario'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            Simulation Assumptions
          </h3>

          {/* Monthly Investment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Monthly Investment</span>
              <span className="font-semibold text-indigo-300">{curr} {financialProfile.monthlyContribution.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="50"
              value={financialProfile.monthlyContribution}
              onChange={(e) => handleMonthlyContribChange(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Expected Annual Return */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Expected Annual Return</span>
              <span className="font-semibold text-emerald-400">{(assumptions.expectedAnnualReturn * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.25"
              step="0.005"
              value={assumptions.expectedAnnualReturn}
              onChange={(e) => handleReturnChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Inflation Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Expected Inflation Rate</span>
              <span className="font-semibold text-amber-400">{(assumptions.inflationRate * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.12"
              step="0.005"
              value={assumptions.inflationRate}
              onChange={(e) => handleInflationChange(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Annual Step-Up Increase */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Annual Contribution Step-Up</span>
              <span className="font-semibold text-violet-400">{(assumptions.annualContributionIncrease * 100).toFixed(0)}% / yr</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.20"
              step="0.01"
              value={assumptions.annualContributionIncrease}
              onChange={(e) => handleStepUpChange(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>

          {/* Projection Duration */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Projection Horizon</span>
              <span className="font-semibold text-cyan-400">{assumptions.projectionYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={assumptions.projectionYears}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Contribution Timing Convention */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Deposit Timing Convention</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTimingChange('beginning')}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  assumptions.contributionTiming === 'beginning'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Beginning of Month
              </button>
              <button
                type="button"
                onClick={() => handleTimingChange('end')}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  assumptions.contributionTiming === 'end'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                End of Month
              </button>
            </div>
          </div>
        </div>

        {/* Live Visualization Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Interactive Growth Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Nominal ({curr}{calculationResult.projectedNominalFutureValue.toLocaleString()}) vs Real ({curr}{calculationResult.projectedRealFutureValue.toLocaleString()})
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="text-emerald-400 font-semibold">
                + {curr} {calculationResult.totalInterestEarned.toLocaleString()} Interest
              </div>
              <div className="text-slate-400">
                {curr} {calculationResult.totalInvested.toLocaleString()} Invested
              </div>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${curr}${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(val: any) => [`${curr} ${Number(val).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Nominal" stroke="#6366f1" strokeWidth={3} dot={false} name="Nominal Value" />
                <Line type="monotone" dataKey="Real" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Real Value (Inflation-Adj)" />
                <Line type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={2} dot={false} name="Total Invested" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
