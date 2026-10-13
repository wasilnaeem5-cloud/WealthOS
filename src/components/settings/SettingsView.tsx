'use client';

import React, { useState } from 'react';
import { Database, LogOut, Save, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import { useWealth } from '../../lib/context/WealthContext';
import { useAuth } from '../../lib/context/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';

export const SettingsView: React.FC = () => {
  const { userProfile, financialProfile, updateUserProfile, updateFinancialProfile, dataMode } = useWealth();
  const { user, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prevProfile, setPrevProfile] = useState(userProfile);
  const [prevFinProfile, setPrevFinProfile] = useState(financialProfile);

  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age || 18);
  const [currency, setCurrency] = useState(userProfile?.currency || 'PKR');
  const [income, setIncome] = useState(financialProfile?.income || 0);
  const [expenses, setExpenses] = useState(financialProfile?.expenses || 0);
  const [savings, setSavings] = useState(financialProfile?.savings || 0);
  const [investments, setInvestments] = useState(financialProfile?.investments || 0);
  const [debt, setDebt] = useState(financialProfile?.debt || 0);

  if (userProfile !== prevProfile || financialProfile !== prevFinProfile) {
    setPrevProfile(userProfile);
    setPrevFinProfile(financialProfile);
    if (userProfile) {
      setName(userProfile.name); setAge(userProfile.age); setCurrency(userProfile.currency);
    }
    if (financialProfile) {
      setIncome(financialProfile.income); setExpenses(financialProfile.expenses); setSavings(financialProfile.savings); setInvestments(financialProfile.investments); setDebt(financialProfile.debt);
    }
  }

  if (!userProfile || !financialProfile) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ name, age, currency });
      await updateFinancialProfile({ income, expenses, savings, investments, debt, monthlyContribution: financialProfile.monthlyContribution, assumptions: { ...financialProfile.assumptions, currency } });
      setSaved(true); window.setTimeout(()=>setSaved(false), 2200);
    } finally { setSaving(false); }
  };

  return <div className="space-y-7">
    <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Workspace settings</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">Keep your model current.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Update the profile and baseline financial information used throughout your WealthOS workspace.</p></div>
    <form onSubmit={submit} className="space-y-5">
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4"><span className="rounded-xl bg-[var(--accent-cyan-soft)] p-2.5 text-[var(--accent-cyan)]"><UserRound className="h-4 w-4" /></span><div><h2 className="text-sm font-bold">Personal profile</h2><p className="text-[11px] text-[var(--text-muted)]">The identity and currency attached to your workspace.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Input label="Full name" value={name} onChange={e=>setName(e.target.value)} /><Input label="Age" type="number" min="13" max="120" value={age} onChange={e=>setAge(Number(e.target.value))} /><Select label="Currency" value={currency} onChange={e=>setCurrency(e.target.value)} options={[{label:'PKR · Pakistani Rupee',value:'PKR'},{label:'USD · US Dollar',value:'USD'},{label:'EUR · Euro',value:'EUR'},{label:'GBP · British Pound',value:'GBP'},{label:'INR · Indian Rupee',value:'INR'}]} /></div></Card>
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4"><span className="rounded-xl bg-[var(--accent-violet-soft)] p-2.5 text-[var(--accent-violet)]"><SlidersHorizontal className="h-4 w-4" /></span><div><h2 className="text-sm font-bold">Current financial picture</h2><p className="text-[11px] text-[var(--text-muted)]">These values feed the deterministic model.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Input label={`Monthly income (${currency})`} type="number" min="0" value={income} onChange={e=>setIncome(Number(e.target.value))}/><Input label={`Monthly expenses (${currency})`} type="number" min="0" value={expenses} onChange={e=>setExpenses(Number(e.target.value))}/><Input label={`Savings (${currency})`} type="number" min="0" value={savings} onChange={e=>setSavings(Number(e.target.value))}/><Input label={`Investments (${currency})`} type="number" min="0" value={investments} onChange={e=>setInvestments(Number(e.target.value))}/><Input label={`Debt (${currency})`} type="number" min="0" value={debt} onChange={e=>setDebt(Number(e.target.value))}/><Input label={`Monthly contribution (${currency})`} type="number" value={financialProfile.monthlyContribution} disabled helperText="Change this in Simulator." /></div></Card>
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4"><span className="rounded-xl bg-[var(--status-success-bg)] p-2.5 text-[var(--status-success)]"><ShieldCheck className="h-4 w-4" /></span><div><h2 className="text-sm font-bold">Account & security</h2><p className="text-[11px] text-[var(--text-muted)]">Authentication remains managed by Supabase.</p></div></div><div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-[var(--text-primary)]">{user?.email || 'Signed-in account'}</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Your financial data is scoped to this account.</p></div><Button type="button" variant="danger" leftIcon={<LogOut className="h-4 w-4" />} onClick={()=>signOut()}>Sign out</Button></div></Card>
      <Card className="p-5"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Database className="h-4 w-4 text-[var(--accent-cyan)]"/><div><p className="text-sm font-bold">Persistence layer</p><p className="text-[11px] text-[var(--text-muted)]">{dataMode === 'supabase' ? 'Supabase PostgreSQL' : 'Local demonstration storage'}</p></div></div><span className="rounded-full border border-[var(--border-color)] px-2.5 py-1 font-mono text-[10px] text-[var(--text-muted)]">{dataMode}</span></div></Card>
      <div className="flex justify-end"><Button type="submit" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>{saved ? 'Saved' : 'Save changes'}</Button></div>
    </form>
  </div>;
};
