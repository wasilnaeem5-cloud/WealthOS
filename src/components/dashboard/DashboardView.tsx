'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, BrainCircuit, CalendarDays, CircleHelp, Landmark, PiggyBank, Sparkles, Target, TrendingUp, Wallet } from 'lucide-react';
import { useWealth } from '../../lib/context/WealthContext';
import { KpiCard } from '../ui/KpiCard';
import { Card, CardDescription, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

const money = (currency: string, value: number) => `${currency} ${Math.round(value).toLocaleString()}`;

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const { userProfile, financialProfile, calculationResult, goals, setActiveTab } = useWealth();

  const points = useMemo(() => calculationResult?.yearlyBreakdown.map((item) => ({
    year: item.year,
    age: item.age,
    nominal: item.nominalValue,
    real: item.realValue,
    contributions: item.totalContributions,
  })) ?? [], [calculationResult]);

  if (!financialProfile || !calculationResult) {
    return (
      <Card className="mx-auto my-16 max-w-lg p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]">
          <Wallet className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-[var(--text-primary)]">Complete your financial picture</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">Add your current situation to generate your first WealthOS projection.</p>
        <Button className="mt-6" onClick={() => router.push('/onboarding')} rightIcon={<ArrowRight className="h-4 w-4" />}>Start setup</Button>
      </Card>
    );
  }

  const currency = userProfile?.currency || financialProfile.assumptions.currency;
  const assumptions = financialProfile.assumptions;
  const firstName = userProfile?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const drivers = [
    { label: 'Monthly contribution', value: money(currency, financialProfile.monthlyContribution), copy: 'Planned amount added each month.', icon: PiggyBank },
    { label: 'Expected return', value: `${(assumptions.expectedAnnualReturn * 100).toFixed(1)}%`, copy: 'An assumption used by the model.', icon: TrendingUp },
    { label: 'Inflation', value: `${(assumptions.inflationRate * 100).toFixed(1)}%`, copy: 'Used for the today-value view.', icon: Landmark },
    { label: 'Projection period', value: `${assumptions.projectionYears} years`, copy: 'Your selected modelling horizon.', icon: CalendarDays },
  ];

  return (
    <div className="space-y-7">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_14px_var(--accent-cyan)]" />Your financial picture</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">{greeting}, {firstName}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">See your current position, projected trajectory, and the assumptions shaping the model.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setActiveTab('scenarios')} leftIcon={<Sparkles className="h-4 w-4" />} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>Run a What-If</Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Net worth" value={calculationResult.netWorthCurrent} currency={currency} icon={<Wallet className="h-4 w-4" />} subtext="Savings + investments − debt" />
        <KpiCard label="Monthly surplus" value={calculationResult.monthlySurplus} currency={currency} icon={<PiggyBank className="h-4 w-4" />} subtext="Income less monthly expenses" />
        <KpiCard label="Savings rate" value={`${calculationResult.savingsRate}%`} icon={<TrendingUp className="h-4 w-4" />} subtext="Based on monthly contribution" />
        <KpiCard label={`Projected wealth · ${assumptions.projectionYears}y`} value={calculationResult.projectedNominalFutureValue} currency={currency} icon={<Target className="h-4 w-4" />} highlight subtext="Nominal model output" />
      </div>

      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-color)] p-5 sm:flex-row sm:items-start sm:p-6">
          <div>
            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"><TrendingUp className="h-4 w-4" /></span><div><CardTitle>Projected wealth</CardTitle><CardDescription className="mt-0.5">A deterministic view of your selected assumptions.</CardDescription></div></div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
            <span className="rounded-full border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan-soft)] px-2.5 py-1.5 text-[var(--accent-cyan)]">Nominal</span>
            <span className="rounded-full border border-[var(--accent-violet)]/20 bg-[var(--accent-violet-soft)] px-2.5 py-1.5 text-[var(--accent-violet)]">Inflation-adjusted</span>
          </div>
        </div>
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr_270px]">
          <div className="min-w-0">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--text-muted)]">End of horizon</p><p className="mt-1 font-mono-numbers text-2xl font-bold text-[var(--text-primary)]">{money(currency, calculationResult.projectedNominalFutureValue)}</p></div>
              <p className="text-right text-[11px] text-[var(--text-muted)]">{money(currency, calculationResult.projectedRealFutureValue)} in today&apos;s value</p>
            </div>
            <div className="h-[310px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 4, left: -12, bottom: 4 }}>
                  <defs>
                    <linearGradient id="dashboardNominal" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#63DDF5" stopOpacity=".34" /><stop offset="100%" stopColor="#63DDF5" stopOpacity="0" /></linearGradient>
                    <linearGradient id="dashboardReal" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8B7CFF" stopOpacity=".18" /><stop offset="100%" stopColor="#8B7CFF" stopOpacity="0" /></linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(168,180,197,.10)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} minTickGap={22} />
                  <YAxis axisLine={false} tickLine={false} width={64} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={(v) => `${currency} ${(Number(v) / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color-strong)', borderRadius: 14, color: 'var(--text-primary)' }} labelFormatter={(label) => `Year ${label}`} formatter={(value: unknown, name: unknown) => [money(currency, Number(value)), name === 'nominal' ? 'Projected wealth' : 'Today-value'] } />
                  <Area className="chart-glow" type="monotone" dataKey="nominal" stroke="#63DDF5" strokeWidth={3} fill="url(#dashboardNominal)" />
                  <Area type="monotone" dataKey="real" stroke="#8B7CFF" strokeWidth={2} fill="url(#dashboardReal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4 sm:p-5">
            <div className="flex items-center gap-2"><CircleHelp className="h-4 w-4 text-[var(--accent-cyan)]" /><p className="text-xs font-bold text-[var(--text-primary)]">What drives the model?</p></div>
            <div className="mt-4 space-y-3">
              {drivers.map(({ label, value, copy, icon: Icon }) => <div key={label} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"><Icon className="h-4 w-4" /></span><div className="min-w-0"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-semibold text-[var(--text-secondary)]">{label}</p><p className="font-mono text-[11px] font-bold text-[var(--text-primary)]">{value}</p></div><p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">{copy}</p></div></div></div>)}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><CardTitle><Target className="h-4 w-4 text-[var(--accent-cyan)]" />Your goals</CardTitle><CardDescription className="mt-1">Track what you&apos;re building toward.</CardDescription></div><Button variant="ghost" size="sm" onClick={() => setActiveTab('goals')}>View all</Button></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {goals.slice(0, 2).map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return <div key={goal.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4 transition hover:border-[var(--border-color-hover)]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[var(--text-primary)]">{goal.name}</p><p className="mt-1 text-[11px] text-[var(--text-muted)]"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />Target {new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p></div><span className="rounded-lg bg-[var(--accent-cyan-soft)] p-2 text-[var(--accent-cyan)]"><Target className="h-4 w-4" /></span></div><ProgressBar value={progress} className="mt-4" /><div className="mt-2 flex justify-between text-[11px] text-[var(--text-secondary)]"><span>{money(currency, goal.currentAmount)}</span><span>{money(currency, goal.targetAmount)}</span></div></div>;
            })}
            {goals.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--border-color-strong)] p-7 text-center md:col-span-2"><Target className="mx-auto h-6 w-6 text-[var(--text-muted)]" /><p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">No goals yet</p><p className="mt-1 text-xs text-[var(--text-muted)]">Create a goal to explore how your current plan supports it.</p><Button size="sm" className="mt-4" onClick={() => setActiveTab('goals')}>Create a goal</Button></div>}
          </div>
        </Card>

        <Card variant="glass" className="relative overflow-hidden p-6">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--accent-violet-glow)] blur-3xl" />
          <div className="relative"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]"><BrainCircuit className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-bold text-[var(--text-primary)]">Understand the result</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Copilot can explain your model outputs in plain language. The financial engine remains the source of truth.</p><Button variant="accent" className="mt-6 w-full" onClick={() => setActiveTab('copilot')} rightIcon={<ArrowRight className="h-4 w-4" />}>Ask Copilot</Button></div>
        </Card>
      </div>
    </div>
  );
};
