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
});
