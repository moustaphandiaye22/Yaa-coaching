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
      try {
        const result = await service.list(page, size);
        response.json({ ...result, page, size });
      } catch (error) {
        if (error instanceof Error && error.message === 'NOTIFICATION_PAGINATION_INVALID') {
          response.status(400).json({ error: 'Pagination invalide.' });
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
      response.json({ dispatched: await service.retry() });
    }),
  );
  return router;
}
