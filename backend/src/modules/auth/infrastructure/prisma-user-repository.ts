import type { PrismaClient } from '@prisma/client';
import type { UserRepository } from '../domain/user-repository.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email, active: true }, select: { id: true, email: true, passwordHash: true, role: true } });
  }

  async findEmailById(id: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { email: true } });
    return user?.email ?? null;
  }
}
