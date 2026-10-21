import type { PasswordHasher } from '../../auth/domain/user-repository.js';
import {
  type UserChanges,
  type UserManagementRepository,
} from '../domain/user-management-repository.js';

export class ManageUsers {
  constructor(
    private readonly users: UserManagementRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  list() {
    return this.users.list();
  }
  async create(email: string, password: string, role: 'ADMIN' | 'COACH', actorId: string) {
    return this.users.create(
      email.trim().toLowerCase(),
      await this.passwords.hash(password),
      role,
      actorId,
    );
  }
  async update(
    id: string,
    input: { active?: boolean; role?: 'ADMIN' | 'COACH'; password?: string },
    actorId: string,
  ) {
    if (id === actorId && input.active === false) {
      throw new Error('CANNOT_DEACTIVATE_SELF');
    }
    const changes: UserChanges = {
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.password ? { passwordHash: await this.passwords.hash(input.password) } : {}),
    };
    return this.users.update(id, changes, actorId);
  }
  delete(id: string, actorId: string) {
    if (id === actorId) throw new Error('CANNOT_DELETE_SELF');
    return this.users.delete(id, actorId);
  }
}
