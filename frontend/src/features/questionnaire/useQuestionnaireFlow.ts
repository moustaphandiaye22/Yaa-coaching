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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
  const age = Number(answers.age);
  const isMinor = Number.isFinite(age) && age > 0 && age < 18;
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
    setAnswers((current) => {
      const next = { ...current, [key]: value };
      for (const question of questionnaire?.steps.flat() ?? []) {
        if (!question.condition) continue;
        const conditionKey = Array.isArray(question.condition)
          ? question.condition[0]
          : question.condition.key;
        if (conditionKey !== key) continue;
        const conditionIsMet = Array.isArray(question.condition)
          ? next[key] === question.condition[1]
          : question.condition.equals !== undefined
            ? next[key] === question.condition.equals
            : question.condition.notEquals !== undefined
              ? next[key] !== question.condition.notEquals
              : true;
        if (!conditionIsMet) {
          delete next[question.key];
        }
      }
      if (key === 'age' && (Number(value) >= 18 || !Number(value))) {
        delete next.guardianConsent;
      }
      return next;
    });
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      for (const question of questionnaire?.steps.flat() ?? []) {
        const condition = question.condition;
        const conditionKey = Array.isArray(condition) ? condition[0] : condition?.key;
        if (conditionKey === key) delete next[question.key];
      }
      if (key === 'age' && (Number(value) >= 18 || !Number(value))) {
        delete next.guardianConsent;
      }
      return next;
    });
  }

  function visibleQuestions(questions: Question[]) {
    return questions.filter((question) => {
      if (question.key === 'representative' && isMinor) return true;
      if (
        question.key === 'representative' &&
        !['Pour mon enfant', 'Pour un proche'].includes(String(answers.approach ?? ''))
      ) {
        return false;
      }
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
    return (
      question.required ||
      (question.key === 'representative' &&
        (isMinor || ['Pour mon enfant', 'Pour un proche'].includes(String(answers.approach ?? ''))))
    );
  }

  function questionError(question: Question): string | null {
    const answer = answers[question.key];
    const empty = Array.isArray(answer)
      ? answer.length === 0
      : String(answer ?? '').trim().length === 0;
    if (questionIsRequired(question) && empty) {
      return question.type === 'multi'
        ? 'Choisissez au moins une réponse.'
        : 'Ce champ est obligatoire.';
    }
    if (typeof answer === 'string') {
      const trimmed = answer.trim();
      if (['firstName', 'representative', 'city'].includes(question.key) && trimmed.length < 2) {
        return 'Saisissez au moins 2 caractères.';
      }
      if (['firstName', 'representative'].includes(question.key) && trimmed.length > 100) {
        return 'Ce champ ne peut pas dépasser 100 caractères.';
      }
      if (question.key === 'city' && trimmed.length > 100) {
        return 'La ville ne peut pas dépasser 100 caractères.';
      }
      if (question.key === 'contactPhone' && trimmed.length > 40) {
        return 'Le numéro ne peut pas dépasser 40 caractères.';
      }
      if (question.key === 'contactEmail' && trimmed.length > 254) {
        return 'L’adresse e-mail ne peut pas dépasser 254 caractères.';
      }
      if (trimmed.length > 5000) {
        return 'La réponse ne peut pas dépasser 5 000 caractères.';
      }
      if (
        question.key === 'representative' &&
        answers.approach !== 'Pour moi-même' &&
        trimmed.toLocaleLowerCase() ===
          String(answers.firstName ?? '')
            .trim()
            .toLocaleLowerCase()
      ) {
        return 'Indiquez votre nom et votre lien avec la personne, différents de son nom.';
      }
    }
    if (
      question.type === 'multi' &&
      Array.isArray(answer) &&
      question.max &&
      answer.length > question.max
    ) {
      return `Choisissez au maximum ${question.max} réponses.`;
    }
    if (Array.isArray(answer)) {
      if (answer.length > 20) return 'Vous ne pouvez pas sélectionner plus de 20 réponses.';
      if (answer.some((item) => item.length > 300)) {
        return 'Chaque réponse ne peut pas dépasser 300 caractères.';
      }
    }
    if (
      question.type === 'email' &&
      !empty &&
      (typeof answer !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer.trim()))
    ) {
      return 'Saisissez une adresse e-mail valide.';
    }
    if ((question.key === 'age' || question.type === 'number') && !empty) {
      const number = Number(answer);
      if (!Number.isFinite(number)) return 'Saisissez un nombre valide.';
      const minimum = question.min ?? (question.key === 'age' ? 1 : undefined);
      const maximum = question.maxValue ?? (question.key === 'age' ? 120 : undefined);
      if ((question.step === 1 || question.key === 'age') && !Number.isInteger(number)) {
        return 'Saisissez un nombre entier.';
      }
      if (minimum !== undefined && number < minimum) return `La valeur minimale est ${minimum}.`;
      if (maximum !== undefined && number > maximum) return `La valeur maximale est ${maximum}.`;
    }
    return null;
  }

  function invalidQuestions(questions: Question[]) {
    return visibleQuestions(questions).filter((question) => questionError(question) !== null);
  }

  function focusQuestion(key: string) {
    window.setTimeout(() => {
      document.getElementById(`question-${key}`)?.focus();
    }, 0);
  }

  function showQuestionErrors(questions: Question[]) {
    const errors = Object.fromEntries(
      visibleQuestions(questions)
        .map((question) => [question.key, questionError(question)] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
    );
    setFieldErrors((current) => ({ ...current, ...errors }));
    const firstKey = Object.keys(errors)[0];
    if (firstKey) focusQuestion(firstKey);
    return errors;
  }

  function applyServerFieldErrors(fields: Record<string, string[]>) {
    const mappedErrors: Record<string, string> = {};
    for (const [path, messages] of Object.entries(fields)) {
      const key = path.startsWith('answers.')
        ? path.slice('answers.'.length)
        : path === 'contactName'
          ? 'representative'
          : path === 'consent'
            ? 'consent'
            : path === 'guardianConsent'
              ? 'guardianConsent'
              : path === 'contactPhone' || path === 'contactEmail' || path === 'city'
                ? path
                : path;
      const message = messages[0]?.replace(/^[^:]+:\s*/, '');
      if (message) mappedErrors[key] = message;
    }
    if (!Object.keys(mappedErrors).length) return false;

    setFieldErrors((current) => ({ ...current, ...mappedErrors }));
    const firstKey = Object.keys(mappedErrors)[0];
    const matchingStep = questionnaire?.steps.findIndex((questions) =>
      questions.some((question) => question.key === firstKey),
    );
    const targetStep = matchingStep !== undefined && matchingStep >= 0 ? matchingStep : 4;
    setStep(targetStep);
    focusQuestion(firstKey);
    return true;
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const activeQuestionKeys = new Set(
        activeQuestionnaire?.steps.flat().map((question) => question.key) ?? [],
      );
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
              ([key]) => activeQuestionKeys.has(key),
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
      if (error instanceof ApiError && error.fields && applyServerFieldErrors(error.fields)) {
        onNotice(
          'Votre demande n’a pas été envoyée. Corrigez les champs indiqués, puis réessayez.',
          'error',
        );
        return;
      }
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
      showQuestionErrors(currentQuestions);
      onNotice('Corrigez les champs signalés sous les questions pour continuer.', 'error');
      return;
    }
    setFieldErrors({});
    onNotice('');
    setStep((current) => Math.min(current + 1, 4));
  }

  function submitIfValid() {
    if (!activeQuestionnaire) {
      onNotice('Le questionnaire n’est pas encore prêt. Réessayez dans quelques instants.', 'info');
      return;
    }
    const errors = showQuestionErrors(currentQuestions);
    if (answers.consent !== 'yes')
      errors.consent = 'Votre accord est nécessaire pour envoyer la demande.';
    if (isMinor && answers.guardianConsent !== 'yes') {
      errors.guardianConsent = 'L’accord du parent ou responsable légal est nécessaire.';
    }
    if (Object.keys(errors).length) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      const firstKey = Object.keys(errors)[0];
      if (firstKey) focusQuestion(firstKey);
      onNotice('Corrigez les champs signalés sous les questions avant l’envoi.', 'error');
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
    fieldErrors,
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
