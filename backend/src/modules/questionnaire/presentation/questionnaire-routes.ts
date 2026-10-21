import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { ReadQuestionnaire } from '../application/read-questionnaire.js';

export function createQuestionnaireRouter(readQuestionnaire: ReadQuestionnaire) {
  const router = Router();
  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const questionnaire = await readQuestionnaire.execute(request.query.service);
      if (!questionnaire) {
        response
          .status(404)
          .json({ error: 'Questionnaire non publié ou accompagnement invalide.' });
        return;
      }
      response.json(questionnaire);
    }),
  );
  return router;
}
