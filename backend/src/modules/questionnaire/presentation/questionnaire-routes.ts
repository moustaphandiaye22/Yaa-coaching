import { Router } from 'express';
import { ReadQuestionnaire } from '../application/read-questionnaire.js';

export function createQuestionnaireRouter(readQuestionnaire: ReadQuestionnaire) {
  const router = Router();
  router.get('/', (request, response) => {
    const questionnaire = readQuestionnaire.execute(request.query.service);
    if (!questionnaire) {
      response.status(400).json({ error: 'Accompagnement invalide.' });
      return;
    }
    response.json(questionnaire);
  });
  return router;
}
