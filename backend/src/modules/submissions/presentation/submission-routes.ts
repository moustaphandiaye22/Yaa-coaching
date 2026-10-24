import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { createRequireAdmin } from '../../../shared/http/auth-middleware.js';
import type { SessionStore } from '../../auth/domain/session.js';
import type { SubmitSubmission } from '../application/submit-submission.js';
import { submissionStatuses } from '../domain/submission-status.js';
import { createSubmissionSchema, updateSubmissionSchema } from './submission-schemas.js';
import { ManageSubmissions } from '../application/manage-submissions.js';
import { ExportSubmissionPdf } from '../application/export-submission-pdf.js';
import { validationResponse } from '../../../shared/http/validation-response.js';

export function createPublicSubmissionRouter(
  submitSubmission: SubmitSubmission,
  readQuestionnaire?: (service: string) => Promise<unknown>,
) {
  const router = Router();

  router.post(
    '/',
    asyncHandler(async (request, response) => {
      const parsed = createSubmissionSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json(
          validationResponse(
            parsed.error,
            {
              service: 'L’accompagnement',
              city: 'La ville',
              contactName: 'Le prénom de la personne à recontacter',
              contactEmail: 'L’adresse e-mail de contact',
              contactPhone: 'Le numéro de téléphone',
              'answers.approach': 'Votre démarche',
              'answers.firstName': 'Le prénom de la personne accompagnée',
              'answers.age': 'L’âge de la personne accompagnée',
              'answers.city': 'La ville',
              'answers.situation': 'La situation',
              'answers.difficulties': 'Les difficultés rencontrées',
              'answers.expectations': 'Vos attentes',
              'answers.goal': 'Votre objectif',
              'answers.contactEmail': 'Votre adresse e-mail',
              'answers.priorities': 'Vos priorités',
              'answers.playerPriorities': 'Les priorités du joueur',
              consent: 'Votre accord de contact',
              guardianConsent: 'L’accord du parent ou responsable légal',
            },
            'Votre demande n’a pas été envoyée.',
          ),
        );
        return;
      }
      if (readQuestionnaire) {
        const questionnaire = await readQuestionnaire(parsed.data.service);
        const questionnaireRecord =
          questionnaire && typeof questionnaire === 'object'
            ? (questionnaire as Record<string, unknown>)
            : {};
        const answers = parsed.data.answers;
        const steps = Array.isArray(questionnaireRecord.steps) ? questionnaireRecord.steps : [];
        const fields: Record<string, string[]> = {};

        for (const step of steps) {
          const questions =
            step &&
            typeof step === 'object' &&
            Array.isArray((step as { questions?: unknown }).questions)
              ? (step as { questions: unknown[] }).questions
              : [];
          for (const question of questions) {
            if (!question || typeof question !== 'object') continue;
            const item = question as {
              key?: unknown;
              label?: unknown;
              required?: unknown;
              condition?: unknown;
            };
            if (typeof item.key !== 'string' || item.required !== true) continue;
            const condition = item.condition;
            let isVisible = true;
            if (Array.isArray(condition) && condition.length >= 2) {
              isVisible = answers[String(condition[0])] !== condition[1];
            } else if (condition && typeof condition === 'object') {
              const rule = condition as { key?: unknown; equals?: unknown; notEquals?: unknown };
              const answer = answers[String(rule.key ?? '')];
              if (rule.equals !== undefined) isVisible = answer === rule.equals;
              else if (rule.notEquals !== undefined) isVisible = answer !== rule.notEquals;
            }
            if (!isVisible) continue;
            const answer = answers[item.key];
            const isEmpty = Array.isArray(answer)
              ? answer.length === 0
              : typeof answer !== 'string' || !answer.trim();
            if (isEmpty) {
              fields[`answers.${item.key}`] = [
                `${typeof item.label === 'string' ? item.label : 'Cette question'} : Ce champ est obligatoire.`,
              ];
            }
          }
        }

        if (Object.keys(fields).length) {
          response.status(400).json({
            error:
              'Votre demande n’a pas été envoyée. Corrigez les champs indiqués puis réessayez.',
            fields,
          });
          return;
        }
      }
      const { guardianConsent, consent, website, ...data } = parsed.data;
      void consent;
      void website;
      const submission = await submitSubmission.execute({
        ...data,
        guardianConsent: guardianConsent === true,
      });
      response.status(201).json({
        ...submission,
        message:
          'Votre demande a bien été enregistrée et transmise au coach. Il pourra vous recontacter à l’adresse e-mail indiquée.',
      });
    }),
  );

  return router;
}

export function createAdminSubmissionRouter(
  submissions: ManageSubmissions,
  sessionStore: SessionStore,
  exportSubmissionPdf: ExportSubmissionPdf,
) {
  const router = Router();
  const requireAdmin = createRequireAdmin(sessionStore);

  router.get(
    '/',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const page = Number(request.query.page ?? 1);
      const size = Number(request.query.size ?? 20);
      if (
        !Number.isInteger(page) ||
        page < 1 ||
        page > 100000 ||
        !Number.isInteger(size) ||
        size < 1 ||
        size > 50
      ) {
        response.status(400).json({ error: 'Pagination invalide.' });
        return;
      }
      if (
        request.query.status !== undefined &&
        !submissionStatuses.some((status) => status === request.query.status)
      ) {
        response.status(400).json({ error: 'Statut de demande invalide.' });
        return;
      }
      const status = submissionStatuses.find((value) => value === request.query.status);
      const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
      if (query.length > 120) {
        response.status(400).json({ error: 'Recherche trop longue.' });
        return;
      }
      const [items, total] = await submissions.list(status, query, page, size);
      response.json({ items, total, page, size });
    }),
  );

  router.get(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const item = await submissions.find(String(request.params.id));
      if (!item) {
        response.status(404).json({ error: 'Demande introuvable.' });
        return;
      }
      response.json(item);
    }),
  );

  router.get(
    '/:id/export',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const id = String(request.params.id);
      const pdf = await exportSubmissionPdf.execute(id);
      if (!pdf) {
        response.status(404).json({ error: 'Demande introuvable.' });
        return;
      }
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', 'attachment; filename="yaa-coaching-dossier.pdf"');
      response.setHeader('Cache-Control', 'private, no-store');
      response.send(Buffer.from(pdf));
    }),
  );

  router.patch(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      const parsed = updateSubmissionSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json({ error: 'Statut ou note invalide.' });
        return;
      }
      const item = await submissions.update(
        String(request.params.id),
        parsed.data,
        response.locals.userId!,
      );
      response.json(item);
    }),
  );

  router.delete(
    '/:id',
    requireAdmin,
    asyncHandler(async (request, response) => {
      await submissions.delete(String(request.params.id), response.locals.userId!);
      response.status(204).end();
    }),
  );

  return router;
}

export function createSubmissionRouter(
  submitSubmission: SubmitSubmission,
  submissions: ManageSubmissions,
  sessionStore: SessionStore,
  exportSubmissionPdf: ExportSubmissionPdf,
) {
  const router = Router();
  router.use('/public', createPublicSubmissionRouter(submitSubmission));
  router.use('/admin', createAdminSubmissionRouter(submissions, sessionStore, exportSubmissionPdf));
  return router;
}
