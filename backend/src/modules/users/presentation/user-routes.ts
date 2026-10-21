import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../auth/presentation/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { PasswordHasher } from '../../auth/domain/user-repository.js';
import { LastActiveAdministratorError, type UserChanges, type UserManagementRepository } from '../domain/user-management-repository.js';

const createSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(12).max(128), role: z.enum(['ADMIN', 'COACH']).default('COACH') });
const updateSchema = z.object({ active: z.boolean().optional(), role: z.enum(['ADMIN', 'COACH']).optional(), password: z.string().min(12).max(128).optional() }).refine((data) => Object.keys(data).length > 0);

function handleLastAdministrator(error: unknown, response: import('express').Response): boolean {
  if (!(error instanceof LastActiveAdministratorError)) return false;
  response.status(409).json({ error: error.message });
  return true;
}

export function createAdminUserRouter(repository: UserManagementRepository, sessions: SessionStore, passwords: PasswordHasher) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessions);

  router.get('/', requireAdmin, asyncHandler(async (_request, response) => {
    response.json(await repository.list());
  }));

  router.post('/', requireAdmin, asyncHandler(async (request, response) => {
    const input = createSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ error: 'E-mail, rôle ou mot de passe invalide (12 caractères minimum).' }); return; }
    const user = await repository.create(input.data.email.toLowerCase(), await passwords.hash(input.data.password), input.data.role, response.locals.userId!);
    response.status(201).json(user);
  }));

  router.patch('/:id', requireAdmin, asyncHandler(async (request, response) => {
    const input = updateSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ error: 'Modification de compte invalide.' }); return; }
    const id = String(request.params.id);
    if (id === response.locals.userId && input.data.active === false) { response.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte.' }); return; }
    const changes: UserChanges = {
      ...(input.data.active !== undefined ? { active: input.data.active } : {}),
      ...(input.data.role ? { role: input.data.role } : {}),
      ...(input.data.password ? { passwordHash: await passwords.hash(input.data.password) } : {}),
    };
    try {
      response.json(await repository.update(id, changes, response.locals.userId!));
    } catch (error) {
      if (!handleLastAdministrator(error, response)) throw error;
    }
  }));

  router.delete('/:id', requireAdmin, asyncHandler(async (request, response) => {
    const id = String(request.params.id);
    if (id === response.locals.userId) { response.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }); return; }
    try {
      await repository.delete(id, response.locals.userId!);
      response.status(204).end();
    } catch (error) {
      if (!handleLastAdministrator(error, response)) throw error;
    }
  }));
  return router;
}
