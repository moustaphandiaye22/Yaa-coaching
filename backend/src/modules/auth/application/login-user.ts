import { randomBytes } from 'node:crypto';
import type { PasswordVerifier, UserRepository } from '../domain/user-repository.js';
import type { SessionStore } from '../domain/session.js';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordVerifier,
    private readonly sessions: SessionStore,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user || !(await this.passwords.verify(user.passwordHash, password))) return null;

    const token = randomBytes(32).toString('base64url');
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    await this.sessions.save(token, {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt,
    });
    return { token, email: user.email, role: user.role, expiresAt };
  }
}
