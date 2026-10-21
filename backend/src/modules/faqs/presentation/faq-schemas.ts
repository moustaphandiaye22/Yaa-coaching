import { z } from 'zod';

export const createFaqSchema = z.object({
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(3000),
  position: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
});

export const updateFaqSchema = createFaqSchema.partial();
