import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import { API, type Answers, type Question, type Service } from '../../shared/site-content.js';
import { getQuestionnaireSteps } from './questionnaire-steps.js';

type Props = { initialSituation: string; onNotice: (message: string) => void };

const stageTitles = [
  'Faisons connaissance',
  'Votre point de départ',
  'Précisons votre accompagnement',
  'Vos attentes et vos objectifs',
  'Comment cheminer ensemble ?',
];

export default function QuestionnaireSection({ initialSituation, onNotice }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialSituation) return;
    setAnswers((current) => ({ ...current, situation: initialSituation }));
    setStep(0);
  }, [initialSituation]);

  const situation = String(answers.situation ?? '');
  const service: Service = situation.startsWith('Être accompagné')
    ? 'YAA PLAYER'
    : situation.startsWith('Préserver')
      ? 'YAA AUTONOMIE'
      : 'YAA COACHING';
  const isMinor = answers.age === 'Moins de 18 ans';
  const stages = useMemo(() => getQuestionnaireSteps(service), [service]);
  const currentQuestions = stages[step] ?? [];

  function update(key: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function visibleQuestions(questions: Question[]) {
    return questions.filter((question) => {
      if (question.key === 'representative' && isMinor) return true;
      return !question.condition || answers[question.condition[0]] !== question.condition[1];
    });
  }

  function questionIsRequired(question: Question) {
    return question.required || (question.key === 'representative' && isMinor);
  }

  function stageValid() {
    return visibleQuestions(currentQuestions)
      .filter(questionIsRequired)
      .every((question) => {
        const answer = answers[question.key];
        return Array.isArray(answer) ? answer.length > 0 : String(answer ?? '').trim().length > 0;
      });
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch(`${API}/api/submissions/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          city: answers.city || 'À préciser',
          contactName: answers.representative || answers.firstName,
          contactEmail: answers.contactEmail,
          contactPhone: answers.contactPhone || '',
          answers: Object.fromEntries(Object.entries(answers).filter(([key]) => key !== 'consent' && key !== 'guardianConsent')),
          consent: true,
          ...(isMinor ? { guardianConsent: true } : {}),
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        onNotice(body.error ?? 'Une erreur empêche l’envoi. Vérifiez vos réponses puis réessayez.');
        return;
      }

      onNotice('Merci. Votre demande a bien été transmise. Le coach pourra vous recontacter prochainement.');
      setAnswers({});
      setStep(0);
    } catch {
      onNotice('Le service est momentanément indisponible. Vos réponses sont conservées, réessayez dans quelques instants.');
    } finally {
      setSubmitting(false);
    }
  }

  function field(question: Question) {
    const value = answers[question.key] ?? '';
    const id = `question-${question.key}`;
    const label = <span>{question.label}{questionIsRequired(question) && <b> *</b>}</span>;

    if (question.type === 'multi') {
      return (
        <div key={question.key} className="field">
          <span id={`${id}-label`}>{label}</span>
          <div className="choice-list" role="group" aria-labelledby={`${id}-label`}>
            {question.options?.map((option) => {
              const selected = Array.isArray(value) && value.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  className={`choice ${selected ? 'selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => {
                    const selectedOptions = Array.isArray(value) ? value : [];
                    if (selected) update(question.key, selectedOptions.filter((item) => item !== option));
                    else if (selectedOptions.length < (question.max ?? 99)) update(question.key, [...selectedOptions, option]);
                  }}
                >
                  <span className="choice-check">{selected && <Check size={12} />}</span>{option}
                </button>
              );
            })}
            <small>{Array.isArray(value) ? value.length : 0}/{question.max} sélection(s)</small>
          </div>
        </div>
      );
    }

    return (
      <label key={question.key} className={`field ${question.type === 'textarea' ? 'field-wide' : ''}`} htmlFor={id}>
        {label}
        {question.type === 'textarea' ? (
          <textarea id={id} value={String(value)} onChange={(event) => update(question.key, event.target.value)} rows={3} placeholder="Votre réponse..." />
        ) : question.type === 'select' ? (
          <select id={id} value={String(value)} onChange={(event) => update(question.key, event.target.value)}>
            <option value="">Choisissez une réponse</option>
            {question.options?.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ) : (
          <input
            id={id}
            type={question.type === 'email' ? 'email' : question.type === 'tel' ? 'tel' : 'text'}
            value={String(value)}
            onChange={(event) => update(question.key, event.target.value)}
            placeholder={question.type === 'email' ? 'vous@exemple.fr' : ''}
          />
        )}
      </label>
    );
  }

  function continueToNextStep() {
    if (!stageValid()) {
      onNotice('Complétez les champs obligatoires pour continuer.');
      return;
    }
    onNotice('');
    setStep((current) => Math.min(current + 1, 4));
  }

  function submitIfValid() {
    if (!stageValid() || answers.consent !== 'yes' || (isMinor && answers.guardianConsent !== 'yes')) {
      onNotice(isMinor
        ? 'Vérifiez les champs obligatoires, votre consentement et celui du parent ou responsable légal.'
        : 'Vérifiez les champs obligatoires et votre consentement.');
      return;
    }
    onNotice('');
    void submit();
  }

  return (
    <section className="questionnaire-section section-pad" id="questionnaire">
      <div className="questionnaire-heading">
        <div><p className="eyebrow">YAA COACHING · ACCOMPAGNEMENT PHYSIQUE & MENTAL</p><h2>Mon entretien<br /><em>découverte.</em></h2></div>
        <div><p className="eyebrow">UN PREMIER ÉCHANGE</p><p>Vos besoins physiques et mentaux, vos envies, vos difficultés et votre rythme : construisons un point de départ qui vous ressemble.</p><p>Les modalités et le tarif sont abordés lors de cet échange. Évitez de transmettre des informations médicales.</p></div>
      </div>
      <div className="questionnaire-layout">
        <aside className="questionnaire-side">
          <div className="side-number">0{step + 1}<span>/05</span></div>
          <div className="progress-track" role="progressbar" aria-label="Progression du questionnaire" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}><i style={{ width: `${(step + 1) * 20}%` }} /></div>
          <p className="eyebrow">ÉTAPE {step + 1} SUR 5</p><h3>{stageTitles[step]}</h3>
          <p>Un questionnaire pour préparer un échange qui part de vous. Prenez le temps qui vous convient.</p>
          <div className="privacy-note"><ShieldCheck size={17} /><span>Vos réponses sont transmises de façon sécurisée et consultées uniquement par l’équipe habilitée.</span></div>
        </aside>
        <div className="questionnaire-form">
          <div className="form-topline"><span>QUESTIONNAIRE YAA COACHING</span><span>LES CHAMPS AVEC * SONT NÉCESSAIRES</span></div>
          {step === 2 && <div className="branch-note"><b>{service} · {service === 'YAA PLAYER' ? 'Faisons le point sur ton football' : service === 'YAA AUTONOMIE' ? 'Votre autonomie au quotidien' : 'Un accompagnement à votre rythme'}</b><p>{service === 'YAA PLAYER' ? 'Ce n’est pas un examen : décris ce que tu ressens et donne des exemples vécus. Tu peux répondre « je ne sais pas encore ».' : service === 'YAA AUTONOMIE' ? 'Nous prenons en compte les souhaits de la personne et son entourage.' : 'Vous n’avez pas à choisir seul : vos réponses préciseront la direction lors de notre échange.'}</p></div>}
          {step === 4 && <div className="branch-note"><b>{service} · {service === 'YAA PLAYER' ? 'Sans limite géographique' : 'Vierzon et alentours'}</b><p>Pour une personne mineure, le formulaire doit être rempli par son parent ou responsable légal. Les réponses ne seront pas partagées par e-mail sans votre accord.</p></div>}
          <div className="fields-grid">
            {visibleQuestions(currentQuestions).map(field)}
            {step === 4 && <>
              <label className="consent-row"><input type="checkbox" checked={answers.consent === 'yes'} onChange={(event) => update('consent', event.target.checked ? 'yes' : '')} /><span>J’accepte que mes réponses soient transmises au coach pour être recontacté·e au sujet de cette demande. <b>*</b></span></label>
              {isMinor && <label className="consent-row guardian-consent"><input type="checkbox" checked={answers.guardianConsent === 'yes'} onChange={(event) => update('guardianConsent', event.target.checked ? 'yes' : '')} /><span>En tant que parent ou responsable légal, j’autorise l’envoi de cette demande concernant une personne mineure. <b>*</b></span></label>}
            </>}
          </div>
          <div className="form-actions">
            <button className="button button-light" disabled={step === 0 || submitting} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft size={15} /> Précédent</button>
            <span>0{step + 1} <i /> 05</span>
            {step < 4
              ? <button className="button button-dark" onClick={continueToNextStep}>Continuer <ArrowRight size={15} /></button>
              : <button className="button button-dark" disabled={submitting} onClick={submitIfValid}>{submitting ? 'Envoi en cours…' : 'Envoyer ma demande'} {!submitting && <ArrowUpRight size={15} />}</button>}
          </div>
          <p className="form-footnote">Évitez les informations médicales. Vos données sont utilisées uniquement pour répondre à votre demande.</p>
        </div>
      </div>
    </section>
  );
}
