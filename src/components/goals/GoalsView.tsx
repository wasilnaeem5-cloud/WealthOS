'use client';

import React, { useState } from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { GoalService } from '../../lib/services/goalService';
import { Target, Plus, Trash2, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { GoalInput } from '../../lib/validation/goals';

const goalService = new GoalService();

export const GoalsView: React.FC = () => {
  const { goals, userProfile, financialProfile, addGoal, deleteGoal } = useWealth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<GoalInput>({
    name: '',
    targetAmount: 25000,
    currentAmount: 5000,
    targetDate: '2028-12-31',
    contributionAmount: 400,
  });

  const curr = userProfile?.currency || '$';
  const expectedReturn = financialProfile?.assumptions.expectedAnnualReturn || 0.08;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addGoal(form);
    setIsModalOpen(false);
    setForm({
      name: '',
      targetAmount: 25000,
      currentAmount: 5000,
      targetDate: '2028-12-31',
      contributionAmount: 400,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Goal Planner & Target Gap Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Turn your financial dreams into measurable contribution requirements and track timeline gap progress.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Goal
        </button>
      </div>

      {/* Goals Card Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 max-w-lg mx-auto my-8">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 inline-block">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">No Goals Created Yet</h3>
          <p className="text-xs text-slate-400">
            Set up target amounts and target dates to calculate exact monthly contribution requirements.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const req = goalService.calculateGoalRequirement(goal, expectedReturn);
          const progressPct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isAllocatedSufficient = goal.contributionAmount >= req.requiredMonthlyContribution;

          return (
            <div
              key={goal.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-all relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{goal.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Target Date: {goal.targetDate}
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Delete Goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Current Saved</span>
                  <span className="text-slate-200">{curr} {goal.currentAmount.toLocaleString()} / {curr} {goal.targetAmount.toLocaleString()} ({progressPct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Requirement Analysis */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Required Monthly</span>
                  <div className="text-sm font-bold text-indigo-400 mt-0.5">
                    {curr} {req.requiredMonthlyContribution.toLocaleString()} / mo
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Allocated Monthly</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    {curr} {goal.contributionAmount.toLocaleString()} / mo
                  </div>
                </div>
              </div>

              {/* Track Status Badge */}
              <div className="flex items-center gap-2 text-xs pt-1">
                {isAllocatedSufficient ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    On Track (Requirement Satisfied)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Shortfall: Add {curr} {Math.max(0, req.requiredMonthlyContribution - goal.contributionAmount).toLocaleString()} / mo
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-slate-100">Add New Financial Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy a Home / Emergency Fund"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Amount ({curr})</label>
                  <input
                    type="number"
                    min="1"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Current Saved ({curr})</label>
                  <input
                    type="number"
                    min="0"
                    value={form.currentAmount}
                    onChange={(e) => setForm({ ...form, currentAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={form.targetDate}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Allocated Monthly ({curr})</label>
                  <input
                    type="number"
                    min="0"
                    value={form.contributionAmount}
                    onChange={(e) => setForm({ ...form, contributionAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all font-semibold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
