import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AgentEvent {
  agent: string;
  status: string;
  message: string;
  data?: Record<string, any>;
}

export interface ExploreResult {
  query: string;
  query_summary: Record<string, any> | null;
  key_markets: string[];
  market_size_usd_bn: number | null;
  growth_rate_pct: number | null;
  signal_stats: Record<string, any> | null;
  final_report: string;
  agents_executed: string[];
  planner_reasoning: string;
  events: AgentEvent[];
  error: string | null;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.aiBaseUrl = config.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  /**
   * Run a full exploration (non-streaming) against the Python AI service.
   */
  async explore(query: string): Promise<ExploreResult> {
    const url = `${this.aiBaseUrl}/api/explore`;
    this.logger.log(`Calling AI service: POST ${url}`);

    const response = await axios.post<ExploreResult>(
      url,
      { query },
      { timeout: 120_000 }, // 2 min timeout for LLM calls
    );

    return response.data;
  }

  /**
   * Returns the AI service base URL for use in streaming proxies.
   */
  getStreamUrl(): string {
    return `${this.aiBaseUrl}/api/explore/stream`;
  }

  /**
   * Health check against the Python AI service.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${this.aiBaseUrl}/api/health`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
