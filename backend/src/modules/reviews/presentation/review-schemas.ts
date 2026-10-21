import { z } from 'zod';
import { serviceSchema } from '../../submissions/presentation/submission-schemas.js';
import { reviewStatuses } from '../domain/review-status.js';

export const createReviewSchema = z.object({
  pseudonym: z.string().trim().min(2).max(60),
  service: serviceSchema,
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(20).max(1200),
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
});

export const updateReviewSchema = z.object({ status: z.enum(reviewStatuses) });
