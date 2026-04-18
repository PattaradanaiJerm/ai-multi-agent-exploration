import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SessionModule } from './session/session.module';
import { ExplorationModule } from './exploration/exploration.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AiModule,
    SessionModule,
    ExplorationModule,
  ],
})
export class AppModule {}
