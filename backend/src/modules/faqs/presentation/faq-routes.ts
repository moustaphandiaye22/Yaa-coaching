import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import { ManageFaqs } from '../application/manage-faqs.js';
import { createFaqSchema, updateFaqSchema } from './faq-schemas.js';

export function createPublicFaqRouter(faqs: ManageFaqs) {
  const router = Router();
  router.get(
    '/',
    asyncHandler(async (_request, response) => response.json(await faqs.listPublic())),
  );
  return router;
}

export function createAdminFaqRouter(faqs: ManageFaqs, sessionStore: SessionStore) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);

  router.get(
    '/',
    requireAdmin,
    asyncHandler(async (_request, response) => response.json(await faqs.listAdmin())),
  );
  router.post(
    '/',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const input = createFaqSchema.safeParse(request.body);
      if (!input.success) {
        response.status(400).json({ error: 'Question ou réponse invalide.' });
        return;
      }
      response.status(201).json(await faqs.create(input.data, response.locals.userId!));
    }),
  );
  router.patch(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const input = updateFaqSchema.safeParse(request.body);
      if (!input.success || Object.keys(input.data ?? {}).length === 0) {
        response.status(400).json({ error: 'Question ou réponse invalide.' });
        return;
      }
      response.json(
        await faqs.update(String(request.params.id), input.data, response.locals.userId!),
      );
    }),
  );
  router.delete(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      await faqs.delete(String(request.params.id), response.locals.userId!);
      response.status(204).end();
    }),
  );
  return router;
}

export function createFaqRouter(faqs: ManageFaqs, sessionStore: SessionStore) {
  const router = Router();
  router.use('/public', createPublicFaqRouter(faqs));
  router.use('/admin', createAdminFaqRouter(faqs, sessionStore));
  return router;
}
