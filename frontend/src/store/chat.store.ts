import { create } from 'zustand';
import type { Session, ChatMessage, AgentEvent, ExploreResult } from '@/types';
import { createSession, getSessions, deleteSession, streamExploration, getSessionExplorations } from '@/lib/api';
import { useModelStore } from '@/store/model.store';

interface ChatStore {
  // State
  sessions: Session[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoadingSessions: boolean;

  // Actions
  loadSessions: () => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  startNewSession: (navigate?: () => void) => void;
  removeSession: (id: string, navigate?: () => void) => Promise<void>;
  submitQuery: (query: string, onSessionCreated?: (sessionId: string) => void) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isStreaming: false,
  isLoadingSessions: false,

  loadSessions: async () => {
    set({ isLoadingSessions: true });
    try {
      const sessions = await getSessions();
      set({ sessions, isLoadingSessions: false });
    } catch {
      set({ isLoadingSessions: false });
    }
  },

  selectSession: async (id: string) => {
    set({ currentSessionId: id, messages: [], isLoadingSessions: true });
    try {
      const explorations = await getSessionExplorations(id);
      const messages: ChatMessage[] = [];
      for (const exp of explorations) {
        messages.push({
          id: `user-${exp.id}`,
          type: 'user',
          query: exp.query,
          createdAt: new Date(exp.createdAt),
        });
        messages.push({
          id: `exp-${exp.id}`,
          type: 'exploration',
          events: exp.agentEvents ?? [],
          result: {
            query: exp.query,
            query_summary: exp.topic
              ? { topic: exp.topic, region: exp.region ?? '', intent: '', information_needed: [], key_countries: [], analysis_depth: '' }
              : null,
            key_markets: exp.keyMarkets ?? [],
            market_size_usd_bn: exp.marketSizeUsdBn,
            growth_rate_pct: exp.growthRatePct,
            signal_stats: exp.signalStats as any,
            final_report: exp.finalReport,
            agents_executed: exp.agentsExecuted ?? [],
            planner_reasoning: exp.plannerReasoning ?? '',
            events: exp.agentEvents ?? [],
            error: null,
          },
          isStreaming: false,
          createdAt: new Date(exp.createdAt),
        });
      }
      set({ messages, isLoadingSessions: false });
    } catch {
      set({ isLoadingSessions: false });
    }
  },

  startNewSession: (navigate?: () => void) => {
    set({ currentSessionId: null, messages: [] });
    navigate?.();
  },

  removeSession: async (id: string, navigate?: () => void) => {
    await deleteSession(id);
    const { sessions, currentSessionId } = get();
    const filtered = sessions.filter((s) => s.id !== id);
    const wasActive = currentSessionId === id;
    set({
      sessions: filtered,
      currentSessionId: wasActive ? null : currentSessionId,
      messages: wasActive ? [] : get().messages,
    });
    if (wasActive) navigate?.();
  },

  submitQuery: async (query: string, onSessionCreated?: (sessionId: string) => void) => {
    const { currentSessionId, messages } = get();
    if (get().isStreaming) return;

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    const explorationMsgId = `exp-${Date.now()}`;
    set({
      messages: [
        ...messages,
        { id: userMsgId, type: 'user', query, createdAt: new Date() },
        { id: explorationMsgId, type: 'exploration', events: [], isStreaming: true, createdAt: new Date() },
      ],
      isStreaming: true,
    });

    // Create or reuse session
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        const session = await createSession();
        sessionId = session.id;
        set((state) => ({
          currentSessionId: sessionId,
          sessions: [session, ...state.sessions],
        }));
        onSessionCreated?.(session.id);
      } catch {
        set((state) => ({
          isStreaming: false,
          messages: state.messages.map((m) =>
            m.id === explorationMsgId
              ? { ...m, isStreaming: false, error: 'Failed to create session.' }
              : m,
          ),
        }));
        return;
      }
    }

    // Stream events
    const collectedEvents: AgentEvent[] = [];
    const selectedModel = useModelStore.getState().selectedModel;

    await streamExploration(
      query,
      sessionId!,
      selectedModel,
      (event) => {
        collectedEvents.push(event);
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === explorationMsgId
              ? { ...m, events: [...collectedEvents] }
              : m,
          ),
        }));
      },
      (result) => {
        // Update session title from result
        set((state) => ({
          isStreaming: false,
          messages: state.messages.map((m) =>
            m.id === explorationMsgId
              ? { ...m, isStreaming: false, result, events: collectedEvents }
              : m,
          ),
          sessions: state.sessions.map((s) =>
            s.id === sessionId && !s.title
              ? { ...s, title: result.query_summary?.topic
                  ? `${result.query_summary.topic} – ${result.query_summary.region}`
                  : query.substring(0, 60) }
              : s,
          ),
        }));
      },
      (errorMsg) => {
        set((state) => ({
          isStreaming: false,
          messages: state.messages.map((m) =>
            m.id === explorationMsgId
              ? { ...m, isStreaming: false, error: errorMsg }
              : m,
          ),
        }));
      },
    );
  },
}));
