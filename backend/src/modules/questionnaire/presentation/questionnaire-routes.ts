import { Router } from 'express';
import { getQuestionnaire, isServiceName } from '../domain/questionnaire.js';

export const questionnaireRouter = Router();

questionnaireRouter.get('/', (request, response) => {
  const service = request.query.service;
  if (service !== undefined && !isServiceName(service)) {
    response.status(400).json({ error: 'Accompagnement invalide.' });
    return;
  }
  response.json(getQuestionnaire(service));
});
