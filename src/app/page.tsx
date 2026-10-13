'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, BrainCircuit, Calculator, ChartNoAxesCombined, FlaskConical, LockKeyhole, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTheme } from '../components/ui/ThemeContext';
import { calculateFutureValue } from '../lib/financial/futureValue';

const projection = calculateFutureValue({ initialAmount: 450000, monthlyContribution: 20000, expectedAnnualReturn: 0.08, annualContributionIncrease: 0.04, projectionYears: 10, inflationRate: 0.05, contributionTiming: 'beginning', userCurrentAge: 25 });
const data = projection.yearlyBreakdown.map((point) => ({ year: `Y${point.year}`, wealth: point.nominalValue }));

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const displayValue = `PKR ${(projection.nominalFutureValue / 1_000_000).toFixed(2)}M`;
  const steps = [
    { icon: Calculator, label: 'Your inputs', copy: 'Start with your current situation.' },
    { icon: ChartNoAxesCombined, label: 'Financial model', copy: 'Apply defined mathematical assumptions.' },
    { icon: TrendingUp, label: 'Projection', copy: 'See a possible path over time.' },
    { icon: FlaskConical, label: 'What-if', copy: 'Change one variable and compare.' },
    { icon: BrainCircuit, label: 'AI explanation', copy: 'Understand the result in plain language.' },
  ];
  const features = [
    { icon: ChartNoAxesCombined, title: 'Understand', copy: 'See your financial picture clearly.' },
    { icon: FlaskConical, title: 'Simulate', copy: 'Change an assumption and watch the model respond.' },
    { icon: Target, title: 'Track goals', copy: 'Turn future plans into measurable targets.' },
    { icon: BrainCircuit, title: 'Explain', copy: 'Ask Copilot to explain calculated results.' },
  ];

  return (
    <main className="app-shell overflow-hidden">
      <header className="app-content mx-auto flex max-w-[1420px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/"><Logo showTagline /></Link>
        <div className="flex items-center gap-2.5"><button onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 text-[var(--text-secondary)] transition hover:border-[var(--border-color-hover)] hover:text-[var(--accent-cyan)]">{theme==='dark'? '☼' : '☾'}</button><Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link><Link href="/signup" className="hidden sm:block"><Button variant="secondary" size="sm">Create account</Button></Link></div>
      </header>

      <section className="app-content mx-auto grid max-w-[1420px] items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:px-12 lg:pb-28 lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[var(--accent-cyan)]"><Sparkles className="h-3.5 w-3.5" /> Personal financial simulator</div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-.05em] text-[var(--text-primary)] sm:text-5xl lg:text-[72px]">See where your financial decisions <span className="text-[var(--accent-cyan)]">could lead.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">WealthOS turns your current financial situation into an interactive projection you can explore, compare, and explain.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/demo"><Button size="lg" leftIcon={<FlaskConical className="h-4 w-4" />} rightIcon={<ArrowRight className="h-4 w-4" />}>Explore interactive demo</Button></Link><Link href="/login"><Button size="lg" variant="secondary">Sign in</Button></Link></div>
          <p className="mt-5 flex items-center gap-2 text-xs text-[var(--text-muted)]"><LockKeyhole className="h-3.5 w-3.5 text-[var(--status-success)]" />No personal information required for the exhibition demo.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .5, delay: .08 }} className="relative">
          <div className="absolute -inset-8 rounded-[40px] bg-[var(--accent-violet-glow)] blur-3xl" />
          <Card variant="elevated" className="relative overflow-hidden p-5 sm:p-7">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--accent-cyan-glow)] blur-3xl" />
            <div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--text-muted)]">Projected wealth</p><p className="mt-2 font-mono-numbers text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">{displayValue}</p><p className="mt-2 text-xs text-[var(--text-secondary)]">Based on a sample profile · 10-year model</p></div><span className="rounded-2xl border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan-soft)] p-3 text-[var(--accent-cyan)]"><ChartNoAxesCombined className="h-6 w-6" /></span></div>
            <div className="relative mt-8 h-64 sm:h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ left: -14, right: 0, top: 8, bottom: 4 }}><defs><linearGradient id="landingWealth" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#63DDF5" stopOpacity=".36"/><stop offset="100%" stopColor="#63DDF5" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill:'var(--text-muted)', fontSize:10 }} minTickGap={18}/><YAxis axisLine={false} tickLine={false} width={54} tick={{ fill:'var(--text-muted)', fontSize:10 }} tickFormatter={(v)=>`${(Number(v)/1000000).toFixed(1)}M`}/><Tooltip contentStyle={{background:'var(--bg-surface-elevated)',border:'1px solid var(--border-color-strong)',borderRadius:14}} formatter={(value:unknown)=>[`PKR ${Math.round(Number(value)).toLocaleString()}`,'Projected wealth']}/><Area type="monotone" dataKey="wealth" stroke="#63DDF5" strokeWidth={3} fill="url(#landingWealth)"/></AreaChart></ResponsiveContainer></div>
            <div className="relative mt-3 grid grid-cols-3 gap-3 border-t border-[var(--border-color)] pt-5 text-center"><div><p className="text-[10px] uppercase tracking-[.12em] text-[var(--text-muted)]">Starting</p><p className="mt-1 font-mono text-xs font-bold">PKR 450K</p></div><div><p className="text-[10px] uppercase tracking-[.12em] text-[var(--text-muted)]">Monthly</p><p className="mt-1 font-mono text-xs font-bold">PKR 20K</p></div><div><p className="text-[10px] uppercase tracking-[.12em] text-[var(--text-muted)]">Return</p><p className="mt-1 font-mono text-xs font-bold">8.0%</p></div></div>
          </Card>
        </motion.div>
      </section>

      <section className="app-content border-y border-[var(--border-color)] bg-[var(--bg-surface)]/55 px-5 py-16 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1180px]"><p className="text-center text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">How WealthOS works</p><div className="mt-9 grid gap-4 md:grid-cols-5">{steps.map(({icon:Icon,label,copy}, index)=><div key={label} className="relative rounded-2xl border border-transparent bg-transparent p-3 text-center transition hover:border-[var(--border-color)] hover:bg-[var(--bg-surface-soft)]"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--accent-cyan)]"><Icon className="h-5 w-5"/></span><p className="mt-3 text-sm font-bold text-[var(--text-primary)]">{label}</p><p className="mx-auto mt-1 max-w-[170px] text-[10px] leading-4 text-[var(--text-muted)]">{copy}</p>{index<4&&<span className="absolute right-[-7%] top-[37px] hidden h-px w-[14%] bg-[var(--border-color-strong)] md:block"/>}</div>)}</div></div></section>

      <section className="app-content mx-auto max-w-[1180px] px-5 py-20 sm:px-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-violet)]">Built for understanding</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)]">Explore the model from every angle.</h2></div><p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">Built as an interactive college exhibition project to make the relationship between inputs, calculations, future paths, experiments, and AI explanation easy to see.</p></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({icon:Icon,title,copy})=><article key={title} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--border-color-hover)]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"><Icon className="h-5 w-5"/></span><h3 className="mt-5 text-base font-bold text-[var(--text-primary)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p></article>)}</div></section>

      <footer className="app-content border-t border-[var(--border-color)] px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-3 text-xs text-[var(--text-muted)] sm:flex-row"><span>WEALTHOS · Future Finance Lab</span><span>Explore. Simulate. Understand.</span></div></footer>
    </main>
  );
}
