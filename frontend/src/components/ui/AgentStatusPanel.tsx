'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useChatStore } from '@/store/chat.store';
import { Activity, BrainCircuit, CheckCircle2, Circle } from 'lucide-react';

const AGENTS = [
  {
    key: 'query_understanding',
    descKey: 'query_understanding_desc',
    image: '/ai-profile/ai-query.png',
    color: '#34d399',
    bgColor: 'rgba(52,211,153,0.12)',
    index: 1,
  },
  {
    key: 'market_retrieval',
    descKey: 'market_retrieval_desc',
    image: '/ai-profile/ai-market.png',
    color: '#22d3ee',
    bgColor: 'rgba(34,211,238,0.12)',
    index: 2,
  },
  {
    key: 'signal_analysis',
    descKey: 'signal_analysis_desc',
    image: '/ai-profile/ai-signal.png',
    color: '#fbbf24',
    bgColor: 'rgba(251,191,36,0.12)',
    index: 3,
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed' || status === 'done') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-semibold text-[var(--success)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
        Done
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-semibold text-[var(--error)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)]" />
        Error
      </span>
    );
  }
  if (status === 'started' || status === 'streaming') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-semibold text-[var(--accent)]">
        <span className="relative flex">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping absolute" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        </span>
        Active
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[9px] font-semibold text-[var(--text-muted)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
      Idle
    </span>
  );
}

function ProgressBar({ status }: { status: string }) {
  const widthMap: Record<string, string> = {
    idle: 'w-0',
    planned: 'w-1/4',
    started: 'w-1/2',
    streaming: 'w-3/4',
    completed: 'w-full',
    done: 'w-full',
    error: 'w-full',
  };
  const colorMap: Record<string, string> = {
    completed: 'bg-[var(--success)]',
    done: 'bg-[var(--success)]',
    error: 'bg-[var(--error)]',
    started: 'bg-[var(--accent)]',
    streaming: 'bg-[var(--accent)]',
    planned: 'bg-[var(--warning)]',
  };
  const width = widthMap[status] ?? 'w-0';
  const color = colorMap[status] ?? 'bg-[var(--border)]';
  return (
    <div className="w-full h-0.5 rounded-full bg-[var(--border-subtle)] mt-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${width} ${color}`}
        style={status === 'started' || status === 'streaming'
          ? { animation: 'shimmer 1.5s ease-in-out infinite' }
          : {}}
      />
    </div>
  );
}

export function AgentStatusPanel() {
  const { messages, isStreaming } = useChatStore();
  const tAgents = useTranslations('agents');

  const lastMsg = messages.filter((m) => m.type === 'exploration').pop();
  const agentStatuses: Record<string, string> = {};
  if (lastMsg?.events) {
    for (const ev of lastMsg.events) {
      agentStatuses[ev.agent] = ev.status;
    }
  }

  // Extract planner reasoning and execution plan from orchestrator event
  const plannerEvent = lastMsg?.events?.find(
    (ev) => ev.agent === 'orchestrator' && ev.status === 'planned',
  );
  const plannerReasoning = lastMsg?.result?.planner_reasoning ?? plannerEvent?.data?.reasoning ?? '';
  const executionPlan: string[] = plannerEvent?.data?.plan ?? lastMsg?.result?.agents_executed ?? [];
  const agentsExecuted: string[] = lastMsg?.result?.agents_executed ?? [];

  const hasActivity = Object.keys(agentStatuses).length > 0;

  const AGENT_LABEL: Record<string, string> = {
    query_understanding: 'Query Understanding',
    market_retrieval: 'Market Retrieval',
    signal_analysis: 'Signal Analysis',
  };

  return (
    <div className="mx-3 mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]
          bg-gradient-to-r from-[var(--accent-light)] to-transparent">
        <Activity size={11} className="text-[var(--accent)]" />
        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex-1">
          AI Agent Status
        </span>
        {isStreaming && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[9px] text-[var(--success)] font-bold">LIVE</span>
          </div>
        )}
      </div>

      {/* Planner Reasoning — shows dynamic decision */}
      {plannerReasoning && (
        <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--accent-light)]/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BrainCircuit size={10} className="text-[var(--accent)] flex-shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent)]">
              Orchestrator Decision
            </span>
          </div>
          <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed line-clamp-4">
            {plannerReasoning}
          </p>
          {executionPlan.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(['query_understanding', 'market_retrieval', 'signal_analysis'] as const).map((key) => {
                const selected = executionPlan.includes(key) || agentsExecuted.includes(key);
                return (
                  <span
                    key={key}
                    className={`flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full border ${
                      selected
                        ? 'border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent-light)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] opacity-40'
                    }`}
                  >
                    {selected
                      ? <CheckCircle2 size={8} />
                      : <Circle size={8} />
                    }
                    {AGENT_LABEL[key]}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Agent rows */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {AGENTS.map((agent) => {
          const status = agentStatuses[agent.key] ?? 'idle';
          return (
            <div key={agent.key} className="px-3 py-2.5">
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden"
                  style={{ background: agent.bgColor }}
                >
                  <Image
                    src={agent.image}
                    alt={agent.key}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[var(--text-primary)] truncate leading-tight">
                        {tAgents(agent.key)}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-[9px] text-[var(--text-muted)] mt-0.5 leading-tight">
                    {tAgents(agent.descKey)}
                  </p>
                  <ProgressBar status={status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note when idle */}
      {!hasActivity && !isStreaming && (
        <div className="px-3 py-2 border-t border-[var(--border-subtle)]">
          <p className="text-[9px] text-[var(--text-muted)] text-center">
            Awaiting query to activate agents
          </p>
        </div>
      )}
    </div>
  );
}
