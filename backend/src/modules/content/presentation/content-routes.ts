import { z } from 'zod';
import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../auth/presentation/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { ContentRepository } from '../domain/content-repository.js';
import { updateContentSchema } from './content-schemas.js';

const contentKeySchema = z.string().regex(/^[a-z][a-z0-9-]{1,63}$/);

export function createPublicContentRouter(repository: ContentRepository) {
  const router = Router();
  router.get('/', asyncHandler(async (_request, response) => response.json(await repository.listPublic())));
  return router;
}

export function createAdminContentRouter(repository: ContentRepository, sessionStore: SessionStore) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);
  router.get('/', requireAdmin, asyncHandler(async (_request, response) => response.json(await repository.listAdmin())));
  router.get('/:key/preview', requireAdmin, asyncHandler(async (request, response) => {
    const key = contentKeySchema.safeParse(request.params.key);
    if (!key.success) { response.status(400).json({ error: 'Identifiant de contenu invalide.' }); return; }
    const draft = await repository.preview(key.data);
    if (!draft) { response.status(404).json({ error: 'Contenu introuvable.' }); return; }
    response.json(draft);
  }));
  router.get('/:key/revisions', requireAdmin, asyncHandler(async (request, response) => {
    const key = contentKeySchema.safeParse(request.params.key);
    if (!key.success) { response.status(400).json({ error: 'Identifiant de contenu invalide.' }); return; }
    response.json(await repository.listRevisions(key.data));
  }));
  router.put('/:key', requireAdmin, asyncHandler(async (request, response) => {
    const key = contentKeySchema.safeParse(request.params.key);
    if (!key.success) { response.status(400).json({ error: 'Identifiant de contenu invalide.' }); return; }
    const input = updateContentSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ error: 'Contenu invalide.' }); return; }
    response.json(await repository.save(key.data, input.data.content, input.data.publish ?? false, response.locals.userId!));
  }));
  router.delete('/:key/publication', requireAdmin, asyncHandler(async (request, response) => {
    const key = contentKeySchema.safeParse(request.params.key);
    if (!key.success) { response.status(400).json({ error: 'Identifiant de contenu invalide.' }); return; }
    response.json(await repository.unpublish(key.data, response.locals.userId!));
  }));
  return router;
}

export function createContentRouter(repository: ContentRepository, sessionStore: SessionStore) {
  const router = Router();
  router.use('/public', createPublicContentRouter(repository));
  router.use('/admin', createAdminContentRouter(repository, sessionStore));
  return router;
}
