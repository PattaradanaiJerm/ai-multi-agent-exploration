'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ExploreResult } from '@/types';
import {
  BarChart3, Globe, TrendingUp, Newspaper,
  CheckCircle2, Copy, Check, Bot,
} from 'lucide-react';

interface Props { result: ExploreResult }

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-secondary)]
      border border-[var(--border)]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-sm font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

export function ReportView({ result }: Props) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('report');
  const tAgents = useTranslations('agents');

  const copyReport = () => {
    navigator.clipboard.writeText(result.final_report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const agentColors: Record<string, string> = {
    query_understanding: '#34d399',
    market_retrieval: '#22d3ee',
    signal_analysis: '#fbbf24',
    aggregator: '#f472b6',
    orchestrator: '#818cf8',
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)] animate-fade-in">
      {/* Report header */}
      <div className="px-5 py-4 border-b border-[var(--border)]
        bg-gradient-to-r from-[var(--accent-light)] via-transparent to-cyan-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)]
              flex items-center justify-center shadow-glow-sm">
              <Bot size={15} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{t('title')}</h3>
              {result.query_summary && (
                <p className="text-[10px] text-[var(--text-muted)]">
                  {result.query_summary.topic} · {result.query_summary.region}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={copyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
              text-[var(--text-secondary)] hover:text-[var(--accent)]
              bg-[var(--bg-secondary)] border border-[var(--border)]
              hover:border-[var(--accent)]/30 hover:bg-[var(--accent-light)]
              transition-all duration-200"
          >
            {copied ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
            <span>{copied ? t('copied') : t('copyReport')}</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {result.key_markets.length > 0 && (
            <StatCard
              label={t('keyMarkets')}
              value={`${result.key_markets.length} markets`}
              icon={Globe}
              color="#818cf8"
            />
          )}
          {result.market_size_usd_bn && (
            <StatCard
              label={t('marketSize')}
              value={`$${result.market_size_usd_bn}B`}
              icon={BarChart3}
              color="#22d3ee"
            />
          )}
          {result.growth_rate_pct && (
            <StatCard
              label={t('growthRate')}
              value={`+${result.growth_rate_pct}% YoY`}
              icon={TrendingUp}
              color="#34d399"
            />
          )}
          {result.signal_stats && (
            <StatCard
              label={t('totalSignals')}
              value={`${result.signal_stats.totalSignals} signals`}
              icon={Newspaper}
              color="#fbbf24"
            />
          )}
        </div>
      </div>

      {/* Key markets */}
      {result.key_markets.length > 0 && (
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2 flex-wrap">
          <Globe size={13} className="text-[var(--text-muted)]" />
          {result.key_markets.map((m) => (
            <span key={m}
              className="px-2.5 py-1 text-xs rounded-full font-medium
                bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Signal stats */}
      {result.signal_stats && (
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            {t('signalStats')}:
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--success)]">
            ▲ {result.signal_stats.positiveSignals} {t('positive')}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--error)]">
            ▼ {result.signal_stats.negativeSignals} {t('negative')}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--warning)]">
            ◆ {result.signal_stats.cautiousSignals} {t('cautious')}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--cyan)]">
            ★ {result.signal_stats.highImpactSignals} {t('highImpact')}
          </span>
        </div>
      )}

      {/* Agents used */}
      {result.agents_executed.length > 0 && (
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mr-1">
            {t('agentsUsed')}:
          </span>
          {result.agents_executed.map((a) => (
            <span key={a} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${agentColors[a] ?? '#818cf8'}18`,
                color: agentColors[a] ?? '#818cf8',
                border: `1px solid ${agentColors[a] ?? '#818cf8'}30`,
              }}>
              <CheckCircle2 size={9} />
              {(tAgents as any)[a] || a}
            </span>
          ))}
        </div>
      )}

      {/* Markdown Report */}
      <div className="px-5 py-5">
        <div className="report-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {result.final_report}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
