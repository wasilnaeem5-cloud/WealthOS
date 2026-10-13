'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CircleDollarSign, Target, UserRound, WalletCards } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/context/AuthContext';
import { WealthProvider, useWealth } from '../../lib/context/WealthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';

const steps = [
  { title: 'Personal', icon: UserRound, caption: 'Start with a few basics.' },
  { title: 'Cash flow', icon: CircleDollarSign, caption: 'Tell us how money moves.' },
  { title: 'Position', icon: WalletCards, caption: 'Capture savings, investments, and debt.' },
  { title: 'Goal', icon: Target, caption: 'Give your future a target.' },
];

function OnboardingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { completeOnboarding } = useWealth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(18);
  const [currency, setCurrency] = useState('PKR');
  const [income, setIncome] = useState(50000);
  const [expenses, setExpenses] = useState(30000);
  const [monthlyContribution, setMonthlyContribution] = useState(20000);
  const [savings, setSavings] = useState(100000);
  const [investments, setInvestments] = useState(50000);
  const [debt, setDebt] = useState(10000);
  const [goalName, setGoalName] = useState('Laptop');
  const [goalTarget, setGoalTarget] = useState(150000);
  const [goalCurrent, setGoalCurrent] = useState(50000);
  const [goalDate, setGoalDate] = useState('2028-12-31');

  const next = () => {
    setError(null);
    if (step === 1 && (!name.trim() || age < 13 || age > 120)) { setError('Enter a name and an age between 13 and 120.'); return; }
    if (step === 2 && (income < 0 || expenses < 0 || monthlyContribution < 0)) { setError('Financial values cannot be negative.'); return; }
    if (step === 3 && (savings < 0 || investments < 0 || debt < 0)) { setError('Financial values cannot be negative.'); return; }
    setStep((value) => Math.min(4, value + 1));
  };

  const finish = async () => {
    setError(null);
    if (!name.trim() || goalTarget <= 0 || goalCurrent < 0 || monthlyContribution < 0) { setError('Please review the required fields before finishing.'); return; }
    setSaving(true);
    try {
      await completeOnboarding(
        { name: name.trim(), age, currency, onboardingCompleted: true },
        { income, expenses, savings, investments, debt, monthlyContribution, assumptions: { expectedAnnualReturn: 0.08, inflationRate: 0.05, contributionFrequency: 'monthly', contributionTiming: 'beginning', annualContributionIncrease: 0.05, projectionYears: 10, currency } },
        goalName.trim() ? { name: goalName.trim(), targetAmount: goalTarget, currentAmount: goalCurrent, targetDate: goalDate, contributionAmount: Math.min(monthlyContribution, Math.max(0, monthlyContribution * 0.5)) } : undefined,
      );
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not save your financial picture. Please try again.');
    } finally { setSaving(false); }
  };

  const active = steps[step - 1];
  const ActiveIcon = active.icon;

  return <main className="app-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">WealthOS setup</p><h1 className="mt-2 text-2xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-3xl">Build your financial picture.</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">A few steps now, clearer projections later.</p></div><div className="hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] sm:block">Step {step} of 4</div></div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-4"><div className="space-y-1">{steps.map((item, index) => { const n=index+1; const Icon=item.icon; const done=n<step; const current=n===step; return <div key={item.title} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${current ? 'bg-[var(--accent-cyan-soft)]' : ''}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${done ? 'border-[var(--status-success)]/30 bg-[var(--status-success-bg)] text-[var(--status-success)]' : current ? 'border-[var(--accent-cyan)]/25 bg-[var(--bg-surface)] text-[var(--accent-cyan)]' : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'}`}>{done ? <Check className="h-4 w-4"/> : <Icon className="h-4 w-4"/>}</span><div><p className={`text-xs font-bold ${current ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{item.title}</p><p className="mt-0.5 hidden text-[10px] leading-4 text-[var(--text-muted)] lg:block">{item.caption}</p></div></div>; })}</div><div className="mt-4 border-t border-[var(--border-color)] pt-4 text-[10px] leading-5 text-[var(--text-muted)]">Your saved financial picture is scoped to your account. WealthOS uses the information you provide to calculate the model.</div></Card>

        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"><ActiveIcon className="h-5 w-5"/></span><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--text-muted)]">Step 0{step}</p><h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">{active.title}</h2></div></div>
          {error && <div role="alert" className="mt-5 rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] px-4 py-3 text-xs font-semibold text-[var(--status-danger)]">{error}</div>}
          <div className="mt-7 min-h-[360px]">
            <AnimatePresence mode="wait">
              {step === 1 && <motion.div key="1" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} className="space-y-5"><div><h3 className="text-2xl font-bold text-[var(--text-primary)]">Let&apos;s start simple.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">We only need enough context to personalize the rest of WealthOS.</p></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Full name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} /><Input label="Age" type="number" min="13" max="120" value={age} onChange={e=>setAge(Number(e.target.value))}/><div className="sm:col-span-2"><Select label="Currency" value={currency} onChange={e=>setCurrency(e.target.value)} options={[{label:'PKR · Pakistani Rupee',value:'PKR'},{label:'USD · US Dollar',value:'USD'},{label:'EUR · Euro',value:'EUR'},{label:'GBP · British Pound',value:'GBP'},{label:'INR · Indian Rupee',value:'INR'}]} /></div></div></motion.div>}
              {step === 2 && <motion.div key="2" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} className="space-y-5"><div><h3 className="text-2xl font-bold text-[var(--text-primary)]">How does money move each month?</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">These values help WealthOS calculate surplus and a contribution-based projection.</p></div><div className="grid gap-4 sm:grid-cols-2"><Input label={`Monthly income (${currency})`} type="number" min="0" value={income} onChange={e=>setIncome(Number(e.target.value))}/><Input label={`Monthly expenses (${currency})`} type="number" min="0" value={expenses} onChange={e=>setExpenses(Number(e.target.value))}/><div className="sm:col-span-2"><Input label={`Monthly contribution (${currency})`} type="number" min="0" value={monthlyContribution} onChange={e=>setMonthlyContribution(Number(e.target.value))} helperText="The amount you want the model to assume you add regularly."/></div></div><div className="rounded-2xl border border-[var(--accent-cyan)]/15 bg-[var(--accent-cyan-soft)] p-4"><p className="text-xs font-bold text-[var(--text-primary)]">Monthly surplus</p><p className="mt-1 font-mono text-lg font-bold text-[var(--accent-cyan)]">{currency} {Math.max(0, income-expenses).toLocaleString()}</p></div></motion.div>}
              {step === 3 && <motion.div key="3" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} className="space-y-5"><div><h3 className="text-2xl font-bold text-[var(--text-primary)]">What do you have today?</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Give the model a starting point with your current balances.</p></div><div className="grid gap-4 sm:grid-cols-2"><Input label={`Savings (${currency})`} type="number" min="0" value={savings} onChange={e=>setSavings(Number(e.target.value))}/><Input label={`Investments (${currency})`} type="number" min="0" value={investments} onChange={e=>setInvestments(Number(e.target.value))}/><div className="sm:col-span-2"><Input label={`Debt / loans (${currency})`} type="number" min="0" value={debt} onChange={e=>setDebt(Number(e.target.value))}/></div></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-3"><p className="text-[10px] text-[var(--text-muted)]">Cash + investments</p><p className="mt-1 font-mono text-sm font-bold">{currency} {(savings+investments).toLocaleString()}</p></div><div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-3"><p className="text-[10px] text-[var(--text-muted)]">Debt</p><p className="mt-1 font-mono text-sm font-bold">{currency} {debt.toLocaleString()}</p></div><div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-3"><p className="text-[10px] text-[var(--text-muted)]">Current net worth</p><p className="mt-1 font-mono text-sm font-bold">{currency} {(savings+investments-debt).toLocaleString()}</p></div></div></motion.div>}
              {step === 4 && <motion.div key="4" initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} className="space-y-5"><div><h3 className="text-2xl font-bold text-[var(--text-primary)]">What are you building toward?</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Add one goal. You can create more later from Goal Planner.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Input label="Goal name" placeholder="e.g. Laptop, emergency fund" value={goalName} onChange={e=>setGoalName(e.target.value)} /></div><Input label={`Target amount (${currency})`} type="number" min="1" value={goalTarget} onChange={e=>setGoalTarget(Number(e.target.value))}/><Input label={`Already saved (${currency})`} type="number" min="0" value={goalCurrent} onChange={e=>setGoalCurrent(Number(e.target.value))}/><Input label="Target date" type="date" value={goalDate} onChange={e=>setGoalDate(e.target.value)}/><Input label={`Planned contribution (${currency})`} type="number" min="0" value={Math.min(monthlyContribution, Math.max(0, monthlyContribution*.5))} readOnly helperText="A starter allocation derived from your monthly contribution."/></div><div className="rounded-2xl border border-[var(--accent-violet)]/15 bg-[var(--accent-violet-soft)] p-4"><p className="text-xs font-bold text-[var(--text-primary)]">Almost there.</p><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">When you finish, WealthOS will save this picture and generate your first projection.</p></div></motion.div>}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-5"><Button variant="ghost" onClick={()=>setStep((v)=>Math.max(1,v-1))} disabled={step===1} leftIcon={<ArrowLeft className="h-4 w-4"/>}>Back</Button>{step<4 ? <Button onClick={next} rightIcon={<ArrowRight className="h-4 w-4"/>}>Continue</Button> : <Button onClick={finish} isLoading={saving} leftIcon={<Check className="h-4 w-4"/>}>Create my financial picture</Button>}</div>
        </Card>
      </div>
    </div>
  </main>;
}

export default function OnboardingPage() { return <WealthProvider><OnboardingContent/></WealthProvider>; }
