import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prismaClient: PrismaClient;

  constructor() {
    const dbPath = path.resolve(__dirname, '..', '..', '..', 'prisma', 'dev.db');
    this.prismaClient = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL || `file:${dbPath}`,
    });
  }

  get client(): PrismaClient {
    return this.prismaClient;
  }

  async onModuleInit() {
    await this.prismaClient.$connect();
  }

  async onModuleDestroy() {
    await this.prismaClient.$disconnect();
  }
}
