'use client';
import { useTranslations } from 'next-intl';
import { useChatStore } from '@/store/chat.store';
import { BarChart3, Globe, Newspaper, Zap } from 'lucide-react';

const EXAMPLE_ICONS = [Globe, BarChart3, Newspaper, Zap];

export function WelcomeScreen() {
  const t = useTranslations('welcome');
  const tApp = useTranslations('app');
  const { submitQuery } = useChatStore();
  const examples = t.raw('exampleQueries') as string[];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        {/* Animated logo mark */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)] opacity-20 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)] opacity-10 blur-md" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)]
            flex items-center justify-center shadow-glow-lg">
            <span className="text-3xl">🌐</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          {t('heading')}
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-md leading-relaxed">
          {t('subheading')}
        </p>

        {/* Tech badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {['LangGraph', 'Dynamic Orchestration', 'Real-time Streaming', 'Multi-Agent'].map((b) => (
            <span key={b}
              className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full
                bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Example queries */}
      <div className="w-full max-w-2xl">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 text-center">
          {t('examples')}
        </p>
        <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border)]
          hover:[&::-webkit-scrollbar-thumb]:bg-[var(--accent)]/50">
          {examples.map((q, i) => {
            const Icon = EXAMPLE_ICONS[i % EXAMPLE_ICONS.length];
            return (
              <button
                key={i}
                onClick={() => submitQuery(q)}
                className="group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left
                  bg-[var(--bg-card)] border border-[var(--border)]
                  hover:border-[var(--accent)]/40 hover:bg-[var(--accent-light)]
                  hover:shadow-glow-sm transition-all duration-200"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-light)]
                  flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={15} className="text-[var(--accent)]" />
                </div>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {q}
                </span>
                <span className="ml-auto flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">→</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
