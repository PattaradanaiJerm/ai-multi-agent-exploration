import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateExplorationDto } from './dto/create-exploration.dto';

@Injectable()
export class ExplorationService {
  private readonly logger = new Logger(ExplorationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Run a full exploration: calls AI service, persists results to DB, returns report.
   */
  async create(dto: CreateExplorationDto) {
    // Ensure session exists
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) throw new NotFoundException(`Session ${dto.sessionId} not found`);

    // Create a pending report first
    const report = await this.prisma.explorationReport.create({
      data: {
        sessionId: dto.sessionId,
        query: dto.query,
        finalReport: '',
        status: 'PENDING',
      },
    });

    try {
      // Auto-set session title from first query if not set
      if (!session.title) {
        const shortTitle = dto.query.length > 80
          ? dto.query.substring(0, 80) + '...'
          : dto.query;
        await this.prisma.session.update({
          where: { id: dto.sessionId },
          data: { title: shortTitle },
        });
      }

      // Call Python AI service (non-streaming, waits for full result)
      this.logger.log(`Running exploration for query: "${dto.query}"`);
      const result = await this.aiService.explore(dto.query);

      const querySummary = result.query_summary as Record<string, any> | null;

      // Persist the completed report
      const updated = await this.prisma.explorationReport.update({
        where: { id: report.id },
        data: {
          topic: querySummary?.topic ?? null,
          region: querySummary?.region ?? null,
          keyMarkets: result.key_markets ?? [],
          marketSizeUsdBn: result.market_size_usd_bn ?? null,
          growthRatePct: result.growth_rate_pct ?? null,
          finalReport: result.final_report,
          agentsExecuted: result.agents_executed ?? [],
          plannerReasoning: result.planner_reasoning ?? null,
          status: result.error ? 'ERROR' : 'COMPLETED',
          // Save individual agent events
          agentEvents: {
            create: (result.events ?? []).map((e) => ({
              agent: e.agent,
              status: e.status,
              message: e.message,
              data: e.data ?? null,
            })),
          },
          // Save signal stats if available
          signalStats: result.signal_stats
            ? {
                create: {
                  totalSignals: result.signal_stats.total_signals ?? 0,
                  positiveSignals: result.signal_stats.positive_signals ?? 0,
                  negativeSignals: result.signal_stats.negative_signals ?? 0,
                  cautiousSignals: result.signal_stats.cautious_signals ?? 0,
                  highImpactSignals: result.signal_stats.high_impact_signals ?? 0,
                  countriesCovered: result.signal_stats.countries_covered ?? [],
                },
              }
            : undefined,
        },
        include: { agentEvents: true, signalStats: true },
      });

      return updated;
    } catch (err) {
      // Mark report as errored
      await this.prisma.explorationReport.update({
        where: { id: report.id },
        data: { status: 'ERROR', finalReport: String(err.message) },
      });
      throw err;
    }
  }

  /**
   * Save a streaming exploration result to DB (called after SSE stream ends).
   */
  async saveFromStream(input: {
    sessionId: string;
    query: string;
    result: any;
    events: any[];
  }) {
    const { sessionId, query, result, events } = input;

    // Auto-set session title if not set
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (session && !session.title) {
      const qs = result.query_summary as Record<string, any> | null;
      const title = qs?.topic
        ? `${qs.topic} – ${qs.region ?? ''}`
        : query.substring(0, 80);
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { title, updatedAt: new Date() },
      });
    }

    const qs = result.query_summary as Record<string, any> | null;

    return this.prisma.explorationReport.create({
      data: {
        sessionId,
        query,
        topic: qs?.topic ?? null,
        region: qs?.region ?? null,
        keyMarkets: result.key_markets ?? [],
        marketSizeUsdBn: result.market_size_usd_bn ?? null,
        growthRatePct: result.growth_rate_pct ?? null,
        finalReport: result.final_report ?? '',
        agentsExecuted: result.agents_executed ?? [],
        plannerReasoning: result.planner_reasoning ?? null,
        status: result.error ? 'ERROR' : 'COMPLETED',
        agentEvents: {
          create: events.map((e: any) => ({
            agent: e.agent,
            status: e.status,
            message: e.message,
            data: e.data ?? null,
          })),
        },
        ...(result.signal_stats ? {
          signalStats: {
            create: {
              totalSignals: result.signal_stats.total_signals ?? 0,
              positiveSignals: result.signal_stats.positive_signals ?? 0,
              negativeSignals: result.signal_stats.negative_signals ?? 0,
              cautiousSignals: result.signal_stats.cautious_signals ?? 0,
              highImpactSignals: result.signal_stats.high_impact_signals ?? 0,
              countriesCovered: result.signal_stats.countries_covered ?? [],
            },
          },
        } : {}),
      },
      include: { agentEvents: true, signalStats: true },
    });
  }

  /**
   * List all explorations for a session.
   */
  async findBySession(sessionId: string) {
    return this.prisma.explorationReport.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      include: { agentEvents: true, signalStats: true },
    });
  }

  /**
   * Get a single exploration report.
   */
  async findOne(id: string) {
    const report = await this.prisma.explorationReport.findUnique({
      where: { id },
      include: { agentEvents: true, signalStats: true },
    });
    if (!report) throw new NotFoundException(`Exploration report ${id} not found`);
    return report;
  }

  /**
   * Delete a single exploration report.
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.explorationReport.delete({ where: { id } });
  }
}
