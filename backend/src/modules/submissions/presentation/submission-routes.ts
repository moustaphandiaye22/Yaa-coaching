import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../auth/presentation/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import { SubmitSubmission } from '../application/submit-submission.js';
import type { SubmissionRepository } from '../domain/submission-repository.js';
import { submissionStatuses } from '../domain/submission-status.js';
import { createSubmissionSchema, updateSubmissionSchema } from './submission-schemas.js';

export function createPublicSubmissionRouter(repository: SubmissionRepository) {
  const router = Router();
  const submitSubmission = new SubmitSubmission(repository);

  router.post('/', asyncHandler(async (request, response) => {
    const parsed = createSubmissionSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Vérifiez les champs requis et le consentement.', fields: parsed.error.flatten().fieldErrors });
      return;
    }
    const { consent: _consent, website: _website, guardianConsent, ...data } = parsed.data;
    const submission = await submitSubmission.execute({ ...data, guardianConsent: guardianConsent === true });
    response.status(201).json({ ...submission, message: 'Votre demande a bien été transmise.' });
  }));

  return router;
}

export function createAdminSubmissionRouter(repository: SubmissionRepository, sessionStore: SessionStore) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);

  router.get('/', requireAdmin, asyncHandler(async (request, response) => {
    const page = Number(request.query.page ?? 1);
    const size = Number(request.query.size ?? 20);
    if (!Number.isInteger(page) || page < 1 || page > 100000 || !Number.isInteger(size) || size < 1 || size > 50) {
      response.status(400).json({ error: 'Pagination invalide.' });
      return;
    }
    if (request.query.status !== undefined && !submissionStatuses.some((status) => status === request.query.status)) {
      response.status(400).json({ error: 'Statut de demande invalide.' });
      return;
    }
    const status = submissionStatuses.find((value) => value === request.query.status);
    const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
    if (query.length > 120) {
      response.status(400).json({ error: 'Recherche trop longue.' });
      return;
    }
    const [items, total] = await repository.listAdmin(status, query, page, size);
    response.json({ items, total, page, size });
  }));

  router.get('/:id', requireAdmin, asyncHandler(async (request, response) => {
    const item = await repository.findById(String(request.params.id));
    if (!item) {
      response.status(404).json({ error: 'Demande introuvable.' });
      return;
    }
    response.json(item);
  }));

  router.get('/:id/export', requireAdmin, asyncHandler(async (request, response) => {
    const item = await repository.findById(String(request.params.id));
    if (!item) {
      response.status(404).json({ error: 'Demande introuvable.' });
      return;
    }
    response.setHeader('Content-Disposition', 'attachment; filename="yaa-submission.json"');
    response.json(item);
  }));

  router.patch('/:id', requireAdmin, asyncHandler(async (request, response) => {
    const parsed = updateSubmissionSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: 'Statut ou note invalide.' });
      return;
    }
    const item = await repository.updateAdmin(String(request.params.id), {
      ...parsed.data,
      actorId: response.locals.userId,
    });
    response.json(item);
  }));

  router.delete('/:id', requireAdmin, asyncHandler(async (request, response) => {
    await repository.deleteAdmin(String(request.params.id), response.locals.userId!);
    response.status(204).end();
  }));

  return router;
}

export function createSubmissionRouter(repository: SubmissionRepository, sessionStore: SessionStore) {
  const router = Router();
  router.use('/public', createPublicSubmissionRouter(repository));
  router.use('/admin', createAdminSubmissionRouter(repository, sessionStore));
  return router;
}
