import type { Session, AgentEvent, ExploreResult, ExplorationFromDB } from '@/types';

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
        const event: AgentEvent = JSON.parse(line.slice(6));
        if (event.status === 'done' && event.data) {
          onDone(event.data as unknown as ExploreResult);
        } else {
          onEvent(event);
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
