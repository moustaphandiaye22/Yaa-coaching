import { getQuestionnaire } from '../../backend/prisma/default-questionnaires.js';
import { isServiceName } from '../../backend/src/modules/questionnaire/domain/questionnaire.js';

describe('questionnaire public contract', () => {
  it.each(['YAA COACHING', 'YAA PLAYER', 'YAA AUTONOMIE'] as const)(
    'provides five steps for %s',
    (service) => {
      const questionnaire = getQuestionnaire(service);

      expect(questionnaire.service).toBe(service);
      expect(questionnaire.steps).toHaveLength(5);
      expect(questionnaire.maxPriorities).toBe(3);
      expect(questionnaire.steps[0]?.questions.map((question) => question.key)).toContain(
        'firstName',
      );
      expect(questionnaire.steps[4]?.questions.map((question) => question.key)).toContain(
        'contactEmail',
      );
    },
  );

  it('accepts only catalog services', () => {
    expect(isServiceName('YAA PLAYER')).toBe(true);
    expect(isServiceName('UNKNOWN SERVICE')).toBe(false);
  });
});
