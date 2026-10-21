import argon2 from 'argon2';
import type { PasswordHasher } from '../domain/user-repository.js';

export class Argon2PasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }
}
