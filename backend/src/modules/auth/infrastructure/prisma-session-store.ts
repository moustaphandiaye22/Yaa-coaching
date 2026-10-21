import { createHash } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import type { Session, SessionStore } from '../domain/session.js';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export class PrismaSessionStore implements SessionStore {
  constructor(private readonly prisma: PrismaClient) {}

  async find(token: string): Promise<Session | null> {
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, email: true, role: true, active: true } } },
    });
    if (!session || !session.user.active || session.expiresAt.getTime() <= Date.now()) {
      if (session) await this.prisma.authSession.delete({ where: { id: session.id } });
      return null;
    }
    return {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      expiresAt: session.expiresAt.getTime(),
    };
  }

  async save(token: string, session: Session): Promise<void> {
    await this.prisma.authSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    await this.prisma.authSession.create({
      data: {
        tokenHash: hashToken(token),
        userId: session.userId,
        expiresAt: new Date(session.expiresAt),
      },
    });
  }

  async delete(token: string): Promise<void> {
    await this.prisma.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
}
