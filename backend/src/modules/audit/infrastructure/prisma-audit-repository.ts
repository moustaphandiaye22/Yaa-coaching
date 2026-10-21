import type { PrismaClient } from '@prisma/client';
import type { AuditRepository } from '../domain/audit-repository.js';

export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listRecent(limit: number, before?: string) {
    const items = await this.prisma.auditLog.findMany({
      ...(before ? { cursor: { id: before }, skip: 1 } : {}),
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: { actor: { select: { email: true } } },
    });
    const hasNextPage = items.length > limit;
    const page = hasNextPage ? items.slice(0, limit) : items;
    return { items: page, nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null };
  }
}
