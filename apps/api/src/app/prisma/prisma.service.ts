import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prismaClient: PrismaClient;

  constructor() {
    // Eliminamos la lógica de SQLite y le pasamos la URL de Postgres
    this.prismaClient = new PrismaClient();
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