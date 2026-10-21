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
      <aside className="admin-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="drawer-close" onClick={onClose}>
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
          {selected.status.replace('_', ' ')}
        </span>
        <div className="drawer-section">
          <small>CONTACT</small>
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
                <b>{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</b>
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
            placeholder="Ajouter une note..."
          />
        </div>
      </aside>
    </div>
  );
}
