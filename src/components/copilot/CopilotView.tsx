'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWealth } from '../../lib/context/WealthContext';
import { Bot, Send, ShieldAlert, Sparkles, User, RefreshCw } from 'lucide-react';

export const CopilotView: React.FC = () => {
  const { aiMessages, sendCopilotMessage } = useWealth();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;
    const query = input.trim();
    setInput('');
    setIsSending(true);
    try {
      await sendCopilotMessage(query);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isSending) return;
    setIsSending(true);
    try {
      await sendCopilotMessage(suggestion);
    } finally {
      setIsSending(false);
    }
  };

  const suggestions = [
    'Explain the impact of inflation on my real wealth projection',
    'How does compound interest boost my growth over time?',
    'What is my current disposable surplus and savings rate?',
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">AI Financial Copilot</h2>
            <p className="text-[11px] text-slate-400">
              Context-Aware Educational Explanations (Engine is source of truth)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          No Guaranteed Advice
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {aiMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            Analyzing engine calculation results...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex overflow-x-auto gap-2">
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(sug)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 text-[11px] whitespace-nowrap transition-all"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {sug}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder="Ask a question about your financial projections or assumptions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
};
