'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Check, GitCompare, Save, Sparkles, Trash2, FlaskConical, UserCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useWealth } from '../../lib/context/WealthContext';
import { ScenarioService } from '../../lib/services/scenarioService';
import { Button } from '../ui/Button';
import { Card, CardDescription, CardTitle } from '../ui/Card';
import { SliderField } from '../ui/SliderField';
import { Input } from '../ui/Input';
import { Skeleton } from '../ui/Skeleton';
import type { FinancialAssumptions } from '../../types';

// ─── module-level singleton (stable across re-renders) ───────────────────────
const service = new ScenarioService();
const money = (currency: string, value: number) =>
  `${currency} ${Math.round(value).toLocaleString()}`;

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function ScenariosLoadingSkeleton() {
  return (
    <div className="space-y-7" aria-busy="true" aria-label="Loading What-If Lab">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-96 max-w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      {/* Grid */}
      <div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        {/* Controls panel */}
        <div className="rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] p-6 space-y-6">
          <Skeleton className="h-4 w-36" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
        {/* Results panel */}
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty / setup state ──────────────────────────────────────────────────────
function ScenariosEmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--accent-violet)]/30 bg-[var(--accent-violet-soft)]"
      >
        <FlaskConical className="h-9 w-9 text-[var(--accent-violet)]" />
      </motion.div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="max-w-md space-y-3"
      >
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Set up your financial profile first
        </h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          The What-If Lab runs deterministic projections on your actual financial
          data. Complete your onboarding so the engine has your income, expenses,
          savings, investments, and assumptions to work with.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.22, duration: 0.38 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Link href="/onboarding">
          <Button leftIcon={<UserCircle className="h-4 w-4" />} size="lg">
            Complete your profile
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline" size="lg">
            Open settings
          </Button>
        </Link>
      </motion.div>

      {/* decorative hint cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-4 grid gap-3 sm:grid-cols-3 text-left max-w-2xl"
      >
        {[
          { label: 'Baseline vs scenario', desc: 'Compare two different sets of assumptions side-by-side.' },
          { label: 'Deterministic engine', desc: 'Every projection uses the same compound-interest model.' },
          { label: 'Save experiments', desc: 'Persist named scenarios to your WealthOS account.' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4 space-y-1.5"
          >
            <p className="text-xs font-bold text-[var(--text-primary)]">{item.label}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main What-If Lab UI ──────────────────────────────────────────────────────
export const ScenariosView: React.FC = () => {
  // ── All hooks must run unconditionally (Rules of Hooks) ──────────────────
  const {
    financialProfile,
    userProfile,
    scenarios,
    isLoading,
    deleteScenario,
    saveScenarioWithAssumptions,
  } = useWealth();

  const [savedName, setSavedName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Derive base assumptions once so we can reference them in initialisers.
  const base = financialProfile?.assumptions ?? null;
  const currency =
    userProfile?.currency ?? financialProfile?.assumptions?.currency ?? 'PKR';

  /**
   * `alternate` is seeded lazily: the useState initialiser runs once at mount
   * time. Because ScenariosView is only mounted after the loading gate in
   * AppWorkspace, financialProfile is almost always already populated when this
   * component first mounts, so the seed is correct on the very first render.
   *
   * We also track `financialProfile?.updatedAt` so that if the user saves new
   * settings while on this page we re-seed the controls via the React-blessed
   * "storing information from previous renders" pattern (conditional setState
   * during render, guarded by a prev-value comparison).
   */
  const seedFromBase = (b: typeof base): FinancialAssumptions | null =>
    b
      ? {
          ...b,
          expectedAnnualReturn: Math.min(0.20, b.expectedAnnualReturn + 0.03),
          annualContributionIncrease: Math.min(0.20, b.annualContributionIncrease + 0.03),
        }
      : null;

  const [alternate, setAlternate] = useState<FinancialAssumptions | null>(
    () => seedFromBase(base)
  );

  // Track the profile's updatedAt so we can re-seed controls when the user
  // saves new settings from the Settings page while the lab is open.
  const [trackedUpdatedAt, setTrackedUpdatedAt] = useState<string | undefined>(
    () => financialProfile?.updatedAt
  );

  // React-blessed "storing information from previous renders" pattern.
  // When updatedAt changes (new settings saved), re-seed the alternate controls.
  if (financialProfile?.updatedAt !== trackedUpdatedAt) {
    setTrackedUpdatedAt(financialProfile?.updatedAt);
    setAlternate(seedFromBase(base));
  }

  // Compute comparison — null when any dependency is missing.
  const comparison = useMemo(() => {
    if (!financialProfile || !userProfile || !alternate) return null;
    return service.compareScenarios(
      financialProfile,
      financialProfile.assumptions,
      alternate,
      userProfile.age,
    );
  }, [financialProfile, userProfile, alternate]);

  // ── After all hooks: branch on loading / missing data / ready ────────────

  // CASE 1: Global loading state (auth resolving or data fetch in-flight)
  if (isLoading) {
    return <ScenariosLoadingSkeleton />;
  }

  // CASE 3: Financial profile genuinely absent after loading — user needs onboarding
  if (!financialProfile || !userProfile) {
    return <ScenariosEmptyState />;
  }

  // CASE 2 (transition): data loaded but useEffect hasn't fired yet (microtask).
  // Show a brief spinner rather than a blank screen.
  if (!alternate || !comparison || !base) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 text-[var(--text-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Preparing What-If Lab…</span>
      </div>
    );
  }

  // At this point: financialProfile ✓, userProfile ✓, alternate ✓, comparison ✓
  const maxYears = Math.max(
    comparison.baselineResult.yearlyBreakdown.length,
    comparison.alternateResult.yearlyBreakdown.length
  );
  const chartData = Array.from({ length: maxYears }, (_, index) => {
    const year = index + 1;
    const basePoint = comparison.baselineResult.yearlyBreakdown[index];
    const altPoint = comparison.alternateResult.yearlyBreakdown[index];
    return {
      year,
      baseline: basePoint?.nominalValue ?? comparison.baselineResult.projectedNominalFutureValue,
      alternate: altPoint?.nominalValue ?? comparison.alternateResult.projectedNominalFutureValue,
    };
  });

  const diff = comparison.difference.nominalDifference;
  const direction = diff >= 0;

  const save = async () => {
    const name =
      savedName.trim() ||
      `Scenario · ${(alternate.expectedAnnualReturn * 100).toFixed(1)}% return`;
    setSaving(true);
    try {
      await saveScenarioWithAssumptions(name, alternate);
      setSaved(true);
      setSavedName('');
      window.setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  // ── Full What-If Lab render ───────────────────────────────────────────────
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-violet)]">
            Experiment lab
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">
            What happens when you change one thing?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Compare your current plan with an alternative set of assumptions. The
            same deterministic engine calculates both paths.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-violet)]/20 bg-[var(--accent-violet-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-violet)]">
          <GitCompare className="h-3.5 w-3.5" />
          Baseline vs scenario
        </span>
      </div>

      {/* Baseline assumption summary */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--text-muted)] mb-3">
          Your saved baseline
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          {[
            { label: 'Expected return', value: `${(base.expectedAnnualReturn * 100).toFixed(1)}%` },
            { label: 'Inflation', value: `${(base.inflationRate * 100).toFixed(1)}%` },
            { label: 'Annual step-up', value: `${(base.annualContributionIncrease * 100).toFixed(0)}%` },
            { label: 'Projection', value: `${base.projectionYears} years` },
          ].map((item) => (
            <div key={item.label} className="space-y-0.5">
              <p className="text-[var(--text-muted)]">{item.label}</p>
              <p className="font-mono font-bold text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        {/* Controls card */}
        <Card variant="elevated" className="p-4 sm:p-6">
          <div className="border-b border-[var(--border-color)] pb-5">
            <CardTitle>
              <Sparkles className="h-4 w-4 text-[var(--accent-violet)]" />
              Scenario controls
            </CardTitle>
            <CardDescription className="mt-1">
              Experiment with assumptions without changing your saved baseline.
            </CardDescription>
          </div>

          <div className="mt-6 space-y-6">
            <SliderField
              label="Scenario return"
              value={alternate.expectedAnnualReturn * 100}
              min={0}
              max={20}
              step={0.5}
              onChange={(v) => setAlternate({ ...alternate, expectedAnnualReturn: v / 100 })}
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
            <SliderField
              label="Scenario annual increase"
              value={alternate.annualContributionIncrease * 100}
              min={0}
              max={20}
              step={1}
              onChange={(v) => setAlternate({ ...alternate, annualContributionIncrease: v / 100 })}
              formatValue={(v) => `${v.toFixed(0)}%`}
            />
            <SliderField
              label="Scenario inflation"
              value={alternate.inflationRate * 100}
              min={0}
              max={12}
              step={0.5}
              onChange={(v) => setAlternate({ ...alternate, inflationRate: v / 100 })}
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
            <SliderField
              label="Scenario duration"
              value={alternate.projectionYears}
              min={1}
              max={40}
              onChange={(v) => setAlternate({ ...alternate, projectionYears: v })}
              formatValue={(v) => `${v} years`}
            />

            {/* Delta summary */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--text-muted)]">
                What changed?
              </p>
              <div className="mt-3 space-y-2 text-xs">
                {[
                  {
                    label: 'Return',
                    from: `${(base.expectedAnnualReturn * 100).toFixed(1)}%`,
                    to: `${(alternate.expectedAnnualReturn * 100).toFixed(1)}%`,
                  },
                  {
                    label: 'Annual increase',
                    from: `${(base.annualContributionIncrease * 100).toFixed(0)}%`,
                    to: `${(alternate.annualContributionIncrease * 100).toFixed(0)}%`,
                  },
                  {
                    label: 'Inflation',
                    from: `${(base.inflationRate * 100).toFixed(1)}%`,
                    to: `${(alternate.inflationRate * 100).toFixed(1)}%`,
                  },
                  {
                    label: 'Duration',
                    from: `${base.projectionYears} yr`,
                    to: `${alternate.projectionYears} yr`,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-3">
                    <span className="text-[var(--text-muted)]">{row.label}</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {row.from} → {row.to}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results column */}
        <div className="space-y-5">
          {/* Projected value cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--text-muted)]">
                Current plan
              </p>
              <p className="mt-3 font-mono-numbers text-2xl font-bold text-[var(--text-primary)]">
                {money(currency, comparison.baselineResult.projectedNominalFutureValue)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Your saved assumptions.</p>
            </Card>

            <Card variant="accent" className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--text-muted)]">
                New scenario
              </p>
              <p className="mt-3 font-mono-numbers text-2xl font-bold text-[var(--text-primary)]">
                {money(currency, comparison.alternateResult.projectedNominalFutureValue)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Calculated from the alternate assumptions.
              </p>
            </Card>
          </div>

          {/* Difference + chart */}
          <motion.div
            layout
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--text-muted)]">
                  Projected difference
                </p>
                <p
                  className={`mt-2 font-mono-numbers text-3xl font-bold ${
                    direction ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'
                  }`}
                >
                  {direction ? '+' : '−'}
                  {money(currency, Math.abs(diff))}
                </p>
              </div>
              <div className="text-right text-xs text-[var(--text-secondary)]">
                {direction ? '+' : ''}
                {comparison.difference.percentageChange}% relative to baseline
              </div>
            </div>

            <div className="mt-7 h-[220px] sm:h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 4, left: -10, bottom: 4 }}>
                  <defs>
                    <linearGradient id="scenarioBase" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#8B7CFF" stopOpacity=".18" />
                      <stop offset="100%" stopColor="#8B7CFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="scenarioAlt" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#63DDF5" stopOpacity=".28" />
                      <stop offset="100%" stopColor="#63DDF5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(168,180,197,.10)" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    minTickGap={20}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    tickFormatter={(v) => `${currency} ${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color-strong)',
                      borderRadius: 14,
                    }}
                    formatter={(value: unknown, name: unknown) => [
                      money(currency, Number(value)),
                      name === 'baseline' ? 'Current plan' : 'Scenario',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="#8B7CFF"
                    strokeWidth={2.5}
                    fill="url(#scenarioBase)"
                  />
                  <Area
                    type="monotone"
                    dataKey="alternate"
                    stroke="#63DDF5"
                    strokeWidth={3}
                    fill="url(#scenarioAlt)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Save experiment */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-[var(--accent-cyan)]" />
              <p className="text-sm font-bold text-[var(--text-primary)]">Save this experiment</p>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                aria-label="Scenario name"
                placeholder="e.g. Higher growth assumptions"
                value={savedName}
                onChange={(e) => setSavedName(e.target.value)}
              />
              <Button
                onClick={save}
                isLoading={saving}
                leftIcon={saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              >
                {saved ? 'Saved' : 'Save scenario'}
              </Button>
            </div>
          </Card>

          {/* Saved scenarios list */}
          <div>
            <div className="mb-3">
              <p className="text-xs font-bold text-[var(--text-primary)]">Saved scenarios</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                Your experiments remain linked to your WealthOS account.
              </p>
            </div>

            {scenarios.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {scenario.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        Projected {money(currency, scenario.resultsJson.projectedNominalFutureValue)}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                        {(scenario.variablesJson.assumptionsSnapshot.expectedAnnualReturn * 100).toFixed(1)}
                        % return · {scenario.variablesJson.assumptionsSnapshot.projectionYears} years
                      </p>
                    </div>
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      aria-label={`Delete ${scenario.name}`}
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--status-danger-bg)] hover:text-[var(--status-danger)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-color-strong)] p-8 text-center text-xs text-[var(--text-muted)]">
                No saved scenarios yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
