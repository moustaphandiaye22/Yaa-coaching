import type { ManageContent } from '../../backend/src/modules/content/application/manage-content.js';
import { ReadQuestionnaire } from '../../backend/src/modules/questionnaire/application/read-questionnaire.js';

describe('ReadQuestionnaire', () => {
  it('returns the published questionnaire from persisted content', async () => {
    const published = { version: 'db-version', steps: [] };
    const content = {
      findPublic: jest.fn().mockResolvedValue({
        content: { items: { 'YAA PLAYER': published } },
      }),
    } as unknown as ManageContent;
    const reader = new ReadQuestionnaire(content);

    await expect(reader.execute('YAA PLAYER')).resolves.toEqual(published);
    expect(content.findPublic).toHaveBeenCalledWith('questionnaires');
  });

  it('rejects unknown service identifiers without querying content', async () => {
    const content = { findPublic: jest.fn() } as unknown as ManageContent;
    const reader = new ReadQuestionnaire(content);

    await expect(reader.execute('UNKNOWN')).resolves.toBeNull();
    expect(content.findPublic).not.toHaveBeenCalled();
  });

  it('aligns legacy published field types and validation metadata with the current form contract', async () => {
    const published = {
      version: 'v1',
      steps: [
        {
          number: 1,
          title: 'Présentation enregistrée',
          questions: [
            { key: 'age', label: 'Âge personnalisé', type: 'select', options: ['Moins de 18 ans'] },
          ],
        },
        {
          number: 2,
          title: 'Point de départ enregistré',
          questions: [{ key: 'priorities', label: 'Priorités personnalisées', type: 'multi' }],
        },
        { number: 3, title: 'Parcours enregistré', questions: [] },
        {
          number: 4,
          title: 'Objectifs enregistrés',
          questions: [
            { key: 'expectationsShared', label: 'Attentes personnalisées', type: 'textarea' },
            {
              key: 'kilos',
              label: 'Poids personnalisé',
              condition: { key: 'weightLoss', equals: 'Oui' },
            },
          ],
        },
        { number: 5, title: 'Organisation enregistrée', questions: [] },
      ],
    };
    const content = {
      findPublic: jest.fn().mockResolvedValue({
        content: { items: { 'YAA COACHING': published } },
      }),
    } as unknown as ManageContent;
    const reader = new ReadQuestionnaire(content);

    const result = (await reader.execute('YAA COACHING')) as {
      version: string;
      steps: {
        title: string;
        questions: { key: string; type: string; required?: boolean; max?: number }[];
      }[];
    };
    const questions = result.steps.flatMap((step) => step.questions);
    const age = questions.find((question) => question.key === 'age');
    const priorities = questions.find((question) => question.key === 'priorities');
    const expectationsShared = questions.find((question) => question.key === 'expectationsShared');
    const kilos = questions.find((question) => question.key === 'kilos');

    expect(result.version).toBe('v3');
    expect(result.steps[0].title).toBe('Présentation enregistrée');
    expect(age).toMatchObject({ key: 'age', type: 'number', required: true });
    expect(priorities).toMatchObject({ key: 'priorities', type: 'multi', max: 3 });
    expect(expectationsShared).toMatchObject({ key: 'expectationsShared', type: 'select' });
    expect(kilos).toMatchObject({
      key: 'kilos',
      type: 'number',
      required: true,
      min: 1,
      maxValue: 300,
      step: 1,
    });
  });

  it('preserves the managed question list, including deletions and optional questions', async () => {
    const content = {
      findPublic: jest.fn().mockResolvedValue({
        content: {
          items: {
            'YAA PLAYER': {
              questionsManaged: true,
              steps: [
                {
                  number: 1,
                  questions: [
                    {
                      key: 'customQuestion',
                      label: 'Question personnalisée',
                      type: 'number',
                      required: false,
                    },
                    { key: 'age', label: 'Âge', type: 'text', required: false },
                  ],
                },
                { number: 2, questions: [] },
                { number: 3, questions: [] },
                { number: 4, questions: [] },
                { number: 5, questions: [] },
              ],
            },
          },
        },
      }),
    } as unknown as ManageContent;
    const reader = new ReadQuestionnaire(content);

    const result = (await reader.execute('YAA PLAYER')) as {
      steps: { questions: { key: string; type: string; required: boolean }[] }[];
    };

    expect(result.steps[0].questions).toEqual([
      {
        key: 'customQuestion',
        label: 'Question personnalisée',
        type: 'text',
        required: false,
      },
      { key: 'age', label: 'Âge', type: 'number', required: true, min: 1, maxValue: 120, step: 1 },
    ]);
    expect(result.steps[1].questions).toEqual([]);
  });
});
