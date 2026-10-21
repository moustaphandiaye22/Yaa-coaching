import type { ManageContent } from '../../content/application/manage-content.js';
import { isServiceName } from '../domain/questionnaire.js';

export class ReadQuestionnaire {
  constructor(private readonly content: ManageContent) {}

  async execute(service: unknown) {
    if (service !== undefined && !isServiceName(service)) return null;
    const block = (await this.content.findPublic('questionnaires')) as {
      content?: { items?: Record<string, unknown> };
    } | null;
    const items = block?.content?.items;
    if (!items) return null;
    return service === undefined ? items['YAA COACHING'] : items[service];
  }
}
