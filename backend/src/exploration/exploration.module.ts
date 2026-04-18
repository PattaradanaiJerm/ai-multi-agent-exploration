import { Module } from '@nestjs/common';
import { ExplorationService } from './exploration.service';
import { ExplorationController } from './exploration.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ExplorationController],
  providers: [ExplorationService],
})
export class ExplorationModule {}
