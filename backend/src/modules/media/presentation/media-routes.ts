import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../auth/presentation/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { MediaRepository } from '../domain/media-repository.js';
import type { LocalMediaStorage } from '../infrastructure/local-media-storage.js';
import { createMediaSchema, updateMediaSchema } from './media-schemas.js';

export function createPublicMediaRouter(repository: MediaRepository) {
  const router = Router();
  router.get('/', asyncHandler(async (_request, response) => response.json(await repository.list(true))));
  return router;
}

export function createAdminMediaRouter(repository: MediaRepository, sessionStore: SessionStore, storage: LocalMediaStorage) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);

  router.post('/upload', requireAdmin, asyncHandler(async (request, response) => {
    const kind = request.query.kind === 'PHOTO' || request.query.kind === 'VIDEO' ? request.query.kind : null;
    const mime = request.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (!kind) { response.status(400).json({ error: 'Précisez kind=PHOTO ou kind=VIDEO.' }); return; }
    const chunks: Buffer[] = [];
    let size = 0;
    const limit = kind === 'PHOTO' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > limit) { response.status(413).json({ error: 'Le fichier dépasse la taille maximale autorisée.' }); request.resume(); return; }
      chunks.push(Buffer.from(chunk));
    }
    try {
      const saved = await storage.save(Buffer.concat(chunks), mime, kind);
      response.status(201).json(saved);
    } catch (error) {
      if (error instanceof Error && error.message === 'MEDIA_FILE_INVALID') { response.status(400).json({ error: 'Format ou taille de fichier non autorisé.' }); return; }
      throw error;
    }
  }));

  router.get('/', requireAdmin, asyncHandler(async (_request, response) => response.json(await repository.list(false))));
  router.post('/', requireAdmin, asyncHandler(async (request, response) => {
    const input = createMediaSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ error: 'Informations média invalides.' }); return; }
    response.status(201).json(await repository.create(input.data, response.locals.userId!));
  }));
  router.patch('/:id', requireAdmin, asyncHandler(async (request, response) => {
    const input = updateMediaSchema.safeParse(request.body);
    if (!input.success) { response.status(400).json({ error: 'Informations média invalides.' }); return; }
    response.json(await repository.update(String(request.params.id), input.data, response.locals.userId!));
  }));
  router.delete('/:id', requireAdmin, asyncHandler(async (request, response) => {
    const item = await repository.findById(String(request.params.id)) as { url?: string } | null;
    await repository.delete(String(request.params.id), response.locals.userId!);
    if (item?.url?.startsWith('/media/')) await storage.remove(item.url);
    response.status(204).end();
  }));
  return router;
}

export function createMediaRouter(repository: MediaRepository, sessionStore: SessionStore, storage: LocalMediaStorage) {
  const router = Router();
  router.use('/public', createPublicMediaRouter(repository));
  router.use('/admin', createAdminMediaRouter(repository, sessionStore, storage));
  return router;
}
