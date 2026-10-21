import { z } from 'zod';
import { serviceSchema } from '../../submissions/presentation/submission-schemas.js';

const safeMediaUrl = z.string().max(2048).refine((value) => {
  if (/^\/media\/[a-f\d-]+\.(jpg|png|webp|mp4|webm)$/i.test(value)) return true;
  if (!URL.canParse(value)) return false;
  const protocol = new URL(value).protocol;
  return protocol === 'https:';
}, 'URL média invalide.');

export const createMediaSchema = z.object({
  kind: z.enum(['PHOTO', 'VIDEO']),
  service: serviceSchema,
  url: safeMediaUrl,
  alt: z.string().trim().min(3).max(300),
  caption: z.string().trim().max(500).default(''),
  position: z.number().int().min(0).max(10000).optional(),
  published: z.boolean().optional(),
});

export const updateMediaSchema = createMediaSchema.partial().refine((media) => Object.keys(media).length > 0);
