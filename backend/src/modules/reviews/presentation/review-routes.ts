import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { SubmitReview } from '../application/submit-review.js';
import { reviewStatuses } from '../domain/review-status.js';
import { ManageReviews } from '../application/manage-reviews.js';
import { createReviewSchema, updateReviewSchema } from './review-schemas.js';
import { validationResponse } from '../../../shared/http/validation-response.js';

export function createPublicReviewRouter(submitReview: SubmitReview, reviews: ManageReviews) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_request, response) => response.json(await reviews.listPublic())),
  );
  router.post(
    '/',
    asyncHandler(async (request, response) => {
      const parsed = createReviewSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json(
          validationResponse(
            parsed.error,
            {
              pseudonym: 'Le prénom ou pseudonyme',
              service: 'L’accompagnement',
              rating: 'La note',
              message: 'Le témoignage',
              email: 'L’adresse e-mail',
              consent: 'Votre accord de publication',
            },
            'Votre avis n’a pas été envoyé.',
          ),
        );
        return;
      }
      const review = await submitReview.execute(parsed.data);
      response.status(201).json({
        id: review.id,
        message:
          'Votre avis a bien été enregistré et transmis à l’administration. Il apparaîtra sur le site après validation par le coach.',
      });
    }),
  );

  return router;
}

export function createAdminReviewRouter(reviews: ManageReviews, sessionStore: SessionStore) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);

  router.get(
    '/',
    requireAdmin,
    asyncHandler(async (request, response) => {
      if (
        request.query.status !== undefined &&
        !reviewStatuses.some((status) => status === request.query.status)
      ) {
        response.status(400).json({ error: 'Statut d’avis invalide.' });
        return;
      }
      const status = reviewStatuses.find((value) => value === request.query.status);
      response.json(await reviews.listAdmin(status));
    }),
  );

  router.patch(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const parsed = updateReviewSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json({ error: 'Statut invalide.' });
        return;
      }
      response.json(
        await reviews.updateStatus(
          String(request.params.id),
          parsed.data.status,
          response.locals.userId!,
        ),
      );
    }),
  );
  router.delete(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      await reviews.delete(String(request.params.id), response.locals.userId!);
      response.status(204).end();
    }),
  );

  return router;
}

export function createReviewRouter(
  submitReview: SubmitReview,
  reviews: ManageReviews,
  sessionStore: SessionStore,
) {
  const router = Router();
  router.use('/public', createPublicReviewRouter(submitReview, reviews));
  router.use('/admin', createAdminReviewRouter(reviews, sessionStore));
  return router;
}
