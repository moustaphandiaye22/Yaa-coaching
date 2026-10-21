import type { PrismaClient } from '@prisma/client';
import type {
  ManagedUser,
  UserChanges,
  UserManagementRepository,
} from '../domain/user-management-repository.js';
import { LastActiveAdministratorError } from '../domain/user-management-repository.js';

const managedUserSelect = {
  id: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
} as const;

export class PrismaUserManagementRepository implements UserManagementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list(): Promise<ManagedUser[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'asc' }, select: managedUserSelect });
  }

  create(
    email: string,
    passwordHash: string,
    role: ManagedUser['role'],
    actorId: string,
  ): Promise<ManagedUser> {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: { email, passwordHash, role },
        select: managedUserSelect,
      });
      await transaction.auditLog.create({
        data: { actorId, action: 'USER_CREATED', entity: 'User', entityId: user.id },
      });
      return user;
    });
  }

  update(id: string, changes: UserChanges, actorId: string): Promise<ManagedUser> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(775522044)`;
      const existing = await transaction.user.findUniqueOrThrow({ where: { id } });
      const isLosingAdmin =
        existing.role === 'ADMIN' &&
        existing.active &&
        (changes.role === 'COACH' || changes.active === false);
      if (
        isLosingAdmin &&
        (await transaction.user.count({ where: { role: 'ADMIN', active: true } })) <= 1
      ) {
        throw new LastActiveAdministratorError();
      }

      const user = await transaction.user.update({
        where: { id },
        data: changes,
        select: managedUserSelect,
      });
      await transaction.auditLog.create({
        data: { actorId, action: 'USER_UPDATED', entity: 'User', entityId: id },
      });
      const roleChanged = changes.role !== undefined && changes.role !== existing.role;
      if (changes.active === false || changes.passwordHash || roleChanged) {
        await transaction.authSession.deleteMany({ where: { userId: id } });
      }
      return user;
    });
  }

  async delete(id: string, actorId: string): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(775522044)`;
      const existing = await transaction.user.findUniqueOrThrow({ where: { id } });
      if (
        existing.role === 'ADMIN' &&
        existing.active &&
        (await transaction.user.count({ where: { role: 'ADMIN', active: true } })) <= 1
      ) {
        throw new LastActiveAdministratorError();
      }
      await transaction.auditLog.updateMany({
        where: { entity: 'User', entityId: id },
        data: { entityId: null },
      });
      await transaction.user.delete({ where: { id } });
      await transaction.auditLog.create({
        data: { actorId, action: 'USER_DELETED', entity: 'User' },
      });
    });
  }
}
