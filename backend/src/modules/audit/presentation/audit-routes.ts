import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../auth/presentation/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { AuditRepository } from '../domain/audit-repository.js';

export function createAuditRouter(repository: AuditRepository, sessionStore: SessionStore) {
  const router = Router();
  router.get('/', createRequireAdmin(sessionStore), asyncHandler(async (request, response) => {
    const before = typeof request.query.before === 'string' && request.query.before.length <= 40
      ? request.query.before
      : undefined;
    response.json(await repository.listRecent(100, before));
  }));
  return router;
}
