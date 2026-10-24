import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import { ManageFaqs } from '../application/manage-faqs.js';
import { createFaqSchema, updateFaqSchema } from './faq-schemas.js';
import { validationResponse } from '../../../shared/http/validation-response.js';

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
        response
          .status(400)
          .json(
            validationResponse(
              input.error,
              { question: 'La question', answer: 'La réponse', position: 'La position' },
              'La question n’a pas été enregistrée.',
            ),
          );
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
        response
          .status(400)
          .json(
            input.success
              ? { error: 'Aucune modification à enregistrer. Modifiez la question ou la réponse.' }
              : validationResponse(
                  input.error,
                  { question: 'La question', answer: 'La réponse', position: 'La position' },
                  'La modification n’a pas été enregistrée.',
                ),
          );
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
