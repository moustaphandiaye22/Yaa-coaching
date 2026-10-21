export type Session = {
  userId: string;
  email: string;
  role: 'ADMIN' | 'COACH';
  expiresAt: number;
};

export interface SessionStore {
  find(token: string): Promise<Session | null>;
  save(token: string, session: Session): Promise<void>;
  delete(token: string): Promise<void>;
}
