import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import { ReadAuditLog } from '../application/read-audit-log.js';

export function createAuditRouter(readAuditLog: ReadAuditLog, sessionStore: SessionStore) {
  const router = Router();
  router.get(
    '/',
    createRequireAdmin(sessionStore),
    asyncHandler(async (request, response) => {
      const cursor = typeof request.query.before === 'string' ? request.query.before : undefined;
      response.json(await readAuditLog.execute(cursor));
    }),
  );
  return router;
}
