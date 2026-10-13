'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronRight, Send, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useWealth } from '../../lib/context/WealthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const CopilotView: React.FC = () => {
  const { aiMessages, sendCopilotMessage, financialProfile, calculationResult, userProfile } = useWealth();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages, isSending]);

  const send = async (text = input) => {
    const value = text.trim();
    if (!value || isSending) return;
    setInput('');
    setIsSending(true);
    try { await sendCopilotMessage(value); } finally { setIsSending(false); }
  };

  const suggestions = ['Explain my current projection.', 'What has the biggest effect on my projected wealth?', 'Explain my goal progress.', 'Why did my scenario change the result?'];
  const currency = userProfile?.currency || financialProfile?.assumptions.currency || 'PKR';

  return (
    <div className="space-y-6">
      <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--accent-violet)]">Intelligence layer</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.03em] text-[var(--text-primary)] sm:text-4xl">Understand your projection.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Ask questions about your numbers, assumptions, goals, and scenarios. Copilot explains the model—it doesn&apos;t replace it.</p></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <Card className="flex min-h-[640px] flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-4 sm:p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]"><Sparkles className="h-5 w-5" /></span><div><p className="text-sm font-bold text-[var(--text-primary)]">WealthOS Copilot</p><p className="text-[10px] text-[var(--text-muted)]">Using your current WealthOS context</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-success-bg)] px-2.5 py-1 text-[10px] font-bold text-[var(--status-success)]"><ShieldCheck className="h-3.5 w-3.5" />Grounded</span></div>

          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {aiMessages.length === 0 && <div className="flex min-h-[360px] items-center justify-center"><div className="max-w-md text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]"><Bot className="h-7 w-7" /></span><h2 className="mt-5 text-xl font-bold text-[var(--text-primary)]">Start with a question.</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Try one of the prompts below to see how WealthOS turns calculated results into a plain-language explanation.</p></div></div>}
            {aiMessages.filter((m) => m.role !== 'system').map((msg) => {
              const userMessage = msg.role === 'user';
              return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex gap-3 ${userMessage ? 'justify-end' : 'justify-start'}`}>
                {!userMessage && <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"><Bot className="h-4 w-4" /></span>}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-6 sm:max-w-[72%] ${userMessage ? 'rounded-br-md bg-[var(--accent-cyan)] text-[#07111F]' : 'rounded-bl-md border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-[var(--text-primary)]'}`}><p className="whitespace-pre-wrap">{msg.content}</p><p className={`mt-2 text-[10px] ${userMessage ? 'text-[#07111F]/60' : 'text-[var(--text-muted)]'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                {userMessage && <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-violet)]/20 bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]"><User className="h-4 w-4" /></span>}
              </motion.div>;
            })}
            {isSending && <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-violet-soft)] text-[var(--accent-violet)]"><Sparkles className="h-4 w-4 animate-pulse" /></span>Copilot is explaining the current model output…</div>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-3 sm:p-4"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)} disabled={isSending} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent-violet)]/25 hover:text-[var(--accent-violet)] disabled:opacity-50"><Sparkles className="h-3 w-3" />{suggestion}</button>)}</div><form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex gap-2"><input aria-label="Ask WealthOS Copilot" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask about your projection, goals, or assumptions…" className="min-w-0 flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-violet)]/45" /><Button type="submit" disabled={!input.trim() || isSending} variant="accent" rightIcon={<Send className="h-4 w-4" />}>Ask</Button></form></div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--text-muted)]">Current context</p><div className="mt-4 space-y-3">{[
            ['Monthly contribution', `${currency} ${Math.round(financialProfile?.monthlyContribution || 0).toLocaleString()}`],
            ['Expected return', `${((financialProfile?.assumptions.expectedAnnualReturn || 0) * 100).toFixed(1)}%`],
            ['Projection horizon', `${financialProfile?.assumptions.projectionYears || 0} years`],
            ['Projected wealth', `${currency} ${Math.round(calculationResult?.projectedNominalFutureValue || 0).toLocaleString()}`],
          ].map(([label,value]) => <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] px-3 py-2.5"><span className="text-[11px] text-[var(--text-muted)]">{label}</span><span className="font-mono text-[11px] font-bold text-[var(--text-primary)]">{value}</span></div>)}</div></Card>
          <Card variant="glass" className="p-5"><div className="flex items-center gap-2 text-[var(--accent-violet)]"><ShieldCheck className="h-4 w-4" /><p className="text-xs font-bold">Model boundary</p></div><p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">Copilot explains the data and calculations already inside WealthOS. It does not guarantee future outcomes or execute financial transactions.</p><button onClick={()=>send('Explain the difference between a model assumption and a prediction.')} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-violet)] hover:underline">Ask about the model <ChevronRight className="h-3.5 w-3.5" /></button></Card>
        </div>
      </div>
    </div>
  );
};
