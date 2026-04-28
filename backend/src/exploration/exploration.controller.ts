import {
  Controller, Get, Post, Delete,
  Param, Body, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import axios from 'axios';
import { ExplorationService } from './exploration.service';
import { AiService } from '../ai/ai.service';
import { CreateExplorationDto } from './dto/create-exploration.dto';

//HTTP request — expose endpoints

@ApiTags('explorations')
@Controller('api/explorations')
export class ExplorationController {
  constructor(
    private readonly explorationService: ExplorationService,
    private readonly aiService: AiService,
  ) {}

  /**
   * POST /api/explorations
   * Runs a full multi-agent exploration, saves to DB, returns the complete report.
   */
  @Post()
  @ApiOperation({ summary: 'Run a market exploration (non-streaming)' })
  @ApiResponse({ status: 201, description: 'Exploration completed and saved' })
  create(@Body() dto: CreateExplorationDto) {
    return this.explorationService.create(dto);
  }

  /**
   * POST /api/explorations/stream
   * Proxies SSE streaming from the Python AI service directly to the frontend.
   * After stream completes, saves the full result to DB for history.
   */
  @Post('stream')
  @ApiOperation({ summary: 'Stream agent events via SSE (proxied from AI service)' })
  async stream(
    @Body() body: { query: string; sessionId?: string; model?: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const streamUrl = this.aiService.getStreamUrl();
      const aiResponse = await axios.post(
        streamUrl,
        { query: body.query, model: body.model },
        { responseType: 'stream', timeout: 180_000 },
      );

      let buffer = '';
      const allEvents: any[] = [];
      let doneResult: any = null;

      aiResponse.data.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        res.write(text);
        buffer += text;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            allEvents.push(event);
            if (event.status === 'done' && event.data) {
              doneResult = event.data;
            }
          } catch { /* skip malformed */ }
        }
      });

      aiResponse.data.on('end', async () => {
        res.end();
        if (body.sessionId && doneResult) {
          try {
            await this.explorationService.saveFromStream({
              sessionId: body.sessionId,
              query: body.query,
              result: doneResult,
              events: allEvents.filter((e) => e.status !== 'done'),
            });
          } catch (saveErr) {
            console.warn('Failed to persist stream result:', saveErr);
          }
        }
      });

      aiResponse.data.on('error', (err: Error) => {
        res.write(`data: ${JSON.stringify({ agent: 'system', status: 'error', message: err.message })}\n\n`);
        res.end();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.write(`data: ${JSON.stringify({ agent: 'system', status: 'error', message })}\n\n`);
      res.end();
    }
  }

  /**
   * GET /api/explorations/session/:sessionId
   * List all explorations in a session.
   */
  @Get('session/:sessionId')
  @ApiOperation({ summary: 'List all explorations in a session' })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.explorationService.findBySession(sessionId);
  }

  /**
   * GET /api/explorations/:id
   * Get a single exploration report with all agent events.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single exploration report' })
  findOne(@Param('id') id: string) {
    return this.explorationService.findOne(id);
  }

  /**
   * DELETE /api/explorations/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an exploration report' })
  remove(@Param('id') id: string) {
    return this.explorationService.remove(id);
  }
}
