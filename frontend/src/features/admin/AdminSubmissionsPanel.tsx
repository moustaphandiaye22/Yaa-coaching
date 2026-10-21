import { ArrowUpRight } from 'lucide-react';
import type { Submission } from './admin-types.js';

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
      <div className="admin-stats">
        <article>
          <span>NOUVELLES DEMANDES</span>
          <b>{String(counts.NEW).padStart(2, '0')}</b>
          <small>À traiter</small>
        </article>
        <article>
          <span>AVIS EN ATTENTE</span>
          <b>{String(counts.PENDING).padStart(2, '0')}</b>
          <small>À modérer</small>
        </article>
        <article>
          <span>DEMANDES REÇUES</span>
          <b>{String(total).padStart(2, '0')}</b>
          <small>Résultats</small>
        </article>
      </div>
      <div className="admin-toolbar">
        <div className="admin-tabs">
          <button
            className={!statusFilter ? 'active' : ''}
            onClick={() => {
              onPageChange(1);
              onStatusFilterChange('');
            }}
          >
            Toutes
          </button>
          {[
            ['NEW', 'Nouvelles'],
            ['TO_CONTACT', 'À contacter'],
            ['CONTACTED', 'Contactées'],
            ['IN_PROGRESS', 'En cours'],
            ['CLOSED', 'Clôturées'],
            ['REJECTED', 'Refusées'],
          ].map(([s, l]) => (
            <button
              key={s}
              className={statusFilter === s ? 'active' : ''}
              onClick={() => {
                onPageChange(1);
                onStatusFilterChange(s);
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <input
          placeholder="Rechercher une personne, une ville..."
          value={query}
          onChange={(e) => {
            onPageChange(1);
            onQueryChange(e.target.value);
          }}
        />
      </div>
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
              <tr key={x.id} onClick={() => onSelect(x)}>
                <td>
                  <b>{x.contactName}</b>
                  <small>{x.id.slice(-8)}</small>
                </td>
                <td>{x.service}</td>
                <td>{x.city}</td>
                <td>{new Date(x.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <span className={`status-pill status-${x.status.toLowerCase()}`}>
                    {x.status.replace('_', ' ')}
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
      <div className="admin-pagination">
        <span>
          Page {page} · {total} résultat(s)
        </span>
        <button
          type="button"
          className="button button-light"
          disabled={page <= 1}
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
        >
          Précédente
        </button>
        <button
          type="button"
          className="button button-light"
          disabled={page * 50 >= total}
          onClick={() => onPageChange((p) => p + 1)}
        >
          Suivante
        </button>
      </div>
    </>
  );
}
