import argon2 from 'argon2';
import type { PasswordVerifier } from '../domain/user-repository.js';

export class Argon2PasswordVerifier implements PasswordVerifier {
  verify(passwordHash: string, password: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }
}
