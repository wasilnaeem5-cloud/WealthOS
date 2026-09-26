'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/context/AuthContext';
import { WealthProvider, useWealth } from '../../lib/context/WealthContext';
import { User, DollarSign, Wallet, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { completeOnboarding } = useWealth();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [age, setAge] = useState<number>(26);
  const [currency, setCurrency] = useState<string>('USD');

  const [income, setIncome] = useState<number>(5000);
  const [expenses, setExpenses] = useState<number>(3200);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(800);

  const [savings, setSavings] = useState<number>(12000);
  const [investments, setInvestments] = useState<number>(18000);
  const [debt, setDebt] = useState<number>(4000);

  const [goalName, setGoalName] = useState<string>('Home Down Payment');
  const [goalTarget, setGoalTarget] = useState<number>(60000);
  const [goalCurrent, setGoalCurrent] = useState<number>(18000);
  const [goalDate, setGoalDate] = useState<string>('2029-12-31');

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(
        { name, age, currency, onboardingCompleted: true },
        {
          income,
          expenses,
          savings,
          investments,
          debt,
          monthlyContribution,
          assumptions: {
            expectedAnnualReturn: 0.08,
            inflationRate: 0.03,
            contributionFrequency: 'monthly',
            contributionTiming: 'beginning',
            annualContributionIncrease: 0.05,
            projectionYears: 20,
            currency,
          },
        },
        goalName.trim()
          ? {
              name: goalName,
              targetAmount: goalTarget,
              currentAmount: goalCurrent,
              targetDate: goalDate,
              contributionAmount: Math.round(monthlyContribution * 0.6),
            }
          : undefined
      );

      router.push('/');
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Branding & Progress */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 mb-1">
            W
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Personal Financial Setup</h1>
          <p className="text-xs text-slate-400">
            Step {step} of 4 — WealthOS person-based personalization wizard
          </p>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden max-w-xs mx-auto mt-3">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="w-4 h-4 text-indigo-400" />
                Step 1: Personal Details
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Current Age</label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Preferred Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Monthly Cash Flow */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Step 2: Monthly Cash Flow
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Monthly Gross Income ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Monthly Expenses ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Monthly Investment ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Current Assets & Liabilities */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Wallet className="w-4 h-4 text-cyan-400" />
                Step 3: Current Assets & Debt
              </h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Liquid Bank Savings ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={savings}
                      onChange={(e) => setSavings(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Investments Portfolio ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={investments}
                      onChange={(e) => setInvestments(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Total Outstanding Debt / Loans ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={debt}
                    onChange={(e) => setDebt(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Initial Financial Goal */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Target className="w-4 h-4 text-amber-400" />
                Step 4: Primary Financial Goal
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Goal Name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Target Amount ({currency})</label>
                    <input
                      type="number"
                      min="1"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Target Date</label>
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all"
              >
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Finalizing Setup...' : 'Complete & Open Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <WealthProvider>
      <OnboardingContent />
    </WealthProvider>
  );
}

