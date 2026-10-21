import type { PrismaClient } from '@prisma/client';
import type { DispatchableNotification, NotificationRepository } from '../domain/notification.js';

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(page: number, size: number) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
        select: {
          id: true,
          kind: true,
          attempts: true,
          sentAt: true,
          lastError: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count(),
    ]);
    return { items, total };
  }
  async resetFailed() {
    await this.prisma.notification.updateMany({
      where: { sentAt: null, attempts: { gte: 8 } },
      data: { attempts: 0, availableAt: new Date(), lastError: null },
    });
  }
  findPending(now: Date, limit: number): Promise<DispatchableNotification[]> {
    return this.prisma.notification.findMany({
      where: {
        sentAt: null,
        attempts: { lt: 8 },
        availableAt: { lte: now },
        OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true, kind: true, attempts: true, payload: true },
    }) as Promise<DispatchableNotification[]>;
  }
  async claim(id: string, now: Date) {
    const result = await this.prisma.notification.updateMany({
      where: {
        id,
        sentAt: null,
        attempts: { lt: 8 },
        availableAt: { lte: now },
        OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
      },
      data: { lockedUntil: new Date(now.getTime() + 2 * 60_000) },
    });
    return result.count > 0;
  }
  async findSubmission(id: string) {
    const row = await this.prisma.submission.findUnique({
      where: { id },
      select: { contactEmail: true, service: true },
    });
    return row;
  }
  async markMissing(id: string) {
    await this.prisma.notification.update({
      where: { id },
      data: { attempts: 8, lockedUntil: null, lastError: 'La demande associée a été supprimée.' },
    });
  }
  async postpone(id: string, until: Date) {
    await this.prisma.notification.update({
      where: { id },
      data: { lockedUntil: null, availableAt: until },
    });
  }
  async markSent(id: string, providerId: string | null, sentAt: Date) {
    await this.prisma.notification.update({
      where: { id },
      data: { sentAt, lockedUntil: null, providerId, lastError: null },
    });
  }
  async markFailed(id: string, attempts: number, error: string, availableAt: Date) {
    await this.prisma.notification.update({
      where: { id },
      data: { attempts, lockedUntil: null, lastError: error, availableAt },
    });
  }
}
