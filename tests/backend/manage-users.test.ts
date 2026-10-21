import { ManageUsers } from '../../backend/src/modules/users/application/manage-users.js';
import type { PasswordHasher } from '../../backend/src/modules/auth/domain/user-repository.js';
import type { UserManagementRepository } from '../../backend/src/modules/users/domain/user-management-repository.js';

describe('ManageUsers', () => {
  const createRepository = () =>
    ({
      list: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'created-user' }),
      update: jest.fn().mockResolvedValue({ id: 'updated-user' }),
      delete: jest.fn().mockResolvedValue(undefined),
    }) as unknown as jest.Mocked<UserManagementRepository>;

  it('normalizes the email and hashes a password before creating an account', async () => {
    const repository = createRepository();
    const passwords: PasswordHasher = { hash: jest.fn().mockResolvedValue('hashed-password') };
    const users = new ManageUsers(repository, passwords);

    await users.create('  ADMIN@EXAMPLE.COM ', 'a-long-password', 'ADMIN', 'actor-1');

    expect(passwords.hash).toHaveBeenCalledWith('a-long-password');
    expect(repository.create).toHaveBeenCalledWith(
      'admin@example.com',
      'hashed-password',
      'ADMIN',
      'actor-1',
    );
  });

  it('does not allow an administrator to disable their own account', async () => {
    const repository = createRepository();
    const users = new ManageUsers(repository, { hash: jest.fn() });

    await expect(users.update('actor-1', { active: false }, 'actor-1')).rejects.toThrow(
      'CANNOT_DEACTIVATE_SELF',
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not allow an administrator to delete their own account', async () => {
    const repository = createRepository();
    const users = new ManageUsers(repository, { hash: jest.fn() });

    expect(() => users.delete('actor-1', 'actor-1')).toThrow('CANNOT_DELETE_SELF');
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
