import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../auth/presentation/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { PrismaClient } from '@prisma/client';
import type { NotificationDispatcher } from '../domain/notification.js';

export function createAdminNotificationRouter(prisma: PrismaClient, sessions: SessionStore, dispatcher: NotificationDispatcher) {
  const router = Router();
  router.get('/', createRequireAdmin(sessions), asyncHandler(async (request, response) => {
    const page = Math.max(1, Math.min(10000, Number(request.query.page ?? 1)));
    const size = Math.max(1, Math.min(50, Number(request.query.size ?? 20)));
    if (!Number.isInteger(page) || !Number.isInteger(size)) { response.status(400).json({ error: 'Pagination invalide.' }); return; }
    const [items, total] = await Promise.all([
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * size, take: size, select: { id: true, kind: true, attempts: true, sentAt: true, lastError: true, createdAt: true } }),
      prisma.notification.count(),
    ]);
    response.json({ items, total, page, size });
  }));
  router.post('/retry', createRequireAdmin(sessions), asyncHandler(async (_request, response) => {
    await prisma.notification.updateMany({ where: { sentAt: null, attempts: { gte: 8 } }, data: { attempts: 0, availableAt: new Date(), lastError: null } });
    response.json({ dispatched: await dispatcher.dispatchPending(50) });
  }));
  return router;
}
