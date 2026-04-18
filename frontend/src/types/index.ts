export interface Session {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { explorations: number };
  explorations?: Array<{ query: string; createdAt: string }>;
}

export interface AgentEvent {
  agent: string;
  status: 'planned' | 'started' | 'completed' | 'error' | 'done';
  message: string;
  data?: Record<string, any> | null;
}

export interface SignalStats {
  totalSignals: number;
  positiveSignals: number;
  negativeSignals: number;
  cautiousSignals: number;
  highImpactSignals: number;
  countriesCovered: string[];
}

export interface QuerySummary {
  topic: string;
  region: string;
  intent: string;
  information_needed: string[];
  key_countries: string[];
  analysis_depth: string;
}

export interface ExploreResult {
  query: string;
  query_summary: QuerySummary | null;
  key_markets: string[];
  market_size_usd_bn: number | null;
  growth_rate_pct: number | null;
  signal_stats: SignalStats | null;
  final_report: string;
  agents_executed: string[];
  planner_reasoning: string;
  events: AgentEvent[];
  error: string | null;
}

export interface ExplorationFromDB {
  id: string;
  query: string;
  topic: string | null;
  region: string | null;
  keyMarkets: string[];
  marketSizeUsdBn: number | null;
  growthRatePct: number | null;
  finalReport: string;
  agentsExecuted: string[];
  plannerReasoning: string | null;
  status: string;
  agentEvents: AgentEvent[];
  signalStats: SignalStats | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'exploration';
  query?: string;
  events?: AgentEvent[];
  result?: ExploreResult;
  isStreaming?: boolean;
  error?: string;
  createdAt: Date;
}
