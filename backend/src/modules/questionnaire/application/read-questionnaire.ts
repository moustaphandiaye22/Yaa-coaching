import type { ManageContent } from '../../content/application/manage-content.js';
import { getQuestionnaire } from '../domain/default-questionnaires.js';
import { isServiceName, type ServiceName } from '../domain/questionnaire.js';

type RecordValue = Record<string, unknown>;

const fixedOptionKeys = new Set([
  'approach',
  'situation',
  'weightLoss',
  'expectationsShared',
  'deadline',
  'pastSupport',
]);
const requiredQuestionKeys = new Set([
  'approach',
  'firstName',
  'age',
  'city',
  'situation',
  'difficulties',
  'expectations',
  'goal',
  'contactEmail',
]);

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeQuestionnaire(value: unknown, service: ServiceName): unknown {
  if (!isRecord(value) || !Array.isArray(value.steps) || value.steps.length !== 5) return value;

  const savedSteps = value.steps as unknown[];
  const questionsManaged = value.questionsManaged === true;
  const defaults = getQuestionnaire(service);
  const steps = defaults.steps.map((defaultStep, index) => {
    const savedStep = savedSteps.find(
      (candidate) => isRecord(candidate) && candidate.number === defaultStep.number,
    );
    const step = isRecord(savedStep) ? savedStep : savedSteps[index];
    const hasSavedQuestions = isRecord(step) && Array.isArray(step.questions);
    const savedQuestions = hasSavedQuestions ? (step.questions as unknown[]) : [];
    const savedByKey = new Map(
      savedQuestions.filter(isRecord).map((question) => [String(question.key), question] as const),
    );
    const defaultQuestions = new Map(
      defaultStep.questions.map((question) => [question.key, question] as const),
    );
    const sourceQuestions =
      questionsManaged && hasSavedQuestions
        ? savedQuestions
        : [
            ...defaultStep.questions.map((question) => ({
              ...question,
              ...(savedByKey.get(question.key) ?? {}),
            })),
            ...savedQuestions.filter(
              (question) => isRecord(question) && !defaultQuestions.has(String(question.key)),
            ),
          ];
    const questions = sourceQuestions.filter(isRecord).map((savedQuestion) => {
      const key = String(savedQuestion.key ?? '');
      const defaultQuestion = defaultQuestions.get(key);
      const question: RecordValue = {
        ...(defaultQuestion as unknown as RecordValue | undefined),
        ...savedQuestion,
        key,
        type: defaultQuestion?.type ?? 'text',
        required: requiredQuestionKeys.has(key)
          ? true
          : typeof savedQuestion.required === 'boolean'
            ? savedQuestion.required
            : Boolean(defaultQuestion?.required),
      };
      for (const field of ['min', 'maxValue', 'step', 'max'] as const) {
        const defaultValue = (defaultQuestion as unknown as RecordValue | undefined)?.[field];
        if (defaultValue === undefined) delete question[field];
        else question[field] = defaultValue;
      }
      if (defaultQuestion?.condition === undefined && defaultQuestion) delete question.condition;
      else if (defaultQuestion?.condition !== undefined)
        question.condition = defaultQuestion.condition;
      if (Array.isArray(savedQuestion.options) && !fixedOptionKeys.has(key))
        question.options = savedQuestion.options;
      else if (defaultQuestion?.options) question.options = defaultQuestion.options;
      else delete question.options;
      return question;
    });

    return {
      ...defaultStep,
      ...(isRecord(step) ? step : {}),
      number: defaultStep.number,
      questions,
    };
  });

  return { ...defaults, ...value, version: defaults.version, service, steps };
}

export class ReadQuestionnaire {
  constructor(private readonly content: ManageContent) {}

  async execute(service: unknown) {
    if (service !== undefined && !isServiceName(service)) return null;
    const block = (await this.content.findPublic('questionnaires')) as {
      content?: { items?: Record<string, unknown> };
    } | null;
    const items = block?.content?.items;
    if (!items) return null;
    if (service !== undefined) {
      return isServiceName(service) ? normalizeQuestionnaire(items[service], service) : null;
    }
    return normalizeQuestionnaire(items['YAA COACHING'], 'YAA COACHING');
  }
}
