import { ArrowUpRight } from 'lucide-react';
import type { Submission } from './admin-types.js';
import AdminListToolbar from './AdminListToolbar.js';
import AdminPagination from './AdminPagination.js';
import { funnelLinks } from '../../shared/funnel-links.js';

type Props = {
  counts: { NEW: number; PENDING: number };
  total: number;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  page: number;
  onPageChange: (page: number | ((current: number) => number)) => void;
  items: Submission[];
  onSelect: (submission: Submission) => void;
};

const submissionStatusLabels: Record<string, string> = {
  NEW: 'Nouvelle',
  TO_CONTACT: 'À contacter',
  CONTACTED: 'Contactée',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Clôturée',
  REJECTED: 'Refusée',
};

export default function AdminSubmissionsPanel({
  counts,
  total,
  statusFilter,
  onStatusFilterChange,
  query,
  onQueryChange,
  page,
  onPageChange,
  items,
  onSelect,
}: Props) {
  return (
    <>
      <p className="admin-content-empty">
        Cette liste contient les demandes enregistrées dans l’application. Les réponses aux
        formulaires actuels sont à consulter dans{' '}
        <a href={funnelLinks.offers} target="_blank" rel="noreferrer">
          Systeme.io
        </a>
        .
      </p>
      <div className="admin-stats">
        <article>
          <span>ANCIENNES DEMANDES À TRAITER</span>
          <b>{String(counts.NEW).padStart(2, '0')}</b>
          <small>À traiter</small>
        </article>
        <article>
          <span>AVIS EN ATTENTE</span>
          <b>{String(counts.PENDING).padStart(2, '0')}</b>
          <small>À modérer</small>
        </article>
        <article>
          <span>DEMANDES INTERNES CONSERVÉES</span>
          <b>{String(total).padStart(2, '0')}</b>
          <small>Résultats</small>
        </article>
      </div>
      <AdminListToolbar
        searchLabel="Rechercher une demande"
        searchPlaceholder="Nom, ville, accompagnement, e-mail…"
        searchValue={query}
        onSearchChange={(value) => {
          onPageChange(1);
          onQueryChange(value);
        }}
        resultCount={total}
        resultLabel={total === 1 ? 'demande' : 'demandes'}
        filters={[
          {
            label: 'Statut',
            value: statusFilter,
            onChange: (value) => {
              onPageChange(1);
              onStatusFilterChange(value);
            },
            options: [
              { value: '', label: 'Tous les statuts' },
              { value: 'NEW', label: 'Nouvelles' },
              { value: 'TO_CONTACT', label: 'À contacter' },
              { value: 'CONTACTED', label: 'Contactées' },
              { value: 'IN_PROGRESS', label: 'En cours' },
              { value: 'CLOSED', label: 'Clôturées' },
              { value: 'REJECTED', label: 'Refusées' },
            ],
          },
        ]}
      />
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>PERSONNE</th>
              <th>ACCOMPAGNEMENT</th>
              <th>VILLE</th>
              <th>DATE</th>
              <th>STATUT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr
                key={x.id}
                tabIndex={0}
                aria-label={`Ouvrir le dossier de ${x.contactName}`}
                onClick={() => onSelect(x)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault();
                    onSelect(x);
                  }
                }}
              >
                <td>
                  <button
                    className="admin-row-open"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(x);
                    }}
                    aria-label={`Ouvrir le dossier de ${x.contactName}`}
                  >
                    <b>{x.contactName}</b>
                    <small>Réf. {x.id.slice(-8)}</small>
                  </button>
                </td>
                <td>{x.service}</td>
                <td>{x.city}</td>
                <td>{new Date(x.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <span className={`status-pill status-${x.status.toLowerCase()}`}>
                    {submissionStatusLabels[x.status] ?? 'À traiter'}
                  </span>
                </td>
                <td>
                  <ArrowUpRight size={15} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="admin-empty">Aucune demande ne correspond à ces filtres.</div>
        )}
      </div>
      <AdminPagination
        page={page}
        total={total}
        resultLabel={total === 1 ? 'demande' : 'demandes'}
        onPageChange={(nextPage) => onPageChange(nextPage)}
      />
    </>
  );
}
