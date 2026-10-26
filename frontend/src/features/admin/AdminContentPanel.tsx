import { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  History,
  ImagePlus,
  Plus,
  Pencil,
  Save,
  Send,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { requestJson, type AdminApi } from '../../shared/api-client.js';
import { mediaUrl } from '../../shared/site-content.js';
import { funnelLinks } from '../../shared/funnel-links.js';
import { defaultSocialLinks, safeSocialUrl } from '../../shared/social-links.js';
import { defaultCoachJourney, defaultCoachQualifications } from '../../shared/coach-journey.js';
import AdminListToolbar from './AdminListToolbar.js';
import { matchesAdminSearch } from './admin-list-utils.js';

type ContentRecord = Record<string, unknown>;
type ContentBlock = {
  key: string;
  content: ContentRecord;
  publishedContent: ContentRecord | null;
  revision: number;
  publishedAt: string | null;
  updatedAt: string;
};
type Revision = {
  id: string;
  revision: number;
  content: ContentRecord;
  createdAt: string;
  actor?: { email: string } | null;
};
type Props = {
  api: AdminApi;
  contentKey: string;
  serviceIndex?: number;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

const starterHero = {
  eyebrow: 'COACHING · FOOTBALL · AUTONOMIE',
  title: 'Accompagnement physique & mental.',
  accent: 'À votre rythme.',
  description:
    'Accompagner, c’est cheminer à vos côtés en tenant compte de vos besoins. Que vous soyez sportif ou non, commencez à vous stimuler ou reprenez une activité adaptée à vos capacités, à vos besoins et à votre rythme.',
  location: 'YAA COACHING à Vierzon et alentours ; YAA PLAYER sans limite géographique.',
  buttonLabel: 'Trouver mon accompagnement',
};
const contentBlockLabels: Record<string, string> = {
  hero: 'Accueil',
  services: 'Accompagnements',
  methode: 'Méthode',
  player: 'YAA Player',
  coach: 'Votre coach',
  zones: 'Zones d’intervention',
  contacts: 'Coordonnées',
  closing: 'Conclusion',
  questionnaires: 'Questionnaires',
  method: 'Méthode',
  pillars: 'Axes de travail',
  steps: 'Étapes',
  experiences: 'Expériences',
  journey: 'Parcours de terrain',
  qualifications: 'Qualifications et parcours football',
  photo: 'Photo',
  footer: 'Pied de page',
  contact: 'Contact',
  service: 'Accompagnement',
  media: 'Média',
};
const fieldLabels: Record<string, string> = {
  eyebrow: 'Accroche',
  title: 'Titre',
  accent: 'Titre mis en valeur',
  introduction: 'Introduction',
  description: 'Présentation',
  body: 'Texte',
  location: 'Zone d’intervention',
  buttonLabel: 'Texte du bouton',
  methodTitle: 'Titre de la méthode',
  methodAccent: 'Titre mis en valeur',
  methodEyebrow: 'Accroche de la méthode',
  methodDescription: 'Présentation de la méthode',
  pillarsTitle: 'Titre des axes',
  pillarsAccent: 'Titre mis en valeur',
  pillarsEyebrow: 'Accroche des axes',
  pillarsIntroduction: 'Introduction des axes',
  photoSeal: 'Signature de la photo',
  photoCaption: 'Légende de la photo',
  photoLocation: 'Lieu de la photo',
  callToAction: 'Texte du bouton',
  audience: 'Public concerné',
  serviceLabel: 'Nom de l’accompagnement',
  mediaLabel: 'Mention du média',
  questionnaireSituation: 'Situation du questionnaire',
  contactLabel: 'Texte du contact',
  contactEmail: 'E-mail de contact',
  email: 'Adresse e-mail',
  phone: 'Téléphone',
  phoneLink: 'Lien téléphonique',
  footerCoaching: 'Texte du pied de page · Coaching',
  footerPlayer: 'Texte du pied de page · Player',
  instagramUrl: 'Compte Instagram',
  tiktokUrl: 'Compte TikTok',
  facebookUrl: 'Compte Facebook',
  linkedinUrl: 'Compte LinkedIn',
  whatsappUrl: 'Contact WhatsApp',
  name: 'Nom',
  slug: 'Identifiant URL',
  type: 'Catégorie',
  zone: 'Zone',
  presentation: 'Présentation de l’accompagnement',
  offerHighlight: 'Tarif mis en valeur',
  offerDetails: 'Tarifs et modalités',
  image: 'Image',
  alt: 'Texte alternatif',
  link: 'Lien',
  label: 'Libellé',
  key: 'Identifiant',
  required: 'Obligatoire',
  number: 'Numéro',
  version: 'Version du questionnaire',
  min: 'Valeur minimale',
  maxValue: 'Valeur maximale',
  step: 'Incrément',
  options: 'Choix proposés',
  max: 'Nombre maximal de choix',
  condition: 'Condition d’affichage',
  equals: 'Afficher si la réponse vaut',
  notEquals: 'Masquer si la réponse vaut',
  notices: 'Informations à afficher',
  questions: 'Questions',
  steps: 'Étapes',
  items: 'Éléments',
  paragraphs: 'Paragraphes',
  tags: 'Thèmes',
  pillars: 'Axes de travail',
  experiences: 'Expériences',
  questionnaireSituations: 'Situations proposées',
};

function isRecord(value: unknown): value is ContentRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function updateValue(source: unknown, path: (string | number)[], value: unknown): unknown {
  const [key, ...remaining] = path;
  if (key === undefined) return value;
  if (Array.isArray(source)) {
    const result = [...source];
    const index = Number(key);
    result[index] = remaining.length ? updateValue(source[index], remaining, value) : value;
    return result;
  }
  const record = isRecord(source) ? source : {};
  return {
    ...record,
    [key]: remaining.length ? updateValue(record[key], remaining, value) : value,
  };
}

function pathLabel(path: (string | number)[]) {
  const key = path.filter((part): part is string => typeof part === 'string').at(-1) ?? '';
  return (
    fieldLabels[key] ??
    (/^[A-Z0-9][A-Z0-9 _&-]*$/.test(key)
      ? key
      : key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toLocaleUpperCase('fr-FR')))
  );
}

function contentMatchesSearch(value: unknown, path: (string | number)[], query: string): boolean {
  if (!query.trim() || matchesAdminSearch(query, pathLabel(path))) return true;
  if (Array.isArray(value))
    return value.some((item, index) => contentMatchesSearch(item, [...path, index], query));
  if (isRecord(value))
    return Object.entries(value).some(([key, child]) =>
      contentMatchesSearch(child, [...path, key], query),
    );
  return matchesAdminSearch(query, value);
}

function emptyItem(value: unknown, key: string): unknown {
  if (value !== undefined) {
    if (typeof value === 'string') return '';
    if (typeof value === 'number') return 0;
    if (typeof value === 'boolean') return false;
    if (Array.isArray(value)) return [];
    if (isRecord(value))
      return Object.fromEntries(
        Object.keys(value).map((field) => [field, emptyItem(value[field], field)]),
      );
  }
  if (['items', 'steps', 'questions', 'pillars', 'experiences', 'services'].includes(key))
    return {};
  return '';
}

function AdminServiceSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <details
      className="admin-content-service-section"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span>
          <small>ACCOMPAGNEMENT {String(index + 1).padStart(2, '0')}</small>
          <strong>{title}</strong>
        </span>
        <ChevronDown size={19} aria-hidden="true" />
      </summary>
      <div className="admin-content-service-body">{children}</div>
    </details>
  );
}

function AdminQuestionnaireSection({
  index,
  title,
  kind,
  children,
}: {
  index: number;
  title: string;
  kind: 'step' | 'question';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <details
      className={`admin-content-questionnaire-section admin-content-questionnaire-section--${kind}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span className="admin-content-questionnaire-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <strong>{title || `${kind === 'step' ? 'Étape' : 'Question'} ${index + 1}`}</strong>
        <ChevronDown size={18} aria-hidden="true" />
      </summary>
      <div className="admin-content-questionnaire-section-body">{children}</div>
    </details>
  );
}

function ContentImageField({
  value,
  path,
  disabled,
  onUploadingChange,
  onChange,
}: {
  value: string;
  path: (string | number)[];
  disabled: boolean;
  onUploadingChange: (uploading: boolean) => void;
  onChange: (path: (string | number)[], next: unknown) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fallbackImages: Record<string, string> = {
    'coaching.jpg': '/images/coaching.webp',
    'player.jpg': '/images/player.webp',
    'autonomie.jpg': '/images/autonomie.webp',
  };
  const previewPath = fallbackImages[value] ?? value;

  async function uploadImage() {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choisissez une image JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La taille maximale autorisée est de 10 Mo.');
      return;
    }

    setUploading(true);
    onUploadingChange(true);
    setError('');
    try {
      const uploaded = await requestJson<{ url: string }>('/api/admin/media/upload?kind=PHOTO', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      onChange(path, uploaded.url);
      setFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Le téléversement a échoué.');
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  }

  return (
    <div className="field field-wide admin-content-image-field">
      <span>{pathLabel(path)}</span>
      <div className="admin-content-image-control">
        {value ? (
          <img
            src={mediaUrl(
              previewPath.startsWith('/') || /^https?:\/\//i.test(previewPath)
                ? previewPath
                : `/media/${previewPath}`,
            )}
            alt="Aperçu de l’image enregistrée"
          />
        ) : (
          <span className="admin-content-image-empty">
            <ImagePlus size={18} aria-hidden="true" /> Aucune image téléversée
          </span>
        )}
        <div className="admin-content-image-actions">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choisir une image JPEG, PNG ou WebP"
            disabled={disabled || uploading}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError('');
            }}
          />
          <button
            className="button button-light"
            type="button"
            disabled={disabled || uploading || !file}
            onClick={() => void uploadImage()}
          >
            <Upload size={15} aria-hidden="true" />
            {uploading ? 'Téléversement…' : 'Téléverser l’image'}
          </button>
        </div>
      </div>
      {value && !file && !uploading && (
        <small className="admin-content-image-hint">
          Image téléversée. Enregistrez le contenu pour appliquer la modification.
        </small>
      )}
      {error && (
        <small className="admin-content-image-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

function ContentValueEditor({
  value,
  path,
  query,
  disabled,
  onUploadingChange,
  questionnaireEditor,
  funnelHref,
  onChange,
}: {
  value: unknown;
  path: (string | number)[];
  query: string;
  disabled: boolean;
  onUploadingChange: (uploading: boolean) => void;
  questionnaireEditor: boolean;
  funnelHref: string;
  onChange: (path: (string | number)[], next: unknown) => void;
}): ReactNode {
  const key = String(path[path.length - 1] ?? '');
  if (Array.isArray(value)) {
    const visibleItems = value
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) => contentMatchesSearch(item, [...path, index], query));
    const expandableServices = key === 'services' && path.length === 1;
    const expandableQuestionnaireItems =
      questionnaireEditor && ['steps', 'questions'].includes(key);
    return (
      <fieldset
        className={`admin-content-collection ${questionnaireEditor ? 'admin-content-questionnaire-collection' : ''}`}
      >
        <legend>
          {pathLabel(path)} <small>{value.length}</small>
        </legend>
        <div
          className={`admin-content-collection-list ${expandableServices ? 'admin-content-collection-list--services' : ''} ${path.length > 1 ? 'admin-content-collection-list--nested' : ''} ${questionnaireEditor ? 'admin-content-questionnaire-collection-list' : ''} ${questionnaireEditor && key === 'questions' ? 'admin-content-questionnaire-collection-list--questions' : ''}`}
        >
          {visibleItems.map(({ item, index }) =>
            (() => {
              const itemTitle =
                isRecord(item) && typeof item.title === 'string' && item.title
                  ? item.title
                  : isRecord(item) && typeof item.label === 'string' && item.label
                    ? item.label
                    : isRecord(item) && typeof item.name === 'string' && item.name
                      ? item.name
                      : `${pathLabel(path)} · ${index + 1}`;
              const contents = (
                <>
                  <ContentValueEditor
                    value={item}
                    path={[...path, index]}
                    query={query}
                    disabled={disabled}
                    onUploadingChange={onUploadingChange}
                    questionnaireEditor={questionnaireEditor}
                    funnelHref={funnelHref}
                    onChange={onChange}
                  />
                  <button
                    className="admin-content-remove"
                    type="button"
                    aria-label={`Supprimer ${itemTitle}`}
                    disabled={disabled}
                    onClick={() =>
                      onChange(
                        path,
                        value.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 size={15} aria-hidden="true" /> Supprimer
                  </button>
                </>
              );

              return expandableQuestionnaireItems ? (
                <AdminQuestionnaireSection
                  key={`${path.join('.')}-${index}`}
                  index={index}
                  kind={key === 'steps' ? 'step' : 'question'}
                  title={itemTitle}
                >
                  {contents}
                </AdminQuestionnaireSection>
              ) : expandableServices ? (
                <AdminServiceSection
                  key={`${path.join('.')}-${index}`}
                  index={index}
                  title={itemTitle}
                >
                  {contents}
                </AdminServiceSection>
              ) : (
                <div
                  className={`admin-content-collection-item ${questionnaireEditor ? 'admin-content-questionnaire-collection-item' : ''} ${
                    typeof item === 'string' || typeof item === 'number'
                      ? 'admin-content-collection-item--simple'
                      : ''
                  }`}
                  key={`${path.join('.')}-${index}`}
                >
                  <strong className="admin-content-item-title">{itemTitle}</strong>
                  {contents}
                </div>
              );
            })(),
          )}
        </div>
        <button
          className="admin-content-add"
          type="button"
          disabled={disabled}
          aria-label={`Ajouter un élément à ${pathLabel(path)}`}
          onClick={() => onChange(path, [...value, emptyItem(value[0], key)])}
        >
          <Plus size={15} aria-hidden="true" /> Ajouter un élément
        </button>
      </fieldset>
    );
  }
  if (isRecord(value)) {
    const visibleEntries = Object.entries(value).filter(([childKey, childValue]) =>
      contentMatchesSearch(childValue, [...path, childKey], query),
    );
    return (
      <div
        className={`admin-content-object ${questionnaireEditor ? 'admin-content-questionnaire-object' : ''}`}
      >
        {visibleEntries.map(([childKey, childValue]) => (
          <ContentValueEditor
            key={[...path, childKey].join('.')}
            value={childValue}
            path={[...path, childKey]}
            query={query}
            disabled={disabled}
            onUploadingChange={onUploadingChange}
            questionnaireEditor={questionnaireEditor}
            funnelHref={funnelHref}
            onChange={onChange}
          />
        ))}
      </div>
    );
  }
  if (!contentMatchesSearch(value, path, query)) return null;
  if (typeof value === 'boolean') {
    return (
      <label className="admin-content-boolean">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />{' '}
        {pathLabel(path)}
      </label>
    );
  }
  const longText =
    typeof value === 'string' &&
    (value.length > 110 ||
      ['description', 'body', 'introduction', 'label', 'presentation', 'offerDetails'].includes(
        key,
      ));
  if (typeof value === 'string' && ['image', 'photo', 'imageUrl'].includes(key.toLowerCase())) {
    return (
      <ContentImageField
        value={value}
        path={path}
        disabled={disabled}
        onUploadingChange={onUploadingChange}
        onChange={onChange}
      />
    );
  }
  if (typeof value === 'string' && key === 'callToAction') {
    return (
      <div className="admin-content-action-editor field-wide">
        <label className="field">
          <span>{pathLabel(path)}</span>
          <input value={value} onChange={(event) => onChange(path, event.target.value)} />
        </label>
        <a className="button button-dark" href={funnelHref} target="_blank" rel="noreferrer">
          {value || 'Faire le premier pas'} <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    );
  }
  return (
    <label className={`field ${longText ? 'field-wide' : ''}`}>
      <span>{pathLabel(path)}</span>
      {longText ? (
        <textarea
          value={String(value ?? '')}
          onChange={(event) => onChange(path, event.target.value)}
          rows={3}
        />
      ) : (
        <input
          type={typeof value === 'number' ? 'number' : key.endsWith('Url') ? 'url' : 'text'}
          value={value === null ? '' : String(value ?? '')}
          onChange={(event) =>
            onChange(
              path,
              typeof value === 'number' ? Number(event.target.value) : event.target.value,
            )
          }
        />
      )}
    </label>
  );
}

const protectedQuestionKeys = new Set([
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

function QuestionnaireQuestionsEditor({
  value,
  serviceName,
  query,
  disabled,
  onChange,
}: {
  value: ContentRecord;
  serviceName: string;
  query: string;
  disabled: boolean;
  onChange: (next: ContentRecord) => void;
}) {
  const [editingQuestionPath, setEditingQuestionPath] = useState<string | null>(null);
  const steps = Array.isArray(value.steps) ? value.steps : [];

  function updateQuestions(stepIndex: number, questions: unknown[]) {
    const nextSteps = [...steps];
    const currentStep = isRecord(nextSteps[stepIndex]) ? nextSteps[stepIndex] : {};
    nextSteps[stepIndex] = { ...currentStep, questions };
    onChange({ ...value, questionsManaged: true, steps: nextSteps });
  }

  return (
    <div className="admin-questionnaire-manager">
      <div className="admin-questionnaire-manager-heading">
        <div>
          <span className="eyebrow">QUESTIONS DU FORMULAIRE</span>
          <h3>{serviceName}</h3>
        </div>
        <p>Les questions sont regroupées selon leur étape dans le formulaire public.</p>
      </div>
      {steps.map((stepValue, stepIndex) => {
        const step = isRecord(stepValue) ? stepValue : {};
        const questions = Array.isArray(step.questions) ? step.questions : [];
        const visibleQuestions = questions
          .map((question, questionIndex) => ({ question, questionIndex }))
          .filter(({ question, questionIndex }) =>
            contentMatchesSearch(
              question,
              ['items', serviceName, 'steps', stepIndex, 'questions', questionIndex],
              query,
            ),
          );

        return (
          <section className="admin-questionnaire-step" key={`step-${stepIndex}`}>
            <header className="admin-questionnaire-step-heading">
              <span>{String(step.number ?? stepIndex + 1).padStart(2, '0')}</span>
              <div>
                <h4>{String(step.title ?? `Étape ${stepIndex + 1}`)}</h4>
                <small>
                  {questions.length} question{questions.length > 1 ? 's' : ''}
                </small>
              </div>
            </header>
            <div className="admin-questionnaire-question-grid">
              {visibleQuestions.map(({ question: questionValue, questionIndex }) => {
                const question = isRecord(questionValue) ? questionValue : {};
                const key = String(question.key ?? `question-${questionIndex + 1}`);
                const questionPath = `items.${serviceName}.steps.${stepIndex}.questions.${questionIndex}`;
                const isEditing = editingQuestionPath === questionPath;

                function updateQuestion(field: string, nextValue: unknown) {
                  updateQuestions(
                    stepIndex,
                    questions.map((item, index) =>
                      index === questionIndex
                        ? { ...(isRecord(item) ? item : {}), [field]: nextValue }
                        : item,
                    ),
                  );
                }

                return (
                  <article
                    className={`admin-questionnaire-question ${isEditing ? 'is-editing' : ''}`}
                    key={`${key}-${questionIndex}`}
                  >
                    <div className="admin-questionnaire-question-row">
                      <div className="admin-questionnaire-question-copy">
                        {isEditing ? (
                          <label className="field">
                            <span>Question</span>
                            <textarea
                              rows={2}
                              value={String(question.label ?? '')}
                              disabled={disabled}
                              onChange={(event) => updateQuestion('label', event.target.value)}
                            />
                          </label>
                        ) : (
                          <strong>{String(question.label ?? 'Nouvelle question')}</strong>
                        )}
                      </div>
                      <div className="admin-questionnaire-question-actions">
                        <label
                          className="admin-questionnaire-required"
                          title={
                            protectedQuestionKeys.has(key)
                              ? 'Cette question est nécessaire au traitement sécurisé du formulaire.'
                              : undefined
                          }
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(question.required)}
                            disabled={disabled || protectedQuestionKeys.has(key)}
                            onChange={(event) => updateQuestion('required', event.target.checked)}
                          />
                          <span>Obligatoire</span>
                        </label>
                        <button
                          className="button button-light admin-questionnaire-edit-button"
                          type="button"
                          disabled={disabled}
                          aria-expanded={isEditing}
                          onClick={() => setEditingQuestionPath(isEditing ? null : questionPath)}
                        >
                          {isEditing ? (
                            <>
                              <Check size={15} aria-hidden="true" /> Terminer
                            </>
                          ) : (
                            <>
                              <Pencil size={15} aria-hidden="true" /> Modifier
                            </>
                          )}
                        </button>
                        <button
                          className="admin-content-remove"
                          type="button"
                          disabled={disabled || protectedQuestionKeys.has(key)}
                          title={
                            protectedQuestionKeys.has(key)
                              ? 'Cette question est nécessaire au traitement sécurisé du formulaire.'
                              : 'Supprimer cette question'
                          }
                          onClick={() =>
                            updateQuestions(
                              stepIndex,
                              questions.filter((_, index) => index !== questionIndex),
                            )
                          }
                        >
                          <Trash2 size={15} aria-hidden="true" /> Supprimer
                        </button>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="admin-questionnaire-edit-fields">
                        <p>
                          Le format de réponse et ses choix sont définis par le schéma du
                          questionnaire.
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
              {visibleQuestions.length === 0 && query.trim() && (
                <p className="admin-content-empty">Aucune question ne correspond à la recherche.</p>
              )}
            </div>
            <button
              className="admin-content-add"
              type="button"
              disabled={disabled}
              onClick={() =>
                updateQuestions(stepIndex, [
                  ...questions,
                  {
                    key: `question${Date.now()}`,
                    label: '',
                    type: 'text',
                    required: false,
                  },
                ])
              }
            >
              <Plus size={15} aria-hidden="true" /> Ajouter une question à cette étape
            </button>
          </section>
        );
      })}
    </div>
  );
}

export default function AdminContentPanel({
  api,
  contentKey,
  serviceIndex,
  onError,
  onSuccess,
}: Props) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [draft, setDraft] = useState<ContentRecord>(starterHero);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [busy, setBusy] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [search, setSearch] = useState('');
  const [questionnaireService, setQuestionnaireService] = useState('YAA COACHING');

  const selectedBlock = blocks.find((block) => block.key === contentKey);
  const questionnaireItems = isRecord(draft.items) ? draft.items : {};
  const questionnaireServiceNames = Object.keys(questionnaireItems);
  const activeQuestionnaireService = questionnaireServiceNames.includes(questionnaireService)
    ? questionnaireService
    : (questionnaireServiceNames[0] ?? '');
  const activeQuestionnaire = questionnaireItems[activeQuestionnaireService];
  const panelTitle =
    serviceIndex !== undefined && typeof draft.name === 'string'
      ? draft.name
      : (contentBlockLabels[contentKey] ?? 'Page du site');
  const visibleDraftEntries = Object.entries(draft).filter(([key, value]) => {
    if (contentKey === 'player' && key === 'questionnaireSituation') return false;
    if (
      contentKey === 'services' &&
      serviceIndex !== undefined &&
      ['questionnaireSituations', 'type'].includes(key)
    )
      return false;
    return contentMatchesSearch(value, [key], search);
  });
  const visibleQuestionnaire =
    isRecord(activeQuestionnaire) &&
    contentMatchesSearch(activeQuestionnaire, ['items', activeQuestionnaireService], search);

  const loadBlocks = useCallback(async () => {
    const result: ContentBlock[] = await api('/api/admin/content');
    setBlocks(result);
  }, [api]);

  useEffect(() => {
    loadBlocks().catch((error: unknown) =>
      onError(error instanceof Error ? error.message : 'Impossible de charger les contenus.'),
    );
  }, [loadBlocks, onError]);

  useEffect(() => {
    const block = blocks.find((item) => item.key === contentKey);
    const storedServices = block?.content.items;
    const nextDraft =
      serviceIndex !== undefined && Array.isArray(storedServices)
        ? storedServices[serviceIndex]
        : contentKey === 'contacts'
          ? { ...defaultSocialLinks, ...(block?.content ?? {}) }
          : contentKey === 'coach'
            ? {
                journey: defaultCoachJourney,
                qualifications: defaultCoachQualifications,
                ...(block?.content ?? {}),
              }
            : (block?.content ?? (contentKey === 'hero' ? starterHero : {}));
    setDraft(isRecord(nextDraft) ? nextDraft : {});
    setRevisions([]);
  }, [blocks, contentKey, serviceIndex]);

  async function save(publish: boolean) {
    if (contentKey === 'contacts') {
      const invalid = Object.keys(defaultSocialLinks).find((key) => {
        const value = draft[key];
        return typeof value === 'string' && value.trim() && !safeSocialUrl(value.trim());
      });
      if (invalid) {
        onError(
          `${fieldLabels[invalid]} : indiquez une adresse HTTPS valide ou laissez le champ vide.`,
        );
        return;
      }
    }
    setBusy(true);
    try {
      let contentToSave: ContentRecord = draft;
      if (serviceIndex !== undefined) {
        const currentServices = Array.isArray(selectedBlock?.content.items)
          ? [...(selectedBlock.content.items as unknown[])]
          : [];
        while (currentServices.length <= serviceIndex) currentServices.push({});
        currentServices[serviceIndex] = draft;
        contentToSave = { ...(selectedBlock?.content ?? {}), items: currentServices };
      }
      await api(`/api/admin/content/${encodeURIComponent(contentKey)}`, {
        method: 'PUT',
        body: JSON.stringify({ content: contentToSave, publish }),
      });
      await loadBlocks();
      onError('');
      onSuccess(
        publish ? 'Le contenu a été publié sur le site.' : 'Le brouillon a été enregistré.',
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible d’enregistrer le contenu.');
    } finally {
      setBusy(false);
    }
  }

  async function loadRevisions() {
    setHistoryLoading(true);
    try {
      const result: Revision[] = await api(
        `/api/admin/content/${encodeURIComponent(contentKey)}/revisions`,
      );
      setRevisions(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de charger l’historique.');
    } finally {
      setHistoryLoading(false);
    }
  }

  async function unpublish() {
    setBusy(true);
    try {
      await api(`/api/admin/content/${encodeURIComponent(contentKey)}/publication`, {
        method: 'DELETE',
      });
      await loadBlocks();
      onError('');
      onSuccess('La publication a été retirée du site. Le brouillon est conservé.');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de retirer la publication.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <details
      className={`admin-content-panel admin-content-card ${contentKey === 'questionnaires' ? 'admin-content-card--questionnaires' : ''}`}
      open={
        serviceIndex !== undefined ||
        contentKey === 'hero' ||
        contentKey === 'methode' ||
        contentKey === 'player'
      }
    >
      <summary className="admin-content-summary">
        <span className="admin-content-summary-copy">
          <span className="eyebrow">
            {serviceIndex === undefined ? 'CONTENU DE LA PAGE' : 'CARTE D’ACCOMPAGNEMENT'}
          </span>
          <strong>{panelTitle}</strong>
          <small>
            {serviceIndex === undefined
              ? 'Modifier les textes, les listes et les éléments affichés sur le site'
              : 'Modifier les informations affichées sur la carte de cet accompagnement'}
          </small>
        </span>
        <span className={`content-state ${selectedBlock?.publishedAt ? 'is-published' : ''}`}>
          {selectedBlock?.publishedAt ? 'Publié' : 'Brouillon'}
          {selectedBlock ? ` · Révision ${selectedBlock.revision}` : ''}
        </span>
        <span className="admin-content-summary-toggle" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <div className="admin-content-body">
        <div className="admin-content-editor">
          <AdminListToolbar
            searchLabel="Rechercher un champ"
            searchPlaceholder="Nom du champ ou texte enregistré…"
            searchValue={search}
            onSearchChange={setSearch}
            resultCount={visibleDraftEntries.length}
            resultLabel={visibleDraftEntries.length === 1 ? 'groupe' : 'groupes'}
          />
          <div
            className={`admin-content-fields admin-content-recursive-fields ${contentKey === 'questionnaires' ? 'admin-content-questionnaire-fields' : ''}`}
          >
            {contentKey === 'questionnaires' && (
              <label className="field admin-content-questionnaire-picker">
                <span>Questionnaire affiché</span>
                <select
                  value={activeQuestionnaireService}
                  onChange={(event) => setQuestionnaireService(event.target.value)}
                >
                  {questionnaireServiceNames.map((serviceName) => (
                    <option key={serviceName} value={serviceName}>
                      {serviceName}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {contentKey === 'questionnaires'
              ? visibleQuestionnaire && (
                  <QuestionnaireQuestionsEditor
                    key={activeQuestionnaireService}
                    value={activeQuestionnaire as ContentRecord}
                    serviceName={activeQuestionnaireService}
                    query={search}
                    disabled={busy}
                    onChange={(next) =>
                      setDraft(
                        (current) =>
                          updateValue(
                            current,
                            ['items', activeQuestionnaireService],
                            next,
                          ) as ContentRecord,
                      )
                    }
                  />
                )
              : visibleDraftEntries.map(([key, value]) => (
                  <ContentValueEditor
                    key={key}
                    value={value}
                    path={[key]}
                    query={search}
                    disabled={busy}
                    questionnaireEditor={contentKey === 'questionnaires'}
                    funnelHref={
                      contentKey === 'player'
                        ? funnelLinks.player
                        : contentKey === 'coach' || contentKey === 'methode'
                          ? funnelLinks.coaching
                          : funnelLinks.offers
                    }
                    onUploadingChange={(uploading) =>
                      setPendingUploads((count) => Math.max(0, count + (uploading ? 1 : -1)))
                    }
                    onChange={(path, next) =>
                      setDraft((current) => updateValue(current, path, next) as ContentRecord)
                    }
                  />
                ))}
            {contentKey === 'questionnaires' && !visibleQuestionnaire && search.trim() && (
              <p className="admin-content-empty">
                Aucun champ du questionnaire sélectionné ne correspond à votre recherche.
              </p>
            )}
            {contentKey !== 'questionnaires' &&
              visibleDraftEntries.length === 0 &&
              search.trim() && (
                <p className="admin-content-empty">Aucun champ ne correspond à votre recherche.</p>
              )}
            {contentKey === 'questionnaires' && questionnaireServiceNames.length === 0 && (
              <p className="admin-content-empty">
                Aucun questionnaire n’est enregistré pour le moment.
              </p>
            )}
            {contentKey !== 'questionnaires' && Object.keys(draft).length === 0 && (
              <p className="admin-content-empty">
                Aucun texte modifiable dans ce bloc. Les données structurées sont conservées.
              </p>
            )}
          </div>

          <div className="admin-content-actions">
            <button
              className="button button-light"
              type="button"
              onClick={loadRevisions}
              disabled={historyLoading}
            >
              <History size={14} /> {historyLoading ? 'Chargement…' : 'Historique'}
            </button>
            {selectedBlock?.publishedAt && (
              <button
                className="button button-light"
                type="button"
                onClick={unpublish}
                disabled={busy}
              >
                <Undo2 size={14} /> Dépublier
              </button>
            )}
            <button
              className="button button-light"
              type="button"
              onClick={() => save(false)}
              disabled={busy || pendingUploads > 0}
            >
              <Save size={14} />
              {pendingUploads > 0
                ? 'Téléversement en cours…'
                : busy
                  ? 'Enregistrement…'
                  : 'Enregistrer le brouillon'}
            </button>
            <button
              className="button button-dark"
              type="button"
              onClick={() => save(true)}
              disabled={busy || pendingUploads > 0}
            >
              <Send size={14} />
              {pendingUploads > 0 ? 'Téléversement en cours…' : busy ? 'Publication…' : 'Publier'}
            </button>
          </div>

          {revisions.length > 0 && (
            <div className="admin-content-result">
              <h4>Historique</h4>
              {revisions.map((revision) => (
                <article key={revision.id}>
                  <b>Révision {revision.revision}</b>
                  <span>{new Date(revision.createdAt).toLocaleString('fr-FR')}</span>
                  <small>{revision.actor?.email ?? 'Système'}</small>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
