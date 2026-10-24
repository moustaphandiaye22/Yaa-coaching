import { X } from 'lucide-react';
import { API } from '../../shared/site-content.js';
import type { Submission } from './admin-types.js';

type Props = {
  selected: Submission | null;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
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
const answerLabels: Record<string, string> = {
  approach: 'Votre démarche',
  firstName: 'Prénom',
  representative: 'Responsable légal',
  age: 'Âge',
  situation: 'Situation',
  city: 'Ville et pays',
  objective: 'Objectif recherché',
  goal: 'Objectif prioritaire',
  priorities: 'Priorités',
  playerPriorities: 'Priorités sportives',
  activity: 'Activité actuelle',
  activityDetails: 'Détails sur l’activité',
  activities: 'Activités souhaitées',
  helpStarting: 'Aide souhaitée pour commencer',
  expectations: 'Attentes',
  familyExpectations: 'Attentes des proches',
  expectationsShared: 'Attentes partagées',
  success: 'Résultat attendu',
  deadline: 'Échéance envisagée',
  availability: 'Disponibilités',
  format: 'Format souhaité',
  contactEmail: 'Adresse e-mail',
  contactPhone: 'Téléphone',
  club: 'Club, catégorie et niveau',
  position: 'Poste principal',
  secondaryPosition: 'Poste secondaire',
  strongFoot: 'Pied fort',
  footballStart: 'Début du football',
  footballRhythm: 'Rythme hebdomadaire',
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
  constraints: 'Contraintes et adaptations',
  supportStyle: 'Accompagnement souhaité',
  otherInfo: 'Autres précisions',
  weightLoss: 'Objectif de perte de poids',
  kilos: 'Perte de poids envisagée',
  whyGoal: 'Motivation liée à cet objectif',
  pastSupport: 'Accompagnements précédents',
  experience: 'Expérience',
  difficulties: 'Difficultés rencontrées',
};
const statusLabels = Object.fromEntries(statuses) as Record<string, string>;

export default function AdminSubmissionDrawer({
  selected,
  loading,
  onClose,
  onDelete,
  onUpdate,
}: Props) {
  if (!selected) return null;

  return (
    <div className="admin-drawer-back" onClick={onClose}>
      <aside
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Dossier de ${selected.contactName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="drawer-close"
          type="button"
          onClick={onClose}
          aria-label="Fermer le dossier"
        >
          <X size={18} />
        </button>
        <p className="eyebrow">DEMANDE · {selected.id.slice(-8)}</p>
        <h2>{selected.contactName}</h2>
        {loading && <p role="status">Chargement du dossier…</p>}
        <div className="drawer-actions">
          <a
            className="button button-light"
            href={`${API}/api/admin/submissions/${selected.id}/export`}
            target="_blank"
            rel="noreferrer"
          >
            Exporter le dossier
          </a>
          <button className="button button-light" type="button" onClick={() => void onDelete()}>
            Supprimer
          </button>
        </div>
        <span className={`status-pill status-${selected.status.toLowerCase()}`}>
          {statusLabels[selected.status] ?? 'À traiter'}
        </span>
        <div className="drawer-section">
          <small>COORDONNÉES</small>
          <a href={`mailto:${selected.contactEmail}`}>{selected.contactEmail}</a>
          {selected.contactPhone && (
            <a href={`tel:${selected.contactPhone}`}>{selected.contactPhone}</a>
          )}
          <p>{selected.city}</p>
        </div>
        <div className="drawer-section">
          <small>ACCOMPAGNEMENT</small>
          <b>{selected.service}</b>
          <span>Reçue le {new Date(selected.createdAt).toLocaleString('fr-FR')}</span>
        </div>
        <div className="drawer-section">
          <small>STATUT</small>
          <select
            value={selected.status}
            onChange={(event) => void onUpdate(selected.id, { status: event.target.value })}
          >
            {statuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="drawer-section">
          <small>RÉPONSES AU QUESTIONNAIRE</small>
          {Object.entries(selected.answers ?? {})
            .filter(([key]) => !['contactEmail', 'contactPhone', 'consent'].includes(key))
            .map(([key, value]) => (
              <p key={key}>
                <b>{answerLabels[key] ?? 'Autre précision'}</b>
                <br />
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </p>
            ))}
        </div>
        <div className="drawer-section">
          <small>NOTES INTERNES</small>
          <textarea
            key={selected.id}
            defaultValue={selected.internalNotes ?? ''}
            onBlur={(event) => void onUpdate(selected.id, { internalNotes: event.target.value })}
            rows={5}
            maxLength={5000}
            placeholder="Ajouter une note..."
          />
        </div>
      </aside>
    </div>
  );
}
