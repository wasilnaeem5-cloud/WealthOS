'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, CircleAlert, Plus, Target, Trash2 } from 'lucide-react';
import { useWealth } from '../../lib/context/WealthContext';
import { GoalService } from '../../lib/services/goalService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { ProgressBar } from '../ui/ProgressBar';

const goalService = new GoalService();
const money = (currency: string, value: number) => `${currency} ${Math.round(value).toLocaleString()}`;

export const GoalsView: React.FC = () => {
  const { goals, userProfile, financialProfile, addGoal, deleteGoal } = useWealth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', targetAmount: 150000, currentAmount: 0, targetDate: '2028-12-31', contributionAmount: 10000 });
  const currency = userProfile?.currency || financialProfile?.assumptions.currency || 'PKR';

  const totalTarget = useMemo(() => goals.reduce((sum, goal) => sum + goal.targetAmount, 0), [goals]);
  const totalCurrent = useMemo(() => goals.reduce((sum, goal) => sum + goal.currentAmount, 0), [goals]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || form.targetAmount <= 0 || form.currentAmount < 0) return;
    setSaving(true);
    try {
      await addGoal(form);
      setOpen(false);
      setForm({ name: '', targetAmount: 150000, currentAmount: 0, targetDate: '2028-12-31', contributionAmount: 10000 });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setDeleting(id);
    try { await deleteGoal(id); } finally { setDeleting(null); }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Goal planner</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">Your goals.</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Turn future plans into measurable targets.</p></div>
        <Button onClick={() => setOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>Add goal</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--text-muted)]">Goals tracked</p><p className="mt-3 font-mono-numbers text-2xl font-bold text-[var(--text-primary)]">{goals.length}</p><p className="mt-1 text-xs text-[var(--text-muted)]">Saved to your WealthOS workspace.</p></Card>
        <Card className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--text-muted)]">Total funded</p><p className="mt-3 font-mono-numbers text-2xl font-bold text-[var(--text-primary)]">{money(currency, totalCurrent)}</p><p className="mt-1 text-xs text-[var(--text-muted)]">Across all saved goals.</p></Card>
        <Card variant="accent" className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--text-muted)]">Total targets</p><p className="mt-3 font-mono-numbers text-2xl font-bold text-[var(--text-primary)]">{money(currency, totalTarget)}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">A simple snapshot of what you&apos;re building toward.</p></Card>
      </div>

      {goals.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{goals.map((goal) => {
        const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
        const requirement = goalService.calculateGoalRequirement(goal, financialProfile?.assumptions.expectedAnnualReturn || .08);
        const onTrack = goal.contributionAmount >= requirement.requiredMonthlyContribution;
        const completed = goal.currentAmount >= goal.targetAmount;
        return <Card key={goal.id} hoverEffect className="p-5">
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"><Target className="h-5 w-5" /></span><div><h2 className="text-sm font-bold text-[var(--text-primary)]">{goal.name}</h2><p className="mt-1 flex items-center gap-1 text-[10px] text-[var(--text-muted)]"><CalendarDays className="h-3 w-3" />{new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p></div></div><button onClick={() => remove(goal.id)} disabled={deleting === goal.id} aria-label={`Delete ${goal.name}`} className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--status-danger-bg)] hover:text-[var(--status-danger)] disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>
          <div className="mt-6"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Funded</p><p className="mt-1 font-mono-numbers text-xl font-bold text-[var(--text-primary)]">{money(currency, goal.currentAmount)}</p></div><p className="text-xs font-semibold text-[var(--text-secondary)]">{progress}%</p></div><ProgressBar value={progress} className="mt-3" /></div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border-color)] pt-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Target</p><p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{money(currency, goal.targetAmount)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Monthly planned</p><p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{money(currency, goal.contributionAmount)}</p></div></div>
          <div className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-3 text-xs ${completed ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : onTrack ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'}`}>{completed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : onTrack ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}<span>{completed ? 'Target fully funded.' : onTrack ? `Planned contribution is at or above the modelled ${money(currency, requirement.requiredMonthlyContribution)} monthly requirement.` : `The modelled requirement is ${money(currency, requirement.requiredMonthlyContribution)} per month.`}</span></div>
        </Card>;
      })}</div> : <Card className="p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"><Target className="h-7 w-7" /></div><h2 className="mt-5 text-xl font-bold text-[var(--text-primary)]">No goals yet.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">Create a target and WealthOS will show the amount already funded, the target date, and a modelled contribution requirement.</p><Button className="mt-6" onClick={() => setOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>Create your first goal</Button></Card>}

      {open && <div role="dialog" aria-modal="true" aria-labelledby="goal-title" className="fixed inset-0 z-50 flex items-end bg-black/65 p-4 sm:items-center sm:justify-center"><form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-[var(--border-color-strong)] bg-[var(--bg-surface)] p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--accent-cyan)]">New goal</p><h2 id="goal-title" className="mt-1 text-xl font-bold text-[var(--text-primary)]">What are you building toward?</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Use the numbers you want to explore in your model.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)]">Close</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Input label="Goal name" placeholder="e.g. Laptop, emergency fund" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div><Input label={`Target amount (${currency})`} type="number" min="1" value={form.targetAmount} onChange={(event) => setForm({ ...form, targetAmount: Number(event.target.value) })} required /><Input label={`Already saved (${currency})`} type="number" min="0" value={form.currentAmount} onChange={(event) => setForm({ ...form, currentAmount: Number(event.target.value) })} required /><Input label="Target date" type="date" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} required /><Input label={`Monthly contribution (${currency})`} type="number" min="0" value={form.contributionAmount} onChange={(event) => setForm({ ...form, contributionAmount: Number(event.target.value) })} required /></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving}>Create goal</Button></div></form></div>}
    </div>
  );
};
