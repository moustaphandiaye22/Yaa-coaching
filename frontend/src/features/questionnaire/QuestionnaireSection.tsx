import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { Question } from '../../shared/site-content.js';
import { useQuestionnaireFlow } from './useQuestionnaireFlow.js';

type Props = {
  initialSituation: string;
  initialService: string;
  onNotice: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export default function QuestionnaireSection({
  initialSituation,
  initialService,
  onNotice,
}: Props) {
  const {
    step,
    setStep,
    answers,
    fieldErrors,
    submitting,
    questionnaireError,
    reloadQuestionnaire,
    service,
    isMinor,
    activeQuestionnaire,
    currentQuestions,
    titles,
    questionnaireTitle,
    questionnaireIntroduction,
    questionnaireNotices,
    update,
    visibleQuestions,
    questionIsRequired,
    continueToNextStep,
    submitIfValid,
  } = useQuestionnaireFlow(initialSituation, initialService, onNotice);
  const isPlayer = service === 'YAA PLAYER';
  const isAutonomy = service === 'YAA AUTONOMIE';
  const formEyebrow = isPlayer
    ? 'YAA PLAYER · BILAN DÉCOUVERTE DU JOUEUR'
    : isAutonomy
      ? 'YAA AUTONOMIE · BILAN DÉCOUVERTE À DOMICILE'
      : 'YAA COACHING · BILAN DÉCOUVERTE';
  const formPrompt = isPlayer
    ? 'Parle-nous de ton football, de tes objectifs et de ce qui compte pour toi. Le bilan est gratuit et sans engagement.'
    : isAutonomy
      ? 'Parlons des envies et des besoins de la personne, avec son accord. Le bilan est gratuit et sans engagement.'
      : 'Vos besoins physiques et mentaux, vos envies, vos difficultés et votre rythme : préparons un échange qui vous ressemble.';
  const progressPrompt = isPlayer
    ? 'Réponds avec tes mots. Il n’y a pas de bonne ou de mauvaise réponse.'
    : isAutonomy
      ? 'La personne peut répondre elle-même ou avec l’aide d’un proche de confiance.'
      : 'Prenez le temps qui vous convient. Vos réponses prépareront le premier échange.';

  function field(question: Question) {
    const value = answers[question.key] ?? '';
    const id = `question-${question.key}`;
    const error = fieldErrors[question.key];
    const isNumber = question.key === 'age' || question.type === 'number';
    const type = question.key === 'age' ? 'number' : question.type;
    const minLength = ['firstName', 'representative', 'city'].includes(question.key)
      ? 2
      : undefined;
    const maxLength =
      question.key === 'contactEmail'
        ? 254
        : question.key === 'contactPhone'
          ? 40
          : ['firstName', 'representative', 'city'].includes(question.key)
            ? 100
            : 5000;
    const label = (
      <span>
        {question.label}
        {questionIsRequired(question) && <b> *</b>}
      </span>
    );

    if (type === 'multi') {
      return (
        <div key={question.key} className={`field field-wide ${error ? 'has-error' : ''}`}>
          <span id={`${id}-label`}>{label}</span>
          <div
            className="choice-list"
            id={id}
            role="group"
            aria-labelledby={`${id}-label`}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={error ? true : undefined}
            aria-required={questionIsRequired(question)}
            tabIndex={-1}
          >
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
                    if (selected)
                      update(
                        question.key,
                        selectedOptions.filter((item) => item !== option),
                      );
                    else if (selectedOptions.length < (question.max ?? 99))
                      update(question.key, [...selectedOptions, option]);
                  }}
                >
                  <span className="choice-check">{selected && <Check size={12} />}</span>
                  {option}
                </button>
              );
            })}
            <small>
              {Array.isArray(value) ? value.length : 0}/{question.max} sélection(s)
            </small>
          </div>
          {error && (
            <small className="questionnaire-field-error" id={`${id}-error`} role="alert">
              {error}
            </small>
          )}
        </div>
      );
    }

    return (
      <label
        key={question.key}
        className={`field ${type === 'textarea' ? 'field-wide' : ''} ${error ? 'has-error' : ''}`}
        htmlFor={id}
      >
        {label}
        {type === 'textarea' ? (
          <textarea
            id={id}
            value={String(value)}
            required={questionIsRequired(question)}
            minLength={minLength}
            maxLength={maxLength}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => update(question.key, event.target.value)}
            rows={3}
            placeholder="Votre réponse..."
          />
        ) : type === 'select' ? (
          <select
            id={id}
            value={String(value)}
            required={questionIsRequired(question)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => update(question.key, event.target.value)}
          >
            <option value="">Choisissez une réponse</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={
              question.type === 'email'
                ? 'email'
                : question.type === 'tel'
                  ? 'tel'
                  : isNumber
                    ? 'number'
                    : 'text'
            }
            min={isNumber ? (question.min ?? (question.key === 'age' ? 1 : undefined)) : undefined}
            max={
              isNumber
                ? (question.maxValue ?? (question.key === 'age' ? 120 : undefined))
                : undefined
            }
            step={
              isNumber ? (question.step ?? (question.key === 'age' ? 1 : undefined)) : undefined
            }
            inputMode={isNumber ? 'numeric' : undefined}
            value={String(value)}
            required={questionIsRequired(question)}
            minLength={minLength}
            maxLength={isNumber ? undefined : maxLength}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => update(question.key, event.target.value)}
            placeholder={question.type === 'email' ? 'vous@exemple.fr' : ''}
          />
        )}
        {error && (
          <small className="questionnaire-field-error" id={`${id}-error`} role="alert">
            {error}
          </small>
        )}
      </label>
    );
  }

  return (
    <section className="questionnaire-section section-pad" id="questionnaire">
      <div className="questionnaire-heading">
        <div>
          <p className="eyebrow">{formEyebrow}</p>
          <h1>{questionnaireTitle}</h1>
        </div>
        <div>
          <p className="eyebrow">UN PREMIER ÉCHANGE</p>
          <p>{questionnaireIntroduction || formPrompt}</p>
          {questionnaireNotices.map((notice) => (
            <p key={notice}>{notice}</p>
          ))}
        </div>
      </div>
      <div className="questionnaire-layout">
        <aside className="questionnaire-side">
          <div className="side-number">
            0{step + 1}
            <span>/05</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Progression du questionnaire"
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={step + 1}
          >
            <i style={{ width: `${(step + 1) * 20}%` }} />
          </div>
          <p className="eyebrow">ÉTAPE {step + 1} SUR 5</p>
          <h3>{titles[step] ?? 'Questionnaire de découverte'}</h3>
          <p>
            {progressPrompt}
          </p>
          <div className="privacy-note">
            <ShieldCheck size={17} />
            <span>
              Vos réponses sont transmises de façon sécurisée et consultées uniquement par l’équipe
              habilitée.
            </span>
          </div>
        </aside>
        <div className="questionnaire-form">
          <div className="form-topline">
            <span>QUESTIONNAIRE {service}</span>
            <span>LES CHAMPS AVEC * SONT NÉCESSAIRES</span>
          </div>
          {step === 2 && (
            <div className="branch-note">
              <b>
                {service} ·{' '}
                {service === 'YAA PLAYER'
                  ? 'Faisons le point sur ton football'
                  : service === 'YAA AUTONOMIE'
                    ? 'Votre autonomie au quotidien'
                    : 'Un accompagnement à votre rythme'}
              </b>
              <p>
                {service === 'YAA PLAYER'
                  ? 'Ce n’est pas un examen : décris ce que tu ressens et donne des exemples vécus. Tu peux répondre « je ne sais pas encore ».'
                  : service === 'YAA AUTONOMIE'
                    ? 'Nous prenons en compte les souhaits de la personne et son entourage.'
                    : 'Vous n’avez pas à choisir seul : vos réponses préciseront la direction lors de notre échange.'}
              </p>
            </div>
          )}
          {step === 4 && (
            <div className="branch-note">
              <b>
                {service} ·{' '}
                {service === 'YAA PLAYER' ? 'Sans limite géographique' : 'Vierzon et alentours'}
              </b>
              <p>
                {isPlayer
                  ? 'Pour un joueur mineur, le formulaire doit être rempli par son parent ou responsable légal. Le joueur reste au centre de son projet.'
                  : isAutonomy
                    ? 'Un proche peut remplir cette demande, avec l’accord de la personne concernée. Les échanges avec la famille sont définis avec elle.'
                    : 'Pour une personne mineure, le formulaire doit être rempli par son parent ou responsable légal. Vos réponses ne seront pas partagées par e-mail sans votre accord.'}
              </p>
            </div>
          )}
          <div className="fields-grid">
            {!activeQuestionnaire && (
              <div className="questionnaire-load-error field-wide" role="alert">
                {questionnaireError ? (
                  <>
                    <AlertCircle size={19} aria-hidden="true" />
                    <p>
                      Impossible de charger les questions pour le moment. Réessayez dans un instant.
                    </p>
                    <button
                      type="button"
                      className="button button-outline"
                      onClick={reloadQuestionnaire}
                    >
                      Réessayer <RefreshCw size={15} aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <RefreshCw size={19} aria-hidden="true" />
                    <p>Chargement des questions…</p>
                  </>
                )}
              </div>
            )}
            {visibleQuestions(currentQuestions).map(field)}
            {step === 4 && (
              <>
                <div className="consent-field field-wide">
                  <label className="consent-row" htmlFor="question-consent">
                    <input
                      id="question-consent"
                      type="checkbox"
                      checked={answers.consent === 'yes'}
                      aria-invalid={fieldErrors.consent ? true : undefined}
                      aria-describedby={fieldErrors.consent ? 'question-consent-error' : undefined}
                      onChange={(event) => update('consent', event.target.checked ? 'yes' : '')}
                    />
                    <span>
                      J’accepte que mes réponses soient transmises au coach pour être recontacté·e
                      au sujet de cette demande. <b>*</b>
                    </span>
                  </label>
                  {fieldErrors.consent && (
                    <small
                      className="questionnaire-field-error"
                      id="question-consent-error"
                      role="alert"
                    >
                      {fieldErrors.consent}
                    </small>
                  )}
                </div>
                {isMinor && (
                  <div className="consent-field field-wide">
                    <label
                      className="consent-row guardian-consent"
                      htmlFor="question-guardianConsent"
                    >
                      <input
                        id="question-guardianConsent"
                        type="checkbox"
                        checked={answers.guardianConsent === 'yes'}
                        aria-invalid={fieldErrors.guardianConsent ? true : undefined}
                        aria-describedby={
                          fieldErrors.guardianConsent ? 'question-guardianConsent-error' : undefined
                        }
                        onChange={(event) =>
                          update('guardianConsent', event.target.checked ? 'yes' : '')
                        }
                      />
                      <span>
                        En tant que parent ou responsable légal, j’autorise l’envoi de cette demande
                        concernant une personne mineure. <b>*</b>
                      </span>
                    </label>
                    {fieldErrors.guardianConsent && (
                      <small
                        className="questionnaire-field-error"
                        id="question-guardianConsent-error"
                        role="alert"
                      >
                        {fieldErrors.guardianConsent}
                      </small>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="form-actions">
            <button
              className="button button-light"
              disabled={step === 0 || submitting}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              <ArrowLeft size={15} /> Précédent
            </button>
            <span>
              0{step + 1} <i /> 05
            </span>
            {step < 4 ? (
              <button className="button button-dark" onClick={continueToNextStep}>
                Continuer <ArrowRight size={15} />
              </button>
            ) : (
              <button className="button button-dark" disabled={submitting} onClick={submitIfValid}>
                {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}{' '}
                {!submitting && <ArrowUpRight size={15} />}
              </button>
            )}
          </div>
          <p className="form-footnote">
            Évitez les informations médicales. Vos données sont utilisées uniquement pour répondre à
            votre demande.
          </p>
        </div>
      </div>
    </section>
  );
}
