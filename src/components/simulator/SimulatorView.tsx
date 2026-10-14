'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Check, Info, RotateCcw, Save, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useWealth } from '../../lib/context/WealthContext';
import { Button } from '../ui/Button';
import { Card, CardDescription, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { SliderField } from '../ui/SliderField';

const money = (currency: string, value: number) => `${currency} ${Math.round(value).toLocaleString()}`;

export const SimulatorView: React.FC = () => {
  const { financialProfile, userProfile, updateFinancialProfile, calculateProjection } = useWealth();
  const [prevProfile, setPrevProfile] = useState(financialProfile);
  const [draft, setDraft] = useState(financialProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (financialProfile !== prevProfile) {
    setPrevProfile(financialProfile);
    setDraft(financialProfile ? { ...financialProfile, assumptions: { ...financialProfile.assumptions } } : null);
  }

  const preview = useMemo(() => (draft ? calculateProjection(draft) : null), [draft, calculateProjection]);
  if (!draft || !preview || !financialProfile) return null;

  const currency = userProfile?.currency || draft.assumptions.currency;
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(financialProfile);
  const change = (updates: Partial<typeof draft>, assumptionUpdates?: Partial<typeof draft.assumptions>) => setDraft({ ...draft, ...updates, assumptions: { ...draft.assumptions, ...assumptionUpdates } });

  const points = preview.yearlyBreakdown.map((item) => ({ year: item.year, nominal: item.nominalValue, real: item.realValue }));

  const save = async () => {
    setSaving(true);
    try {
      await updateFinancialProfile({
        income: draft.income,
        expenses: draft.expenses,
        savings: draft.savings,
        investments: draft.investments,
        debt: draft.debt,
        monthlyContribution: draft.monthlyContribution,
        assumptions: draft.assumptions,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Interactive model</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">Model your financial future.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Change one assumption and watch the projection respond instantly. Save only when you&apos;re ready.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDraft({ ...financialProfile, assumptions: { ...financialProfile.assumptions } })} leftIcon={<RotateCcw className="h-4 w-4" />}>Reset</Button>
          <Button size="sm" onClick={save} disabled={!hasChanges} isLoading={saving} leftIcon={saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}>{saved ? 'Saved' : 'Save simulation'}</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card variant="elevated" className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border-color)] pb-5"><div><CardTitle><SlidersHorizontal className="h-4 w-4 text-[var(--accent-cyan)]" />Simulation controls</CardTitle><CardDescription className="mt-1">Preview changes locally. Supabase is updated only when you save.</CardDescription></div>{hasChanges && <span className="shrink-0 rounded-full bg-[var(--status-warning-bg)] px-2.5 py-1 text-[10px] font-bold text-[var(--status-warning)]">Unsaved</span>}</div>

          <div className="mt-6 space-y-6">
            <SliderField label="Starting savings" value={draft.savings} min={0} max={1000000} step={5000} onChange={(value) => change({ savings: value })} formatValue={(value) => money(currency, value)} />
            <div className="grid grid-cols-2 gap-3"><Input label={`Savings (${currency})`} type="number" min="0" value={draft.savings} onChange={(e) => change({ savings: Number(e.target.value) })} /><Input label={`Monthly (${currency})`} type="number" min="0" value={draft.monthlyContribution} onChange={(e) => change({ monthlyContribution: Number(e.target.value) })} /></div>
            <SliderField label="Monthly contribution" value={draft.monthlyContribution} min={0} max={Math.max(100000, draft.income)} step={500} onChange={(value) => change({ monthlyContribution: value })} formatValue={(value) => money(currency, value)} />
            <SliderField label="Expected annual return" value={draft.assumptions.expectedAnnualReturn * 100} min={0} max={25} step={0.5} onChange={(value) => change({}, { expectedAnnualReturn: value / 100 })} formatValue={(value) => `${value.toFixed(1)}%`} helperText="This is an assumption, not a market forecast." />
            <SliderField label="Inflation rate" value={draft.assumptions.inflationRate * 100} min={0} max={12} step={0.5} onChange={(value) => change({}, { inflationRate: value / 100 })} formatValue={(value) => `${value.toFixed(1)}%`} />
            <SliderField label="Projection period" value={draft.assumptions.projectionYears} min={1} max={40} onChange={(value) => change({}, { projectionYears: value })} formatValue={(value) => `${value} years`} />
            <div><p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">Contribution timing</p><div className="grid grid-cols-2 gap-2">{(['beginning', 'end'] as const).map((timing) => <button key={timing} type="button" onClick={() => change({}, { contributionTiming: timing })} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold capitalize transition ${draft.assumptions.contributionTiming === timing ? 'border-[var(--accent-cyan)]/35 bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]' : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:border-[var(--border-color-hover)]'}`}>{timing} of month</button>)}</div></div>
          </div>
        </Card>

        <div className="space-y-5">
          <motion.div layout className="relative overflow-hidden rounded-2xl border border-[var(--accent-cyan)]/18 bg-[linear-gradient(145deg,var(--accent-cyan-soft),var(--bg-surface))] p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--accent-cyan-glow)] blur-3xl" />
            <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--text-muted)]">Projected wealth</p><p className="mt-3 font-mono-numbers text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">{money(currency, preview.projectedNominalFutureValue)}</p><p className="mt-2 text-sm text-[var(--text-secondary)]">{draft.assumptions.projectionYears}-year nominal output · {money(currency, preview.projectedRealFutureValue)} in today&apos;s value</p></div><span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${hasChanges ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' : 'bg-[var(--status-success-bg)] text-[var(--status-success)]'}`}>{hasChanges ? 'Previewing changes' : 'Current plan'}</span></div>
            <div className="mt-7 h-[220px] w-full sm:h-[310px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ top: 12, right: 4, left: -12, bottom: 4 }}><defs><linearGradient id="simNominal" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#63DDF5" stopOpacity=".32" /><stop offset="100%" stopColor="#63DDF5" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(168,180,197,.10)" /><XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} minTickGap={20} /><YAxis axisLine={false} tickLine={false} width={60} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={(v) => `${currency} ${(Number(v)/1000).toFixed(0)}k`} /><Tooltip contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color-strong)', borderRadius: 14 }} formatter={(value: unknown, name: unknown) => [money(currency, Number(value)), name === 'nominal' ? 'Projected wealth' : 'Today-value']} /><Area type="monotone" dataKey="nominal" stroke="#63DDF5" strokeWidth={3} fill="url(#simNominal)" /><Area type="monotone" dataKey="real" stroke="#8B7CFF" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[['Total contributions', preview.totalInvested], ['Estimated growth', preview.totalInterestEarned], ['Monthly surplus', preview.monthlySurplus]].map(([label, value]) => <Card key={label as string} className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[var(--text-muted)]">{label as string}</p><p className="mt-3 font-mono-numbers text-xl font-bold text-[var(--text-primary)]">{money(currency, Number(value))}</p></Card>)}
          </div>

          <Card className="p-5"><div className="flex items-start gap-3"><span className="mt-0.5 rounded-lg bg-[var(--accent-cyan-soft)] p-2 text-[var(--accent-cyan)]"><Info className="h-4 w-4" /></span><div><p className="text-sm font-bold text-[var(--text-primary)]">Read the model, don&apos;t mistake it for a forecast.</p><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">WealthOS compounds the inputs you provide using a deterministic model. Real-world returns, inflation, and future conditions can differ.</p></div></div></Card>
          <Card variant="glass" className="p-5"><div className="flex items-center gap-2 text-[var(--accent-violet)]"><Sparkles className="h-4 w-4" /><p className="text-xs font-bold">Exhibition tip</p></div><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Try changing only monthly contribution, then open the What-If Lab to show how one variable changes the modeled outcome.</p></Card>
        </div>
      </div>
    </div>
  );
};
