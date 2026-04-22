'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AgentEvent } from '@/types';
import {
  Brain, Search, BarChart3, Newspaper,
  FileText, Cpu, CheckCircle2, XCircle,
  Loader2, Zap, ChevronDown, ChevronUp,
} from 'lucide-react';

const AGENT_META: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  orchestrator:        { icon: Brain,     color: '#818cf8', bgColor: 'rgba(129,140,248,0.12)', borderColor: 'rgba(129,140,248,0.25)' },
  query_understanding: { icon: Search,    color: '#34d399', bgColor: 'rgba(52,211,153,0.12)',  borderColor: 'rgba(52,211,153,0.25)'  },
  market_retrieval:    { icon: BarChart3, color: '#22d3ee', bgColor: 'rgba(34,211,238,0.12)',  borderColor: 'rgba(34,211,238,0.25)'  },
  signal_analysis:     { icon: Newspaper, color: '#fbbf24', bgColor: 'rgba(251,191,36,0.12)',  borderColor: 'rgba(251,191,36,0.25)'  },
  aggregator:          { icon: FileText,  color: '#f472b6', bgColor: 'rgba(244,114,182,0.12)', borderColor: 'rgba(244,114,182,0.25)' },
  system:              { icon: Cpu,       color: '#94a3b8', bgColor: 'rgba(148,163,184,0.08)', borderColor: 'rgba(148,163,184,0.15)' },
};

function StatusDot({ status }: { status: string }) {
  if (status === 'completed' || status === 'done') {
    return <CheckCircle2 size={13} className="text-[var(--success)] flex-shrink-0" />;
  }
  if (status === 'error') {
    return <XCircle size={13} className="text-[var(--error)] flex-shrink-0" />;
  }
  if (status === 'started' || status === 'streaming') {
    return (
      <div className="relative flex-shrink-0 w-3 h-3">
        <div className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping-slow" />
        <div className="w-3 h-3 rounded-full bg-[var(--accent)] relative" />
      </div>
    );
  }
  if (status === 'planned') {
    return <Zap size={13} className="text-[var(--warning)] flex-shrink-0" />;
  }
  return <Loader2 size={13} className="text-[var(--text-muted)] animate-spin flex-shrink-0" />;
}

interface Props {
  events: AgentEvent[];
  isStreaming: boolean;
}

export function AgentTimeline({ events, isStreaming }: Props) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const tAgents = useTranslations('agents');
  const tStatus = useTranslations('status');
  const t = useTranslations('chat');

  const agentLabels: Record<string, string> = {
    orchestrator:        tAgents('orchestrator'),
    query_understanding: tAgents('query_understanding'),
    market_retrieval:    tAgents('market_retrieval'),
    signal_analysis:     tAgents('signal_analysis'),
    aggregator:          tAgents('aggregator'),
    system:              tAgents('system'),
  };
  const statusLabels: Record<string, string> = {
    planned:   tStatus('planned'),
    started:   tStatus('started'),
    completed: tStatus('completed'),
    error:     tStatus('error'),
    done:      tStatus('done'),
    streaming: tStatus('streaming'),
  };

  // Deduplicate: keep the last event per agent to show current state
  const agentMap = new Map<string, AgentEvent & { index: number }>();
  events.forEach((e, i) => agentMap.set(e.agent, { ...e, index: i }));
  const uniqueEvents = Array.from(agentMap.values()).sort((a, b) => a.index - b.index);

  // Assign step numbers to non-system agents
  let stepCount = 0;
  const stepNumbers: Record<string, number> = {};
  for (const ev of uniqueEvents) {
    if (ev.agent !== 'system') stepNumbers[ev.agent] = ++stepCount;
  }

  const toggleExpand = (key: string) =>
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)]
        bg-gradient-to-r from-[var(--accent-light)] to-transparent">
        <div className="flex items-center gap-1.5">
          {isStreaming && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-[10px] font-bold text-[var(--success)] uppercase tracking-wider">LIVE</span>
            </>
          )}
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)] ml-1">
          {t('streamingLabel')}
        </span>
        {isStreaming && (
          <div className="ml-auto flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
          </div>
        )}
      </div>

      {/* Timeline body */}
      <div className="relative px-4 py-3">
        {/* Vertical connector line */}
        {uniqueEvents.length > 1 && (
          <div
            className="timeline-line"
            style={{ left: '31px', top: '28px', bottom: '12px' }}
          />
        )}

        <div className="space-y-1">
          {uniqueEvents.map((event, i) => {
            const meta = AGENT_META[event.agent] ?? AGENT_META.system;
            const Icon = meta.icon;
            const agentLabel = agentLabels[event.agent] ?? event.agent;
            const statusLabel = statusLabels[event.status] ?? event.status;
            const stepNum = stepNumbers[event.agent];
            const evKey = `${event.agent}-${i}`;
            const isExpanded = expandedKeys.has(evKey);
            const reasoning = event.data?.reasoning as string | undefined;
            const keyMarkets = event.data?.key_markets as string[] | undefined;
            const plan = event.data?.plan as string[] | undefined;
            const totalSignals = event.data?.total_signals as number | undefined;
            const marketSize = event.data?.market_size_usd_bn as number | undefined;
            const growthRate = event.data?.growth_rate_pct as number | undefined;

            return (
              <div
                key={evKey}
                className="stagger-item relative flex items-start gap-3 py-2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Icon + step number badge */}
                <div className="flex-shrink-0 relative z-10 mt-0.5">
                  {stepNum !== undefined && (
                    <div
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full z-20
                        flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                      style={{ background: meta.color }}
                    >
                      {stepNum}
                    </div>
                  )}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: meta.bgColor, border: `1px solid ${meta.borderColor}` }}
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: label + status badge + status dot */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {agentLabel}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none"
                      style={{ background: meta.bgColor, color: meta.color }}
                    >
                      {statusLabel}
                    </span>
                    <span className="ml-auto">
                      <StatusDot status={event.status} />
                    </span>
                  </div>

                  {/* Row 2: message text */}
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
                    {event.message}
                  </p>

                  {/* Row 3: data chips (only when completed) */}
                  {event.status === 'completed' && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {keyMarkets?.slice(0, 5).map((m) => (
                        <span key={m} className="text-[10px] px-2 py-0.5 rounded-full
                          bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
                          {m}
                        </span>
                      ))}
                      {plan?.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full
                          bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]">
                          → {p}
                        </span>
                      ))}
                      {totalSignals != null && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full
                          bg-yellow-500/10 text-[var(--warning)] border border-yellow-500/20">
                          {totalSignals} signals
                        </span>
                      )}
                      {marketSize != null && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full
                          bg-cyan-500/10 text-[var(--cyan)] border border-cyan-500/20">
                          ${marketSize}B market
                        </span>
                      )}
                      {growthRate != null && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full
                          bg-green-500/10 text-[var(--success)] border border-green-500/20">
                          +{growthRate}% YoY
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expand/collapse AI reasoning (orchestrator planned event) */}
                  {reasoning && (
                    <>
                      <button
                        onClick={() => toggleExpand(evKey)}
                        className="flex items-center gap-1 mt-1.5 text-[10px]
                          text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        {isExpanded ? 'Hide reasoning' : 'Show AI reasoning'}
                      </button>
                      {isExpanded && (
                        <div
                          className="animate-reveal mt-1.5 px-3 py-2.5 rounded-lg text-[11px]
                            text-[var(--text-secondary)] leading-relaxed"
                          style={{ background: meta.bgColor, border: `1px solid ${meta.borderColor}` }}
                        >
                          {reasoning}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
