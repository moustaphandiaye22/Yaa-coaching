import type { SessionStore } from '../domain/session.js';
import type { UserRepository } from '../domain/user-repository.js';

export class ManageSession {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionStore,
  ) {}

  logout(token: string | null | undefined) {
    return token ? this.sessions.delete(token) : Promise.resolve();
  }

  async currentUser(userId: string | undefined, role: 'ADMIN' | 'COACH' | undefined) {
    const email = userId ? await this.users.findEmailById(userId) : null;
    return email ? { email, role } : null;
  }
}
