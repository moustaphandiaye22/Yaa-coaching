import { getQuestionnaire, isServiceName } from '../domain/questionnaire.js';

export class ReadQuestionnaire {
  execute(service: unknown) {
    if (service !== undefined && !isServiceName(service)) return null;
    return getQuestionnaire(service);
  }
}
