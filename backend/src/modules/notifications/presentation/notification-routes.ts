import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { ManageNotifications } from '../application/manage-notifications.js';

export function createAdminNotificationRouter(
  service: ManageNotifications,
  sessions: SessionStore,
) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessions);

  router.get(
    '/',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const page = Number(request.query.page ?? 1);
      const size = Number(request.query.size ?? 20);
      const status = typeof request.query.status === 'string' ? request.query.status : undefined;
      const query = typeof request.query.q === 'string' ? request.query.q : undefined;
      try {
        const result = await service.list(page, size, { status, query });
        response.json({ ...result, page, size });
      } catch (error) {
        if (error instanceof Error && error.message === 'NOTIFICATION_PAGINATION_INVALID') {
          response.status(400).json({ error: 'Pagination invalide.' });
          return;
        }
        if (error instanceof Error && error.message === 'NOTIFICATION_FILTER_INVALID') {
          response.status(400).json({ error: 'Filtre ou recherche invalide.' });
          return;
        }
        throw error;
      }
    }),
  );

  router.post(
    '/retry',
    requireAdmin,
    asyncHandler(async (_request, response) => {
      response
        .status(410)
        .json({ error: 'Les notifications des tunnels sont gérées dans Systeme.io.' });
    }),
  );
  return router;
}
