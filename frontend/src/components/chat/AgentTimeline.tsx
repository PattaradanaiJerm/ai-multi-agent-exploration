'use client';
import { useTranslations } from 'next-intl';
import type { AgentEvent } from '@/types';
import {
  Brain, Search, BarChart3, Newspaper,
  FileText, Cpu, CheckCircle2, XCircle,
  Loader2, Zap,
} from 'lucide-react';

const AGENT_META: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  orchestrator: { icon: Brain,      color: '#818cf8', bgColor: 'rgba(129,140,248,0.12)' },
  query_understanding: { icon: Search,     color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
  market_retrieval:    { icon: BarChart3,  color: '#22d3ee', bgColor: 'rgba(34,211,238,0.12)' },
  signal_analysis:     { icon: Newspaper,  color: '#fbbf24', bgColor: 'rgba(251,191,36,0.12)' },
  aggregator:          { icon: FileText,   color: '#f472b6', bgColor: 'rgba(244,114,182,0.12)' },
  system:              { icon: Cpu,        color: '#94a3b8', bgColor: 'rgba(148,163,184,0.08)' },
};

function StatusDot({ status }: { status: string }) {
  if (status === 'completed' || status === 'done') {
    return <CheckCircle2 size={14} className="text-[var(--success)] flex-shrink-0" />;
  }
  if (status === 'error') {
    return <XCircle size={14} className="text-[var(--error)] flex-shrink-0" />;
  }
  if (status === 'started' || status === 'streaming') {
    return (
      <div className="relative flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-ping-slow absolute" />
        <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
      </div>
    );
  }
  if (status === 'planned') {
    return <Zap size={14} className="text-[var(--warning)] flex-shrink-0" />;
  }
  return <Loader2 size={14} className="text-[var(--text-muted)] animate-spin flex-shrink-0" />;
}

interface Props {
  events: AgentEvent[];
  isStreaming: boolean;
}

export function AgentTimeline({ events, isStreaming }: Props) {
  const tAgents = useTranslations('agents');
  const tStatus = useTranslations('status');
  const t = useTranslations('chat');

  // Group events by agent for deduplication, keep last status per agent
  const agentMap = new Map<string, AgentEvent & { index: number }>();
  events.forEach((e, i) => {
    agentMap.set(e.agent, { ...e, index: i });
  });
  const uniqueEvents = Array.from(agentMap.values()).sort((a, b) => a.index - b.index);

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]
        bg-gradient-to-r from-[var(--accent-light)] to-transparent">
        <div className="flex gap-1">
          {isStreaming && (
            <>
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-[10px] font-semibold text-[var(--success)] uppercase tracking-wider">
                LIVE
              </span>
            </>
          )}
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {t('streamingLabel')}
        </span>
        {isStreaming && (
          <div className="ml-auto flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
          </div>
        )}
      </div>

      {/* Timeline events */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {uniqueEvents.map((event, i) => {
          const meta = AGENT_META[event.agent] ?? AGENT_META.system;
          const Icon = meta.icon;
          const agentLabel = (tAgents as any)[event.agent] || event.agent;
          const statusLabel = (tStatus as any)[event.status] || event.status;

          return (
            <div
              key={`${event.agent}-${i}`}
              className="flex items-start gap-3 px-4 py-3 animate-slide-up
                hover:bg-[var(--bg-secondary)] transition-colors duration-150"
            >
              {/* Agent icon */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                style={{ background: meta.bgColor }}
              >
                <Icon size={15} style={{ color: meta.color }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {agentLabel}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: meta.bgColor,
                      color: meta.color,
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {event.message}
                </p>

                {/* Data preview for completed agents */}
                {event.status === 'completed' && event.data && Object.keys(event.data).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {event.data.key_markets && (event.data.key_markets as string[]).map((m: string) => (
                      <span key={m} className="text-[10px] px-2 py-0.5 rounded-full
                        bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
                        {m}
                      </span>
                    ))}
                    {event.data.plan && (event.data.plan as string[]).map((p: string) => (
                      <span key={p} className="text-[10px] px-2 py-0.5 rounded-full
                        bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]">
                        → {p}
                      </span>
                    ))}
                    {event.data.total_signals && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full
                        bg-yellow-500/10 text-[var(--warning)] border border-yellow-500/20">
                        {event.data.total_signals as number} signals
                      </span>
                    )}
                    {event.data.market_size_usd_bn && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full
                        bg-cyan-500/10 text-[var(--cyan)] border border-cyan-500/20">
                        ${event.data.market_size_usd_bn as number}B market
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0 mt-1">
                <StatusDot status={event.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
