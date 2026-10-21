import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../auth/presentation/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { FaqRepository } from '../domain/faq-repository.js';
import { createFaqSchema, updateFaqSchema } from './faq-schemas.js';

export function createPublicFaqRouter(repository: FaqRepository) {
  const router = Router();
  router.get('/', asyncHandler(async (_request, response) => response.json(await repository.listPublic())));
  return router;
}

export function createAdminFaqRouter(repository: FaqRepository, sessionStore: SessionStore) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);

  router.get('/', requireAdmin, asyncHandler(async (_request, response) => response.json(await repository.listAdmin())));
  router.post('/', requireAdmin, asyncHandler(async (request, response) => {
    const input = createFaqSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ error: 'Question ou réponse invalide.' }); return; }
    response.status(201).json(await repository.create(input.data, response.locals.userId!));
  }));
  router.patch('/:id', requireAdmin, asyncHandler(async (request, response) => {
    const input = updateFaqSchema.safeParse(request.body);
    if (!input.success || Object.keys(input.data ?? {}).length === 0) { response.status(400).json({ error: 'Question ou réponse invalide.' }); return; }
    response.json(await repository.update(String(request.params.id), input.data, response.locals.userId!));
  }));
  router.delete('/:id', requireAdmin, asyncHandler(async (request, response) => {
    await repository.delete(String(request.params.id), response.locals.userId!);
    response.status(204).end();
  }));
  return router;
}

export function createFaqRouter(repository: FaqRepository, sessionStore: SessionStore) {
  const router = Router();
  router.use('/public', createPublicFaqRouter(repository));
  router.use('/admin', createAdminFaqRouter(repository, sessionStore));
  return router;
}
