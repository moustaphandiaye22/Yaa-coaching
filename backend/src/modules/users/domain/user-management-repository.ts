export type ManagedUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'COACH';
  active: boolean;
  createdAt: Date;
};

export type UserChanges = { active?: boolean; role?: 'ADMIN' | 'COACH'; passwordHash?: string };

export class LastActiveAdministratorError extends Error {
  constructor() {
    super('Il faut conserver au moins un administrateur actif.');
    this.name = 'LastActiveAdministratorError';
  }
}

export interface UserManagementRepository {
  list(): Promise<ManagedUser[]>;
  create(
    email: string,
    passwordHash: string,
    role: ManagedUser['role'],
    actorId: string,
  ): Promise<ManagedUser>;
  update(id: string, changes: UserChanges, actorId: string): Promise<ManagedUser>;
  delete(id: string, actorId: string): Promise<void>;
}
