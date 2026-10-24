import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { API } from '../../shared/site-content.js';
import type { Submission } from './admin-types.js';

type Props = {
  submission: Submission | null;
  loading: boolean;
  onBack: () => void;
  onDelete: () => Promise<boolean>;
  onUpdate: (id: string, changes: Record<string, unknown>) => Promise<void>;
};

const statuses = [
  ['NEW', 'Nouvelle'],
  ['TO_CONTACT', 'À contacter'],
  ['CONTACTED', 'Contactée'],
  ['IN_PROGRESS', 'En cours'],
  ['CLOSED', 'Clôturée'],
  ['REJECTED', 'Refusée'],
];
const statusLabels = Object.fromEntries(statuses) as Record<string, string>;

const answerLabels: Record<string, string> = {
  approach: 'Démarche',
  firstName: 'Prénom et nom de la personne accompagnée',
  representative: 'Proche ou responsable',
  age: 'Âge',
  situation: 'Situation',
  objective: 'Objectif recherché',
  goal: 'Objectif prioritaire',
  priorities: 'Priorités',
  playerPriorities: 'Priorités sportives',
  activity: 'Activité actuelle',
  activityDetails: 'Détails sur l’activité',
  activities: 'Activités souhaitées',
  helpStarting: 'Aide souhaitée pour commencer',
  difficulties: 'Difficultés rencontrées',
  coping: 'Façon de faire face aux difficultés',
  strengths: 'Forces et soutiens',
  needType: 'Type de besoin',
  expectations: 'Attentes de la personne accompagnée',
  familyExpectations: 'Attentes des proches',
  expectationsShared: 'Attentes partagées',
  expectationsSharedDetails: 'Précision sur les attentes partagées',
  success: 'Résultat attendu',
  deadline: 'Échéance envisagée',
  deadlineDetails: 'Détails de l’échéance',
  availability: 'Disponibilités',
  format: 'Format souhaité',
  constraints: 'Contraintes et adaptations',
  supportStyle: 'Accompagnement souhaité',
  otherInfo: 'Autres précisions',
  club: 'Club, catégorie et niveau',
  position: 'Poste principal',
  secondaryPosition: 'Poste secondaire',
  strongFoot: 'Pied fort',
  footballStart: 'Début du football',
  footballRhythm: 'Entraînements par semaine',
  weeklyMatches: 'Matchs par semaine',
  teamRole: 'Place dans l’équipe',
  mistakeReaction: 'Réaction après une erreur',
  pressure: 'Gestion de la pression',
  confidence: 'Confiance',
  effort: 'Efforts répétés',
  qualities: 'Qualités principales',
  progress: 'Axes de progression',
  seasonGoal: 'Objectifs sportifs',
  dailyActivities: 'Activités du quotidien',
  reassurance: 'Situations nécessitant un soutien',
  enjoy: 'Activités appréciées',
  dailyChange: 'Changement souhaité',
  surroundings: 'Entourage et soutien',
  weightLoss: 'Objectif de perte de poids',
  kilos: 'Perte de poids envisagée (kg)',
  whyGoal: 'Motivation liée à cet objectif',
  pastSupport: 'Accompagnements précédents',
  pastSupportDetails: 'Détails des accompagnements précédents',
};

const hiddenAnswers = new Set([
  'contactEmail',
  'contactPhone',
  'city',
  'consent',
  'guardianConsent',
  'website',
]);

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(' · ');
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'object')
    return Object.entries(value)
      .map(([key, entry]) => `${key} : ${displayValue(entry)}`)
      .filter(Boolean)
      .join(' · ');
  return String(value).trim();
}

function readableKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) => character.toLocaleUpperCase('fr-FR'));
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? 'Non renseignée' : date.toLocaleString('fr-FR');
}

export default function AdminSubmissionDetail({
  submission,
  loading,
  onBack,
  onDelete,
  onUpdate,
}: Props) {
  const [notes, setNotes] = useState('');

  useEffect(
    () => setNotes(submission?.internalNotes ?? ''),
    [submission?.id, submission?.internalNotes],
  );

  const answers = Object.entries(submission?.answers ?? {}).filter(
    ([key, value]) => !hiddenAnswers.has(key) && displayValue(value),
  );
  const beneficiaryName = displayValue(submission?.answers?.firstName) || submission?.contactName;
  const hasLoadedSubmission = Boolean(
    submission?.id && submission.status && submission.contactName && submission.service,
  );

  return (
    <section className="admin-submission-detail" aria-label="Dossier de demande">
      <div className="submission-detail-heading">
        <button className="button button-light" type="button" onClick={onBack}>
          <ArrowLeft size={16} /> Retour aux demandes
        </button>
        {submission && (
          <div className="submission-detail-actions">
            <a
              className="button button-dark"
              href={`${API}/api/admin/submissions/${encodeURIComponent(submission.id)}/export`}
            >
              <Download size={16} /> Télécharger la fiche PDF
            </a>
            <button
              className="button submission-delete-button"
              type="button"
              onClick={() => void onDelete().then((deleted) => deleted && onBack())}
            >
              <Trash2 size={16} /> Supprimer
            </button>
          </div>
        )}
      </div>

      {(loading || (submission && !hasLoadedSubmission)) && (
        <div className="admin-detail-loading" role="status">
          {loading
            ? 'Chargement du dossier…'
            : 'Les informations du dossier ne sont pas disponibles. Actualisez la page pour réessayer.'}
        </div>
      )}
      {!loading && !submission && (
        <div className="admin-empty" role="status">
          Cette demande est introuvable ou n’est plus disponible.
        </div>
      )}
      {submission && hasLoadedSubmission && (
        <>
          <header className="submission-detail-title">
            <div>
              <p className="eyebrow">DOSSIER · RÉF. {submission.id.slice(-8).toUpperCase()}</p>
              <h2>{beneficiaryName}</h2>
              <p>
                Personne accompagnée <span>·</span> Contact à rappeler : {submission.contactName}
                <span>·</span> {submission.service} <span>·</span> Reçue le{' '}
                {formatDate(submission.createdAt)}
              </p>
            </div>
            <span className={`status-pill status-${submission.status.toLowerCase()}`}>
              {statusLabels[submission.status] ?? 'À traiter'}
            </span>
          </header>

          <div className="submission-summary-grid">
            <article className="submission-summary-card">
              <span className="submission-summary-icon">
                <UserRound size={18} aria-hidden="true" />
              </span>
              <div>
                <small>PERSONNE À RECONTACTER</small>
                <b>{submission.contactName}</b>
                <a href={`mailto:${submission.contactEmail}`}>
                  <Mail size={14} /> {submission.contactEmail}
                </a>
                {submission.contactPhone && (
                  <a href={`tel:${submission.contactPhone}`}>
                    <Phone size={14} /> {submission.contactPhone}
                  </a>
                )}
              </div>
            </article>
            <article className="submission-summary-card">
              <span className="submission-summary-icon">
                <MapPin size={18} aria-hidden="true" />
              </span>
              <div>
                <small>ZONE ET ACCOMPAGNEMENT</small>
                <b>{submission.city}</b>
                <span>{submission.service}</span>
              </div>
            </article>
            <article className="submission-summary-card">
              <span className="submission-summary-icon">
                <ClipboardCheck size={18} aria-hidden="true" />
              </span>
              <div>
                <small>PRISE EN CHARGE</small>
                <label htmlFor="submission-status">Statut du dossier</label>
                <select
                  id="submission-status"
                  value={submission.status}
                  onChange={(event) => void onUpdate(submission.id, { status: event.target.value })}
                >
                  {statuses.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          </div>

          <section className="submission-detail-card">
            <header>
              <span className="submission-card-icon">
                <FileText size={18} />
              </span>
              <div>
                <h3>Réponses au questionnaire</h3>
                <p>Les informations transmises par la personne accompagnée.</p>
              </div>
              <span className="submission-answer-count">
                {answers.length} réponse{answers.length === 1 ? '' : 's'}
              </span>
            </header>
            {answers.length ? (
              <div className="submission-answer-grid">
                {answers.map(([key, value]) => (
                  <article className="submission-answer" key={key}>
                    <small>{answerLabels[key] ?? readableKey(key)}</small>
                    <p>{displayValue(value)}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="submission-no-answers">Aucune réponse complémentaire enregistrée.</p>
            )}
          </section>

          <div className="submission-detail-lower-grid">
            <section className="submission-detail-card submission-notes-card">
              <header>
                <span className="submission-card-icon">
                  <FileText size={18} />
                </span>
                <div>
                  <h3>Notes de suivi</h3>
                  <p>Visibles uniquement dans l’espace d’administration.</p>
                </div>
              </header>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="Ajouter une note de suivi…"
              />
              <button
                className="button button-dark"
                type="button"
                disabled={notes === (submission.internalNotes ?? '')}
                onClick={() => void onUpdate(submission.id, { internalNotes: notes })}
              >
                Enregistrer la note
              </button>
            </section>

            <section className="submission-detail-card submission-history-card">
              <header>
                <span className="submission-card-icon">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h3>Consentements et historique</h3>
                  <p>Suivi de réception et des changements du dossier.</p>
                </div>
              </header>
              <div className="submission-history-list">
                <p>
                  <b>Accord de contact</b>
                  <span>{formatDate(submission.consentAt)}</span>
                </p>
                {submission.guardianConsentAt && (
                  <p>
                    <b>Accord du responsable légal</b>
                    <span>{formatDate(submission.guardianConsentAt)}</span>
                  </p>
                )}
                {submission.history?.map((entry) => (
                  <p key={entry.id}>
                    <b>{entry.action.replace(/_/g, ' ').toLocaleLowerCase('fr-FR')}</b>
                    <span>
                      {formatDate(entry.occurredAt)}
                      {entry.details ? ` · ${entry.details}` : ''}
                    </span>
                  </p>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
