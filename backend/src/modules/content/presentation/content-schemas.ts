import { z } from 'zod';

export const updateContentSchema = z.object({
  content: z
    .record(z.string().min(1).max(100), z.unknown())
    .refine((content) => Object.keys(content).length > 0),
  publish: z.boolean().optional(),
});
