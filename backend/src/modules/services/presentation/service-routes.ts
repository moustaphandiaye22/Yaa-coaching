import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import type { ManageContent } from '../../content/application/manage-content.js';

export function createServiceRouter(content: ManageContent) {
  const router = Router();
  router.get(
    '/',
    asyncHandler(async (_request, response) => {
      const block = (await content.findPublic('services')) as {
        content?: { items?: unknown };
      } | null;
      response.json(Array.isArray(block?.content?.items) ? block.content.items : []);
    }),
  );
  return router;
}
