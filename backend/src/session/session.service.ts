import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: { title: dto.title ?? null },
    });
  }

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { explorations: true } },
        explorations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { query: true, createdAt: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        explorations: {
          orderBy: { createdAt: 'asc' },
          include: { agentEvents: true, signalStats: true },
        },
      },
    });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async update(id: string, dto: UpdateSessionDto) {
    await this.findOne(id);
    return this.prisma.session.update({
      where: { id },
      data: { title: dto.title },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.session.delete({ where: { id } });
  }
}
