import { z } from 'zod';
import { serviceSchema } from '../../submissions/presentation/submission-schemas.js';
import { reviewStatuses } from '../domain/review-status.js';

export const createReviewSchema = z.object({
  pseudonym: z
    .string({ required_error: 'Indiquez un prénom ou un pseudonyme.' })
    .trim()
    .min(2, 'Saisissez au moins 2 caractères.')
    .max(60, 'Le prénom ou pseudonyme ne peut pas dépasser 60 caractères.'),
  service: serviceSchema,
  rating: z
    .number({ required_error: 'Choisissez une note entre 1 et 5.' })
    .int('La note doit être un nombre entier.')
    .min(1, 'La note minimale est 1 sur 5.')
    .max(5, 'La note maximale est 5 sur 5.'),
  message: z
    .string({ required_error: 'Rédigez votre témoignage.' })
    .trim()
    .min(20, 'Votre témoignage doit contenir au moins 20 caractères.')
    .max(1200, 'Votre témoignage ne peut pas dépasser 1 200 caractères.'),
  email: z
    .string({ required_error: 'Indiquez une adresse e-mail.' })
    .trim()
    .email('Saisissez une adresse e-mail valide.')
    .max(254, 'L’adresse e-mail ne peut pas dépasser 254 caractères.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Cochez la case pour autoriser la publication de votre avis.' }),
  }),
});

export const updateReviewSchema = z.object({ status: z.enum(reviewStatuses) });
