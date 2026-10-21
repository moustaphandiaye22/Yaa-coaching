import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import { createMediaSchema, updateMediaSchema } from './media-schemas.js';
import { ManageMedia, ReadPublicMedia } from '../application/manage-media.js';

export function createPublicMediaRouter(media: ReadPublicMedia) {
  const router = Router();
  router.get(
    '/',
    asyncHandler(async (_request, response) => response.json(await media.execute())),
  );
  return router;
}

export function createAdminMediaRouter(media: ManageMedia, sessionStore: SessionStore) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);

  router.post(
    '/upload',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const kind =
        request.query.kind === 'PHOTO' || request.query.kind === 'VIDEO'
          ? request.query.kind
          : null;
      const mime = request.get('content-type')?.split(';')[0]?.trim() ?? '';
      if (!kind) {
        response.status(400).json({ error: 'Précisez kind=PHOTO ou kind=VIDEO.' });
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      const limit = kind === 'PHOTO' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > limit) {
          response.status(413).json({ error: 'Le fichier dépasse la taille maximale autorisée.' });
          request.resume();
          return;
        }
        chunks.push(Buffer.from(chunk));
      }
      try {
        const saved = await media.upload(Buffer.concat(chunks), mime, kind);
        response.status(201).json(saved);
      } catch (error) {
        if (error instanceof Error && error.message === 'MEDIA_FILE_INVALID') {
          response.status(400).json({ error: 'Format ou taille de fichier non autorisé.' });
          return;
        }
        throw error;
      }
    }),
  );

  router.get(
    '/',
    requireAdmin,
    asyncHandler(async (_request, response) => response.json(await media.listAdmin())),
  );
  router.post(
    '/',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const input = createMediaSchema.safeParse(request.body);
      if (!input.success) {
        response.status(400).json({ error: 'Informations média invalides.' });
        return;
      }
      response.status(201).json(await media.create(input.data, response.locals.userId!));
    }),
  );
  router.patch(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const input = updateMediaSchema.safeParse(request.body);
      if (!input.success) {
        response.status(400).json({ error: 'Informations média invalides.' });
        return;
      }
      response.json(
        await media.update(String(request.params.id), input.data, response.locals.userId!),
      );
    }),
  );
  router.delete(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      await media.delete(String(request.params.id), response.locals.userId!);
      response.status(204).end();
    }),
  );
  return router;
}

export function createMediaRouter(
  media: ManageMedia,
  publicMedia: ReadPublicMedia,
  sessionStore: SessionStore,
) {
  const router = Router();
  router.use('/public', createPublicMediaRouter(publicMedia));
  router.use('/admin', createAdminMediaRouter(media, sessionStore));
  return router;
}
