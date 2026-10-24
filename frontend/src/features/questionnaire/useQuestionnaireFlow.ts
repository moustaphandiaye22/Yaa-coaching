import { useEffect, useState } from 'react';
import type { Answers, Question, Service } from '../../shared/site-content.js';
import { ApiError, requestJson } from '../../shared/api-client.js';
import { useServiceCatalog } from '../../shared/service-catalog.js';

type Questionnaire = {
  service: Service;
  title: string;
  introduction: string;
  notices: string[];
  titles: string[];
  steps: Question[][];
};

export function useQuestionnaireFlow(
  initialSituation: string,
  initialService: string,
  onNotice: (message: string, type?: 'success' | 'error' | 'info') => void,
) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questionnaireError, setQuestionnaireError] = useState(false);
  const [questionnaireReload, setQuestionnaireReload] = useState(0);
  const serviceCatalog = useServiceCatalog();
  const situation = String(answers.situation ?? '');
  const matchedService = serviceCatalog.find(
    (item) =>
      Array.isArray(item.questionnaireSituations) &&
      item.questionnaireSituations.includes(situation),
  )?.name;
  const service: Service =
    matchedService || (initialService as Service) || serviceCatalog[0]?.name || 'YAA COACHING';
  const isMinor = answers.age === 'Moins de 18 ans';
  const activeQuestionnaire = questionnaire?.service === service ? questionnaire : null;
  const currentQuestions = activeQuestionnaire?.steps[step] ?? [];

  useEffect(() => {
    if (!initialSituation) return;
    setAnswers((current) => ({ ...current, situation: initialSituation }));
    setStep(0);
  }, [initialSituation]);

  useEffect(() => {
    const controller = new AbortController();
    requestJson<{
      title?: string;
      introduction?: string;
      notices?: string[];
      steps?: { title: string; questions: Question[] }[];
    }>(`/api/public/questionnaire?service=${encodeURIComponent(service)}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (!Array.isArray(result.steps) || result.steps.length !== 5) return;
        setQuestionnaire({
          service,
          title: result.title ?? '',
          introduction: result.introduction ?? '',
          notices: Array.isArray(result.notices) ? result.notices : [],
          titles: result.steps.map((item) => item.title),
          steps: result.steps.map((item) => item.questions),
        });
        setQuestionnaireError(false);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setQuestionnaire(null);
          setQuestionnaireError(true);
        }
      });
    return () => controller.abort();
  }, [service, questionnaireReload]);

  function update(key: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function visibleQuestions(questions: Question[]) {
    return questions.filter((question) => {
      if (question.key === 'representative' && isMinor) return true;
      if (!question.condition) return true;
      if (Array.isArray(question.condition))
        return answers[question.condition[0]] !== question.condition[1];
      const value = answers[question.condition.key];
      return question.condition.equals !== undefined
        ? value === question.condition.equals
        : question.condition.notEquals !== undefined
          ? value !== question.condition.notEquals
          : true;
    });
  }

  function questionIsRequired(question: Question) {
    return question.required || (question.key === 'representative' && isMinor);
  }

  function invalidQuestions(questions: Question[]) {
    return visibleQuestions(questions).filter((question) => {
      const answer = answers[question.key];
      const empty = Array.isArray(answer)
        ? answer.length === 0
        : String(answer ?? '').trim().length === 0;
      if (questionIsRequired(question) && empty) return true;
      if (
        question.type === 'email' &&
        !empty &&
        (typeof answer !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer.trim()))
      ) {
        return true;
      }
      return false;
    });
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await requestJson<{ message: string }>('/api/public/submissions', {
        method: 'POST',
        body: JSON.stringify({
          service,
          city: answers.city || 'À préciser',
          contactName: answers.representative || answers.firstName,
          contactEmail: answers.contactEmail,
          contactPhone: answers.contactPhone || '',
          answers: Object.fromEntries(
            Object.entries(answers).filter(
              ([key]) => key !== 'consent' && key !== 'guardianConsent',
            ),
          ),
          consent: true,
          ...(isMinor ? { guardianConsent: true } : {}),
        }),
      });
      onNotice(result.message, 'success');
      setAnswers({});
      setStep(0);
    } catch (error) {
      onNotice(
        error instanceof ApiError
          ? error.message
          : 'Le service est momentanément indisponible. Vos réponses sont conservées, réessayez dans quelques instants.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function continueToNextStep() {
    if (!activeQuestionnaire) {
      onNotice(
        'Le questionnaire est en cours de chargement. Réessayez dans quelques instants.',
        'info',
      );
      return;
    }
    const invalid = invalidQuestions(currentQuestions);
    if (invalid.length) {
      const labels = invalid.map((question) => question.label).join(' ; ');
      onNotice(
        `Pour continuer, complétez ou corrigez les champs suivants : ${labels}. Vérifiez le format de l’adresse e-mail si elle est demandée.`,
        'error',
      );
      return;
    }
    onNotice('');
    setStep((current) => Math.min(current + 1, 4));
  }

  function submitIfValid() {
    if (!activeQuestionnaire) {
      onNotice('Le questionnaire n’est pas encore prêt. Réessayez dans quelques instants.', 'info');
      return;
    }
    const invalid = invalidQuestions(currentQuestions).map((question) => question.label);
    if (answers.consent !== 'yes') invalid.push('votre accord de contact');
    if (isMinor && answers.guardianConsent !== 'yes') {
      invalid.push('l’accord du parent ou responsable légal');
    }
    if (invalid.length) {
      onNotice(
        `Votre demande n’a pas été envoyée. Corrigez les éléments suivants : ${invalid.join(' ; ')}.`,
        'error',
      );
      return;
    }
    onNotice('');
    void submit();
  }

  return {
    step,
    setStep,
    answers,
    setAnswers,
    submitting,
    questionnaireError,
    reloadQuestionnaire: () => setQuestionnaireReload((value) => value + 1),
    service,
    isMinor,
    activeQuestionnaire,
    currentQuestions,
    titles: activeQuestionnaire?.titles ?? [],
    questionnaireTitle: activeQuestionnaire?.title ?? '',
    questionnaireIntroduction: activeQuestionnaire?.introduction ?? '',
    questionnaireNotices: activeQuestionnaire?.notices ?? [],
    update,
    visibleQuestions,
    questionIsRequired,
    continueToNextStep,
    submitIfValid,
  };
}
