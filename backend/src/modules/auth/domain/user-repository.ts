export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'COACH';
};

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findEmailById(id: string): Promise<string | null>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export interface PasswordVerifier {
  verify(passwordHash: string, password: string): Promise<boolean>;
}
