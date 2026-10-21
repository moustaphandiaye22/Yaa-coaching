import type { PrismaClient } from '@prisma/client';

export interface DatabaseHealthRepository {
  isReady(): Promise<boolean>;
}

export class PrismaDatabaseHealthRepository implements DatabaseHealthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async isReady(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
