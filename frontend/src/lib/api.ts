import type { Session, AgentEvent, ExploreResult, ExplorationFromDB, SignalStats } from '@/types';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// ── Sessions ──────────────────────────────────────────────
export async function createSession(title?: string): Promise<Session> {
  const res = await fetch(`${BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function getSessions(): Promise<Session[]> {
  const res = await fetch(`${BASE}/api/sessions`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function getSession(id: string): Promise<Session> {
  const res = await fetch(`${BASE}/api/sessions/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch session');
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  await fetch(`${BASE}/api/sessions/${id}`, { method: 'DELETE' });
}

export async function getSessionExplorations(sessionId: string): Promise<ExplorationFromDB[]> {
  const res = await fetch(`${BASE}/api/explorations/session/${sessionId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch explorations');
  return res.json();
}

// ── Helpers ───────────────────────────────────────────────
// Python AI layer returns snake_case signal_stats; the DB layer (via Prisma) returns camelCase.
// Normalize both formats so the frontend always gets camelCase SignalStats.
function normalizeSignalStats(raw: any): SignalStats | null {
  if (!raw) return null;
  return {
    totalSignals:     raw.totalSignals     ?? raw.total_signals     ?? 0,
    positiveSignals:  raw.positiveSignals  ?? raw.positive_signals  ?? 0,
    negativeSignals:  raw.negativeSignals  ?? raw.negative_signals  ?? 0,
    cautiousSignals:  raw.cautiousSignals  ?? raw.cautious_signals  ?? 0,
    highImpactSignals:raw.highImpactSignals?? raw.high_impact_signals?? 0,
    countriesCovered: raw.countriesCovered ?? raw.countries_covered ?? [],
  };
}

// ── Streaming Exploration ─────────────────────────────────
export async function streamExploration(
  query: string,
  sessionId: string,
  model: string,
  onEvent: (event: AgentEvent) => void,
  onDone: (result: ExploreResult) => void,
  onError: (msg: string) => void,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/api/explorations/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sessionId, model }),
    });
  } catch {
    onError('Network error. Check your connection.');
    return;
  }

  if (!response.ok || !response.body) {
    onError('Stream request failed.');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.status === 'done' && event.data) {
          const d = event.data;
          onDone({
            query:              d.query ?? query,
            query_summary:      d.query_summary ?? null,
            key_markets:        d.key_markets ?? [],
            market_size_usd_bn: d.market_size_usd_bn ?? null,
            growth_rate_pct:    d.growth_rate_pct ?? null,
            signal_stats:       normalizeSignalStats(d.signal_stats),
            final_report:       d.final_report ?? '',
            agents_executed:    d.agents_executed ?? [],
            planner_reasoning:  d.planner_reasoning ?? '',
            events:             d.events ?? [],
            error:              d.error ?? null,
          });
        } else {
          onEvent(event as AgentEvent);
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

// ── Save Exploration (non-streaming, DB persist) ──────────
export async function saveExploration(sessionId: string, query: string) {
  const res = await fetch(`${BASE}/api/explorations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, query }),
  });
  if (!res.ok) throw new Error('Failed to save exploration');
  return res.json();
}
