import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  total: number;
  pageSize?: number;
  resultLabel: string;
  onPageChange: (page: number) => void;
};

export default function AdminPagination({
  page,
  total,
  pageSize = 50,
  resultLabel,
  onPageChange,
}: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const firstResult = total ? (page - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <nav className="admin-pagination" aria-label="Pagination des résultats">
      <div className="admin-pagination-summary" aria-live="polite">
        <span>RÉSULTATS</span>
        <b>
          {firstResult}–{lastResult} <small>sur {total}</small>
        </b>
        <small>{resultLabel}</small>
      </div>
      <div className="admin-pagination-controls">
        <button
          type="button"
          className="admin-pagination-button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Précédente</span>
        </button>
        <span className="admin-pagination-current" aria-current="page">
          <small>PAGE</small>
          <b>{page}</b>
          <span>/ {pageCount}</span>
        </span>
        <button
          type="button"
          className="admin-pagination-button is-next"
          disabled={page >= pageCount}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          aria-label="Page suivante"
        >
          <span>Suivante</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
