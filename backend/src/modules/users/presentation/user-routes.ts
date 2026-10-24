import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import { LastActiveAdministratorError } from '../domain/user-management-repository.js';
import type { ManageUsers } from '../application/manage-users.js';
import { validationResponse } from '../../../shared/http/validation-response.js';

const createSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  role: z.enum(['ADMIN', 'COACH']).default('COACH'),
});
const updateSchema = z
  .object({
    active: z.boolean().optional(),
    role: z.enum(['ADMIN', 'COACH']).optional(),
    password: z.string().min(12).max(128).optional(),
  })
  .refine((data) => Object.keys(data).length > 0);

function handleLastAdministrator(error: unknown, response: import('express').Response): boolean {
  if (!(error instanceof LastActiveAdministratorError)) return false;
  response.status(409).json({ error: error.message });
  return true;
}

export function createAdminUserRouter(users: ManageUsers, sessions: SessionStore) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessions);

  router.get(
    '/',
    requireAdmin,
    asyncHandler(async (_request, response) => {
      response.json(await users.list());
    }),
  );

  router.post(
    '/',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const input = createSchema.safeParse(request.body);
      if (!input.success) {
        response
          .status(400)
          .json(
            validationResponse(
              input.error,
              { email: 'L’adresse e-mail', password: 'Le mot de passe', role: 'Le rôle' },
              'Le compte n’a pas été créé.',
            ),
          );
        return;
      }
      const user = await users.create(
        input.data.email.toLowerCase(),
        input.data.password,
        input.data.role,
        response.locals.userId!,
      );
      response.status(201).json(user);
    }),
  );

  router.patch(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const input = updateSchema.safeParse(request.body);
      if (!input.success) {
        response.status(400).json(
          validationResponse(
            input.error,
            {
              active: 'Le statut du compte',
              password: 'Le nouveau mot de passe',
              role: 'Le rôle',
            },
            'La modification du compte a échoué.',
          ),
        );
        return;
      }
      const id = String(request.params.id);
      try {
        response.json(await users.update(id, input.data, response.locals.userId!));
      } catch (error) {
        if (error instanceof Error && error.message === 'CANNOT_DEACTIVATE_SELF') {
          response
            .status(400)
            .json({ error: 'Vous ne pouvez pas désactiver votre propre compte.' });
          return;
        }
        if (!handleLastAdministrator(error, response)) throw error;
      }
    }),
  );

  router.delete(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const id = String(request.params.id);
      try {
        await users.delete(id, response.locals.userId!);
        response.status(204).end();
      } catch (error) {
        if (error instanceof Error && error.message === 'CANNOT_DELETE_SELF') {
          response.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
          return;
        }
        if (!handleLastAdministrator(error, response)) throw error;
      }
    }),
  );
  return router;
}
