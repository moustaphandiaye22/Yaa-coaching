import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler: ErrorRequestHandler = (error, _request, response) => {
  console.error('API error:', error instanceof Error ? error.name : 'unknown');
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    response.status(400).json({ error: 'Corps JSON invalide.' });
    return;
  }
  if (error instanceof Error && 'status' in error && error.status === 413) {
    response.status(413).json({ error: 'Le contenu transmis dépasse la taille autorisée.' });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      response.status(404).json({ error: 'Ressource introuvable.' });
      return;
    }
    if (error.code === 'P2002' || error.code === 'P2003') {
      response
        .status(409)
        .json({ error: 'Cette opération entre en conflit avec une donnée existante.' });
      return;
    }
  }
  response.status(500).json({ error: 'Une erreur est survenue. Réessayez dans un instant.' });
};
