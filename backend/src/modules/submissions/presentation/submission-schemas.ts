import { z } from 'zod';
import { serviceNames } from '../../services/domain/service-catalog.js';
import { submissionStatuses } from '../domain/submission-status.js';

export const serviceSchema = z.enum(serviceNames);
const answerValueSchema = z.union([z.string().max(5000), z.array(z.string().max(300)).max(20)]);
const answersSchema = z
  .record(z.string().min(1).max(80), answerValueSchema)
  .superRefine((answers, context) => {
    const requiredAnswers = [
      'approach',
      'firstName',
      'age',
      'city',
      'situation',
      'difficulties',
      'expectations',
      'goal',
      'contactEmail',
    ];
    for (const key of requiredAnswers) {
      if (typeof answers[key] !== 'string' || !answers[key].trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: 'Cette réponse est requise.',
        });
      }
    }
    for (const key of ['priorities', 'playerPriorities']) {
      if (Array.isArray(answers[key]) && answers[key].length > 3) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: 'Trois choix au maximum.',
        });
      }
    }
  });

export const createSubmissionSchema = z
  .object({
    service: serviceSchema,
    city: z.string().trim().min(2).max(100),
    contactName: z.string().trim().min(2).max(100),
    contactEmail: z.string().trim().email().max(254),
    contactPhone: z.string().trim().max(40).optional().default(''),
    answers: answersSchema,
    consent: z.literal(true),
    guardianConsent: z.literal(true).optional(),
    website: z.string().max(0).optional(),
  })
  .superRefine((submission, context) => {
    if (
      submission.answers.approach !== 'Pour moi-même' &&
      submission.contactName.trim().toLowerCase() ===
        String(submission.answers.firstName).trim().toLowerCase()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contactName'],
        message:
          'Le premier contact doit être le proche ou le responsable qui remplit le formulaire.',
      });
    }
    if (submission.answers.age === 'Moins de 18 ans') {
      if (!submission.guardianConsent) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianConsent'],
          message: 'L’accord du parent ou responsable légal est requis.',
        });
      }
    }
  });

export const updateSubmissionSchema = z
  .object({
    status: z.enum(submissionStatuses).optional(),
    internalNotes: z.string().max(5000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0);
