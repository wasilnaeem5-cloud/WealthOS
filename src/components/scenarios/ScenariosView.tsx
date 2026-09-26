'use client';

import React, { useState } from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { ScenarioService } from '../../lib/services/scenarioService';
import { GitCompare, ArrowUpRight, TrendingUp, Shield, Trash2 } from 'lucide-react';
import { FinancialAssumptions } from '../../types';
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

const scenarioService = new ScenarioService();

export const ScenariosView: React.FC = () => {
  const { financialProfile, userProfile, scenarios, deleteScenario } = useWealth();

  const [altAssumptions, setAltAssumptions] = useState<FinancialAssumptions>({
    expectedAnnualReturn: 0.11,
    inflationRate: 0.03,
    contributionFrequency: 'monthly',
    contributionTiming: 'beginning',
    annualContributionIncrease: 0.08,
    projectionYears: financialProfile?.assumptions.projectionYears || 20,
    currency: userProfile?.currency || 'USD',
  });

  if (!financialProfile || !userProfile) return null;

  const curr = userProfile.currency || '$';
  const baselineAssumptions = financialProfile.assumptions;

  const comparison = scenarioService.compareScenarios(
    financialProfile,
    baselineAssumptions,
    altAssumptions,
    userProfile.age
  );

  const chartData = comparison.baselineResult.yearlyBreakdown.map((baseItem, idx) => {
    const altItem = comparison.alternateResult.yearlyBreakdown[idx];
    return {
      year: `Yr ${baseItem.year}`,
      Baseline: baseItem.nominalValue,
      Alternate: altItem ? altItem.nominalValue : baseItem.nominalValue,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-purple-400" />
          What-If Lab & Scenario Comparison
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compare your baseline projection against alternative return rates, inflation expectations, and annual step-up assumptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alternate Assumptions Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Alternate Scenario Parameters
            </h3>
            <span className="text-xs text-purple-400 font-medium">Lab Controls</span>
          </div>

          {/* Alternate Return */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Alternate Annual Return</span>
              <span className="font-semibold text-purple-400">{(altAssumptions.expectedAnnualReturn * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.25"
              step="0.005"
              value={altAssumptions.expectedAnnualReturn}
              onChange={(e) => setAltAssumptions({ ...altAssumptions, expectedAnnualReturn: Number(e.target.value) })}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Alternate Step-Up */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Alternate Step-Up %</span>
              <span className="font-semibold text-indigo-400">{(altAssumptions.annualContributionIncrease * 100).toFixed(0)}% / yr</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.20"
              step="0.01"
              value={altAssumptions.annualContributionIncrease}
              onChange={(e) => setAltAssumptions({ ...altAssumptions, annualContributionIncrease: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Alternate Inflation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Alternate Inflation Rate</span>
              <span className="font-semibold text-amber-400">{(altAssumptions.inflationRate * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.12"
              step="0.005"
              value={altAssumptions.inflationRate}
              onChange={(e) => setAltAssumptions({ ...altAssumptions, inflationRate: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Variance Metric Cards */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Comparison Delta Variance
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Nominal Wealth Delta:</span>
              <span className={`font-bold ${comparison.difference.isAlternateSuperior ? 'text-emerald-400' : 'text-rose-400'}`}>
                {comparison.difference.isAlternateSuperior ? '+' : ''}{curr} {comparison.difference.nominalDifference.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Percentage Variance:</span>
              <span className={`font-bold ${comparison.difference.isAlternateSuperior ? 'text-emerald-400' : 'text-rose-400'}`}>
                {comparison.difference.isAlternateSuperior ? '+' : ''}{comparison.difference.percentageChange}%
              </span>
            </div>
          </div>
        </div>

        {/* Overlay Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Baseline vs Alternate Growth Curves
              </h3>
              <p className="text-xs text-slate-400">
                Baseline ({(baselineAssumptions.expectedAnnualReturn * 100).toFixed(1)}%) vs Alternate ({(altAssumptions.expectedAnnualReturn * 100).toFixed(1)}%)
              </p>
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
                <Line type="monotone" dataKey="Baseline" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Baseline Scenario" />
                <Line type="monotone" dataKey="Alternate" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Alternate Scenario" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Saved Named Scenarios List */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Saved Named Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc) => (
            <div key={sc.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-200">{sc.name}</h4>
                <div className="text-xs text-slate-400 mt-1">
                  Projected: {curr} {sc.resultsJson.projectedNominalFutureValue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {(sc.variablesJson.assumptionsSnapshot.expectedAnnualReturn * 100).toFixed(1)}% Return • {sc.variablesJson.assumptionsSnapshot.projectionYears} yrs
                </div>
              </div>
              <button
                onClick={() => deleteScenario(sc.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Delete Scenario"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
