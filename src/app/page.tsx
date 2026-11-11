'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  FlaskConical,
  LineChart,
  Lock,
  Menu,
  Moon,
  RotateCcw,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTheme } from '../components/ui/ThemeContext';
import { calculateFutureValue } from '../lib/financial/futureValue';

type CurrencyOption = 'USD' | 'PKR' | 'EUR' | 'GBP';

const CURRENCIES: Record<CurrencyOption, { symbol: string; label: string; defaultInitial: number; defaultMonthly: number }> = {
  USD: { symbol: '$', label: 'USD ($)', defaultInitial: 15000, defaultMonthly: 800 },
  PKR: { symbol: 'PKR', label: 'PKR (Ã¢â€šÂ¨)', defaultInitial: 500000, defaultMonthly: 35000 },
  EUR: { symbol: 'Ã¢â€šÂ¬', label: 'EUR (Ã¢â€šÂ¬)', defaultInitial: 12000, defaultMonthly: 700 },
  GBP: { symbol: 'Ã‚Â£', label: 'GBP (Ã‚Â£)', defaultInitial: 10000, defaultMonthly: 650 },
};

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Live Sandbox State
  const [currency, setCurrency] = useState<CurrencyOption>('USD');
  const [initialAmount, setInitialAmount] = useState(CURRENCIES.USD.defaultInitial);
  const [monthlyContribution, setMonthlyContribution] = useState(CURRENCIES.USD.defaultMonthly);
  const [expectedReturn, setExpectedReturn] = useState(8.5); // %
  const [projectionYears, setProjectionYears] = useState(20);
  const [inflationRate, setInflationRate] = useState(3.2); // %
  const [stepUp, setStepUp] = useState(3.0); // %


  const curr = CURRENCIES[currency];

  const formatMoney = (val: number) => {
    const rounded = Math.round(val);
    if (currency === 'PKR') {
      if (Math.abs(rounded) >= 10000000) return `PKR ${(rounded / 10000000).toFixed(2)} Cr`;
      if (Math.abs(rounded) >= 100000) return `PKR ${(rounded / 100000).toFixed(2)} Lakh`;
      return `PKR ${rounded.toLocaleString()}`;
    }
    if (Math.abs(rounded) >= 1000000) return `${curr.symbol}${(rounded / 1000000).toFixed(2)}M`;
    if (Math.abs(rounded) >= 1000) return `${curr.symbol}${(rounded / 1000).toFixed(1)}k`;
    return `${curr.symbol}${rounded.toLocaleString()}`;
  };

  const handleCurrencyChange = (newCurr: CurrencyOption) => {
    setCurrency(newCurr);
    setInitialAmount(CURRENCIES[newCurr].defaultInitial);
    setMonthlyContribution(CURRENCIES[newCurr].defaultMonthly);
  };

  // Live calculation using the deterministic financial engine
  const calculation = useMemo(() => {
    return calculateFutureValue({
      initialAmount,
      monthlyContribution,
      expectedAnnualReturn: expectedReturn / 100,
      annualContributionIncrease: stepUp / 100,
      projectionYears,
      inflationRate: inflationRate / 100,
      contributionTiming: 'beginning',
      userCurrentAge: 26,
    });
  }, [initialAmount, monthlyContribution, expectedReturn, stepUp, projectionYears, inflationRate]);

  // Chart data points
  const chartData = useMemo(() => {
    return calculation.yearlyBreakdown.map((pt) => ({
      year: `Yr ${pt.year}`,
      age: pt.age,
      nominal: pt.nominalValue,
      real: pt.realValue,
      invested: pt.totalContributions,
    }));
  }, [calculation]);

  // Baseline vs Scenario comparison for What-If preview
  const comparison = useMemo(() => {
    const baseline = calculateFutureValue({
      initialAmount,
      monthlyContribution: Math.round(monthlyContribution * 0.65),
      expectedAnnualReturn: 0.06,
      annualContributionIncrease: 0,
      projectionYears,
      inflationRate: inflationRate / 100,
      contributionTiming: 'beginning',
      userCurrentAge: 26,
    });
    const delta = calculation.nominalFutureValue - baseline.nominalFutureValue;
    const percentage = baseline.nominalFutureValue > 0 ? (delta / baseline.nominalFutureValue) * 100 : 0;
    return {
      baselineValue: baseline.nominalFutureValue,
      optimizedValue: calculation.nominalFutureValue,
      delta,
      percentage,
    };
  }, [initialAmount, monthlyContribution, projectionYears, inflationRate, calculation]);

  // Reset sandbox to defaults
  const resetSandbox = () => {
    setInitialAmount(CURRENCIES[currency].defaultInitial);
    setMonthlyContribution(CURRENCIES[currency].defaultMonthly);
    setExpectedReturn(8.5);
    setProjectionYears(20);
    setInflationRate(3.2);
    setStepUp(3.0);
  };

  return (
    <main className="app-shell overflow-x-hidden selection:bg-[var(--accent-cyan)] selection:text-[#071210]">
      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Top Navigation Bar Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-main)]/90 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-[1420px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2">
            <Logo showTagline />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#sandbox" className="text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Interactive Sandbox
            </a>
            <a href="#how-it-works" className="text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              How It Works
            </a>
            <a href="#modules" className="text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Core Modules
            </a>
            <a href="#methodology" className="text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Methodology & Trust
            </a>
          </nav>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:border-[var(--border-color-hover)] hover:text-[var(--accent-cyan)]"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>

            <Link href="/demo">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FlaskConical className="h-3.5 w-3.5" />}
                className="shadow-lg shadow-[#0891B2]/20 dark:shadow-[#10B981]/20"
              >
                <span className="hidden sm:inline">Launch Demo</span>
                <span className="sm:hidden">Demo</span>
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-6 py-5 lg:hidden"
            >
              <nav className="flex flex-col space-y-3">
                <a
                  href="#sandbox"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                >
                  Interactive Sandbox
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                >
                  How It Works
                </a>
                <a
                  href="#modules"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                >
                  Core Modules
                </a>
                <a
                  href="#methodology"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                >
                  Methodology & Trust
                </a>
                <div className="pt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full">
                      Sign In to Account
                    </Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Hero Section Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="app-content relative mx-auto max-w-[1420px] px-5 pb-16 pt-12 sm:px-8 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Top pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan-soft)] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]" />
              Deterministic Simulation Ã‚Â· Grounded AI Explanation
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-.04em] text-[var(--text-primary)] sm:text-5xl lg:text-[68px]">
              See where your financial decisions{' '}
              <span className="bg-gradient-to-r from-[var(--accent-cyan)] via-teal-300 to-[var(--accent-violet)] bg-clip-text text-transparent">
                could lead.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Finance Manager turns your current financial situation, contributions, and assumptions into an interactive, multi-year projection you can explore, compare, and explain.
            </p>

            {/* Value Proposition Pills */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                <ShieldCheck className="h-4 w-4 text-[var(--status-success)]" /> Pure Deterministic Engine
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                <BrainCircuit className="h-4 w-4 text-[var(--accent-violet)]" /> Context-Grounded AI
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                <Lock className="h-4 w-4 text-[var(--accent-cyan)]" /> Zero Sign-up Demo
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Link href="/demo">
                <Button size="lg" leftIcon={<FlaskConical className="h-4 w-4" />} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Explore Interactive Demo
                </Button>
              </Link>
              <a href="#sandbox">
                <Button size="lg" variant="secondary" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
                  Test Live Sandbox Below
                </Button>
              </a>
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
              Full sandbox simulation available immediately. No credit card or registration required.
            </p>
          </motion.div>

          {/* Hero Visual Card: Live Mini Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[var(--accent-cyan-glow)] via-transparent to-[var(--accent-violet-glow)] blur-3xl pointer-events-none" />

            <Card variant="elevated" className="relative overflow-hidden p-6 sm:p-7 border border-[var(--border-color-strong)]">
              <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">Live Projection Model</span>
                  <h3 className="mt-1 text-2xl font-bold font-mono-numbers text-[var(--text-primary)] sm:text-3xl">
                    {formatMoney(calculation.nominalFutureValue)}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {projectionYears}-year nominal output Ã‚Â· {formatMoney(calculation.realFutureValue)} in today&apos;s purchasing power
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--accent-cyan)]/25 bg-[var(--accent-cyan-soft)] p-3 text-[var(--accent-cyan)]">
                  <LineChart className="h-6 w-6" />
                </div>
              </div>

              {/* Chart Preview */}
              <div className="mt-5 h-[210px] sm:h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -14, right: 4, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.36} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="heroRealGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(168,180,197,.08)" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} minTickGap={20} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-color-strong)',
                        borderRadius: 14,
                        fontSize: 12,
                      }}
                      formatter={(value: unknown, name: unknown) => [
                        formatMoney(Number(value)),
                        name === 'nominal' ? 'Projected Wealth' : 'Purchasing Power',
                      ]}
                    />
                    <Area type="monotone" dataKey="nominal" stroke="#10B981" strokeWidth={2.8} fill="url(#heroGradient)" />
                    <Area type="monotone" dataKey="real" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" fill="url(#heroRealGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Quick Metric Pillars */}
              <div className="mt-4 grid grid-cols-3 gap-2.5 border-t border-[var(--border-color)] pt-4 text-center">
                <div className="rounded-xl bg-[var(--bg-surface-soft)] p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Invested</p>
                  <p className="mt-0.5 font-mono text-xs font-bold text-[var(--text-primary)]">{formatMoney(calculation.totalInvested)}</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-surface-soft)] p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Compound Gain</p>
                  <p className="mt-0.5 font-mono text-xs font-bold text-[var(--status-success)]">+{formatMoney(calculation.totalGrowth)}</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-surface-soft)] p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Return Rate</p>
                  <p className="mt-0.5 font-mono text-xs font-bold text-[var(--accent-cyan)]">{expectedReturn.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ LIVE INTERACTIVE SANDBOX SECTION (#sandbox) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section id="sandbox" className="app-content border-y border-[var(--border-color)] bg-[var(--bg-surface)]/60 py-16 sm:py-24">
        <div className="mx-auto max-w-[1420px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[var(--accent-cyan)]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Live Deterministic Simulation Sandbox
              </div>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">
                Test assumptions. Watch compounding work.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Adjust any variable below. This calculation runs live in your browser using the exact deterministic engine that powers Finance Manager.
              </p>
            </div>

            {/* Currency Switcher & Reset */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] p-1">
                {(['USD', 'PKR', 'EUR', 'GBP'] as CurrencyOption[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCurrencyChange(c)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      currency === c
                        ? 'bg-[var(--accent-cyan)] text-[#071210]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={resetSandbox} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
                Reset
              </Button>
            </div>
          </div>

          {/* Main Sandbox Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
            {/* Interactive Controls Panel */}
            <Card variant="elevated" className="space-y-5 p-5 sm:p-6 border border-[var(--border-color-strong)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-[var(--accent-cyan)]" /> Input Parameters
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">Modify any number to recalculate the projection instantly.</p>
              </div>

              {/* Monthly Contribution */}
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Monthly Contribution</span>
                  <span className="font-mono text-[var(--accent-cyan)]">{formatMoney(monthlyContribution)}/mo</span>
                </div>
                <input
                  type="range"
                  min={currency === 'PKR' ? 5000 : 100}
                  max={currency === 'PKR' ? 200000 : 5000}
                  step={currency === 'PKR' ? 2500 : 50}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--accent-cyan)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                  <span>{formatMoney(currency === 'PKR' ? 5000 : 100)}</span>
                  <span>{formatMoney(currency === 'PKR' ? 200000 : 5000)}</span>
                </div>
              </div>

              {/* Starting Capital */}
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Starting Capital</span>
                  <span className="font-mono text-[var(--text-primary)]">{formatMoney(initialAmount)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={currency === 'PKR' ? 5000000 : 100000}
                  step={currency === 'PKR' ? 50000 : 1000}
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--accent-cyan)]"
                />
              </div>

              {/* Expected Return */}
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Expected Annual Return</span>
                  <span className="font-mono text-[var(--status-success)]">{expectedReturn.toFixed(1)}% / yr</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={16}
                  step={0.5}
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--status-success)]"
                />
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">Historical equity indexes average ~7Ã¢â‚¬â€œ10% annualized.</p>
              </div>

              {/* Time Horizon Buttons */}
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Projection Horizon</span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[5, 10, 20, 30].map((years) => (
                    <button
                      key={years}
                      onClick={() => setProjectionYears(years)}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        projectionYears === years
                          ? 'border-[var(--accent-cyan)]/40 bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)] shadow-sm'
                          : 'border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:border-[var(--border-color-hover)]'
                      }`}
                    >
                      {years} yrs
                    </button>
                  ))}
                </div>
              </div>

              {/* Inflation & Step-up Collapsible/Secondary */}
              <div className="border-t border-[var(--border-color)] pt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)]">Assumed Inflation Rate</span>
                    <span className="font-mono text-[var(--accent-violet)]">{inflationRate.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="mt-2 w-full accent-[var(--accent-violet)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)]">Annual Contribution Step-Up</span>
                    <span className="font-mono text-[var(--text-primary)]">{stepUp.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={stepUp}
                    onChange={(e) => setStepUp(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">Increasing your savings by 3% every year as income grows.</p>
                </div>
              </div>
            </Card>

            {/* Results & Live Visualization Column */}
            <div className="space-y-5">
              {/* Top 4 KPI Metrics */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Nominal Wealth</span>
                  <p className="mt-1 font-mono-numbers text-2xl font-bold text-[var(--accent-cyan)]">
                    {formatMoney(calculation.nominalFutureValue)}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">End balance in {projectionYears} years</p>
                </Card>

                <Card className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Real Value (Purchasing Power)</span>
                  <p className="mt-1 font-mono-numbers text-2xl font-bold text-[var(--accent-violet)]">
                    {formatMoney(calculation.realFutureValue)}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Adjusted for {inflationRate}% inflation</p>
                </Card>

                <Card className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Invested</span>
                  <p className="mt-1 font-mono-numbers text-2xl font-bold text-[var(--text-primary)]">
                    {formatMoney(calculation.totalInvested)}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Direct capital contributed</p>
                </Card>

                <Card className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Compound Interest</span>
                  <p className="mt-1 font-mono-numbers text-2xl font-bold text-[var(--status-success)]">
                    +{formatMoney(calculation.totalGrowth)}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    {calculation.totalInvested > 0
                      ? `${((calculation.totalGrowth / calculation.totalInvested) * 100).toFixed(0)}% growth on capital`
                      : 'Growth generated'}
                  </p>
                </Card>
              </div>

              {/* Chart Card */}
              <Card variant="elevated" className="p-5 sm:p-6 border border-[var(--border-color-strong)]">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="text-base font-bold text-[var(--text-primary)]">Compound Growth Trajectory</h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Comparing Nominal Projection (Cyan) vs Real Purchasing Power (Violet)
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[var(--accent-cyan)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-cyan)]" /> Nominal
                    </span>
                    <span className="flex items-center gap-1.5 text-[var(--accent-violet)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-violet)]" /> Inflation-Adjusted
                    </span>
                  </div>
                </div>

                <div className="mt-6 h-[260px] sm:h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="nominalFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.34} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="realFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.24} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(168,180,197,.08)" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} minTickGap={20} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={64}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-color-strong)',
                          borderRadius: 14,
                        }}
                        formatter={(val: unknown, name: unknown) => [
                          formatMoney(Number(val)),
                          name === 'nominal' ? 'Nominal Wealth' : name === 'real' ? 'Real Purchasing Power' : 'Invested',
                        ]}
                      />
                      <Area type="monotone" dataKey="nominal" stroke="#10B981" strokeWidth={3} fill="url(#nominalFill)" />
                      <Area type="monotone" dataKey="real" stroke="#F59E0B" strokeWidth={2.2} fill="url(#realFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Dynamic Grounded AI Insight Card (Exemplifies Copilot logic) */}
              <Card variant="glass" className="p-4 sm:p-5 border border-[var(--accent-violet)]/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[var(--accent-violet-soft)] p-2 text-[var(--accent-violet)] shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--accent-violet)]">Grounded Model Explanation</span>
                      <span className="rounded-full bg-[var(--accent-cyan-soft)] px-2 py-0.5 text-[9px] font-bold text-[var(--accent-cyan)]">
                        Zero Hallucination
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      Over <strong className="text-[var(--text-primary)]">{projectionYears} years</strong> at{' '}
                      <strong className="text-[var(--text-primary)]">{expectedReturn.toFixed(1)}% annual return</strong>, your regular contributions generate{' '}
                      <strong className="text-[var(--status-success)]">{formatMoney(calculation.totalGrowth)}</strong> in compounding interest. Growth represents{' '}
                      <strong className="text-[var(--text-primary)]">
                        {((calculation.totalGrowth / calculation.nominalFutureValue) * 100).toFixed(0)}%
                      </strong>{' '}
                      of your total projected wealth. However, inflation at {inflationRate.toFixed(1)}% discounts your purchasing power back to{' '}
                      <strong className="text-[var(--accent-violet)]">{formatMoney(calculation.realFutureValue)}</strong>.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Interactive What-If Scenario Delta Card */}
          <div className="mt-8 rounded-2xl border border-[var(--border-color-strong)] bg-gradient-to-r from-[var(--bg-surface-elevated)] via-[var(--bg-surface)] to-[var(--bg-surface-elevated)] p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-cyan)]">
                  What-If Comparison Engine
                </span>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">
                  Small strategy shifts compound into life-changing deltas.
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Comparing this strategy against a conservative baseline ({formatMoney(Math.round(monthlyContribution * 0.65))}/mo @ 6%).
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Modeled Wealth Delta</p>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-[var(--status-success)]">
                    +{formatMoney(comparison.delta)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Growth Multiplier</p>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-[var(--accent-cyan)]">
                    +{comparison.percentage.toFixed(0)}%
                  </p>
                </div>
                <Link href="/demo">
                  <Button size="sm" variant="accent" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Open What-If Lab
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ HOW IT WORKS (3 CLEAR STEPS) (#how-it-works) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section id="how-it-works" className="app-content mx-auto max-w-[1420px] px-5 py-20 sm:px-8 lg:px-12">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--accent-cyan)]">Architecture & Flow</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">
            How Finance Manager works in 3 clear steps.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            A transparent separation of concerns: deterministic math calculates the numbers, while AI translates those numbers into clear human context.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <Card variant="elevated" className="relative p-7 border border-[var(--border-color)] transition-all hover:border-[var(--accent-cyan)]/40">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]">
                <Wallet className="h-6 w-6" />
              </span>
              <span className="font-mono text-2xl font-black text-[var(--border-color-strong)]">01</span>
            </div>
            <h3 className="mt-6 text-lg font-bold text-[var(--text-primary)]">Capture Financial Baseline</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Input your current financial situation: savings, income, monthly living expenses, debt obligations, and regular contribution ability.
            </p>
            <div className="mt-4 rounded-xl bg-[var(--bg-surface-soft)] p-3 text-[11px] text-[var(--text-muted)] font-mono">
              Inputs: Cashflow Ã‚Â· Assets Ã‚Â· Debt Ã‚Â· Savings Rate
            </div>
          </Card>

          {/* Step 2 */}
          <Card variant="elevated" className="relative p-7 border border-[var(--border-color)] transition-all hover:border-[var(--accent-cyan)]/40">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]">
                <Calculator className="h-6 w-6" />
              </span>
              <span className="font-mono text-2xl font-black text-[var(--border-color-strong)]">02</span>
            </div>
            <h3 className="mt-6 text-lg font-bold text-[var(--text-primary)]">Deterministic Math Engine</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Mathematical formulas compute month-by-month compounding, contribution step-ups, inflation purchasing power discounting, and required goal funding.
            </p>
            <div className="mt-4 rounded-xl bg-[var(--bg-surface-soft)] p-3 text-[11px] text-[var(--text-muted)] font-mono">
              Engine: Compound Interest Ã‚Â· Annuity Due Ã‚Â· Real-Value
            </div>
          </Card>

          {/* Step 3 */}
          <Card variant="elevated" className="relative p-7 border border-[var(--border-color)] transition-all hover:border-[var(--accent-cyan)]/40">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--status-success-bg)] text-[var(--status-success)]">
                <BrainCircuit className="h-6 w-6" />
              </span>
              <span className="font-mono text-2xl font-black text-[var(--border-color-strong)]">03</span>
            </div>
            <h3 className="mt-6 text-lg font-bold text-[var(--text-primary)]">Context-Grounded AI Explanation</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Google Gemini inspects the verified mathematical output and explains trade-offs, goal milestones, and scenario differences in accessible natural language.
            </p>
            <div className="mt-4 rounded-xl bg-[var(--bg-surface-soft)] p-3 text-[11px] text-[var(--text-muted)] font-mono">
              Copilot: Scenario Q&A Ã‚Â· Milestone Feasibility Ã‚Â· Risk Trade-offs
            </div>
          </Card>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CORE APPLICATION MODULES SHOWCASE (#modules) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section id="modules" className="app-content border-y border-[var(--border-color)] bg-[var(--bg-surface)]/50 py-20">
        <div className="mx-auto max-w-[1420px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--accent-violet)]">Engineered Modules</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">
                Explore the complete Finance Manager suite.
              </h2>
            </div>
            <p className="max-w-md text-sm text-[var(--text-secondary)]">
              Every screen in Finance Manager serves a specific purpose in modeling, stress-testing, and understanding your financial journey.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Module 1: Simulator */}
            <Card
              variant="elevated"
              className="flex flex-col justify-between p-6 border border-[var(--border-color)] transition-all hover:-translate-y-1 hover:border-[var(--accent-cyan)]/40"
            >
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)]">Wealth Simulator</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Simulate wealth paths across 1Ã¢â‚¬â€œ40 years. Test contribution timings, inflation adjustments, and annual step-up rates with immediate chart feedback.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <Link href="/demo" className="inline-flex items-center text-xs font-bold text-[var(--accent-cyan)] hover:underline">
                  Launch Simulator <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Module 2: What-If Lab */}
            <Card
              variant="elevated"
              className="flex flex-col justify-between p-6 border border-[var(--border-color)] transition-all hover:-translate-y-1 hover:border-[var(--accent-violet)]/40"
            >
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)]">What-If Lab</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Create isolated financial experiments. Compare your current baseline against alternate assumptions side-by-side and calculate the exact wealth difference.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <Link href="/demo" className="inline-flex items-center text-xs font-bold text-[var(--accent-violet)] hover:underline">
                  Open What-If Lab <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Module 3: Goal Engineering */}
            <Card
              variant="elevated"
              className="flex flex-col justify-between p-6 border border-[var(--border-color)] transition-all hover:-translate-y-1 hover:border-[var(--status-success)]/40"
            >
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--status-success-bg)] text-[var(--status-success)]">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)]">Goal Engineering</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Set target milestones like home ownership or emergency reserves. Finance Manager solves for the required monthly allocation to hit your deadline.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <Link href="/demo" className="inline-flex items-center text-xs font-bold text-[var(--status-success)] hover:underline">
                  Plan Financial Goals <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            </Card>

            {/* Module 4: AI Copilot */}
            <Card
              variant="elevated"
              className="flex flex-col justify-between p-6 border border-[var(--border-color)] transition-all hover:-translate-y-1 hover:border-[var(--accent-cyan)]/40"
            >
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]">
                  <Bot className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)]">AI Copilot</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Ask questions about your model. Guardrailed Gemini integration interprets calculation results in plain language without fabricating numbers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <Link href="/demo" className="inline-flex items-center text-xs font-bold text-[var(--accent-cyan)] hover:underline">
                  Chat with Copilot <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ METHODOLOGY, TRUST & TECHNICAL INTEGRITY (#methodology) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section id="methodology" className="app-content mx-auto max-w-[1420px] px-5 py-20 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--status-success)]">Methodology & Guardrails</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">
            Engineered for mathematical truth.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            How Finance Manager ensures mathematical accuracy, privacy, and responsible AI usage.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Pillar 1 */}
          <Card className="p-6 border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[var(--status-success-bg)] p-2 text-[var(--status-success)]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">100% Deterministic Financial Calculations</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              All projections use verified compound interest and time-value-of-money equations verified by 27 automated unit tests. AI never estimates, fabricates, or replaces financial math.
            </p>
          </Card>

          {/* Pillar 2 */}
          <Card className="p-6 border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[var(--accent-violet-soft)] p-2 text-[var(--accent-violet)]">
                <Scale className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Nominal vs Real Purchasing Power</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Finance Manager always displays nominal future wealth alongside inflation-discounted real value. Users always see how currency depreciation affects real-world buying power over decades.
            </p>
          </Card>

          {/* Pillar 3 */}
          <Card className="p-6 border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[var(--accent-cyan-soft)] p-2 text-[var(--accent-cyan)]">
                <Database className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Dual Persistence Architecture</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Seamlessly toggle between offline Local Demo storage (ideal for recruiters and exhibitions with zero login friction) and Supabase PostgreSQL with strict Row Level Security (RLS).
            </p>
          </Card>

          {/* Pillar 4 */}
          <Card className="p-6 border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[var(--border-color-strong)] p-2 text-[var(--text-primary)]">
                <Cpu className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Rigid AI Guardrails & Privacy</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              The AI Copilot operates behind server-side Next.js route handlers. It receives only sanitized mathematical snapshots, with strict prompt boundaries disallowing ungrounded financial predictions.
            </p>
          </Card>
        </div>

        {/* Legal / Educational Disclaimer Card */}
        <div className="mt-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-5 text-center">
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text-secondary)]">Educational Simulator Notice:</strong> Finance Manager is an interactive educational simulation platform designed to demonstrate deterministic mathematical compounding and financial literacy principles. It does not provide certified financial, investment, or tax advice, and does not guarantee investment returns.
          </p>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ DEVELOPER PORTFOLIO & TECH STACK BADGE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="app-content border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/40 py-12">
        <div className="mx-auto max-w-[1420px] px-5 sm:px-8 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-cyan)]">
            <Code2 className="h-3.5 w-3.5" /> Full-Stack Engineering Portfolio Project
          </div>
          <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">
            Engineered with modern production technology
          </h3>
          <p className="mx-auto mt-1 max-w-xl text-xs text-[var(--text-secondary)]">
            Next.js 16 (App Router) Ã‚Â· React 19 Ã‚Â· TypeScript Ã‚Â· Tailwind CSS v4 Ã‚Â· Framer Motion Ã‚Â· Recharts Ã‚Â· Supabase Ã‚Â· Google Gemini AI
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              'Next.js 16',
              'React 19',
              'TypeScript',
              'Deterministic Financial Engine',
              '27 Unit Tests Passing',
              'Tailwind CSS v4',
              'Framer Motion',
              'Recharts',
              'Supabase SSR',
              'Google GenAI SDK',
              'Dual Persistence (Offline + DB)',
            ].map((tech) => (
              <span key={tech} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ FINAL CALL TO ACTION Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="app-content relative mx-auto max-w-[1420px] px-5 py-20 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-cyan)]/25 bg-gradient-to-r from-[#0C1727] via-[#101D30] to-[#0C1727] p-8 text-center sm:p-14 shadow-2xl">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent-cyan-glow)] blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[var(--accent-violet-glow)] blur-3xl" />

          <h2 className="relative text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            Explore your financial future in seconds.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Jump into the fully interactive exhibition demo with pre-loaded scenarios, or create your account to build a personalized financial picture.
          </p>

          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demo">
              <Button size="lg" leftIcon={<FlaskConical className="h-4 w-4" />} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Launch Interactive Demo
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ FOOTER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <footer className="app-content border-t border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1420px] flex-col justify-between gap-6 text-xs text-[var(--text-muted)] md:flex-row md:items-center">
          <div className="flex flex-col gap-1.5">
            <Logo size="sm" />
            <p className="mt-1 text-[11px]">Personal Financial Future Simulator Ã‚Â· AI Explains, Engine Calculates.</p>
          </div>

          <div className="flex flex-wrap gap-6">
            <a href="#sandbox" className="hover:text-[var(--text-primary)] transition">Sandbox</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition">How It Works</a>
            <a href="#modules" className="hover:text-[var(--text-primary)] transition">Modules</a>
            <a href="#methodology" className="hover:text-[var(--text-primary)] transition">Methodology</a>
            <Link href="/demo" className="hover:text-[var(--accent-cyan)] font-semibold transition">Demo Mode</Link>
            <Link href="/login" className="hover:text-[var(--text-primary)] transition">Sign In</Link>
          </div>

          <div className="text-[11px]">
            &copy; {new Date().getFullYear()} Finance Manager. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

