import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bell, Inbox, Star, X } from 'lucide-react';

export type AdminNotificationEvent = {
  id: string;
  action: string;
  entityId: string | null;
  occurredAt: string;
};

type Props = {
  count: number;
  events: AdminNotificationEvent[];
  className?: string;
  onSelectEvent: (event: AdminNotificationEvent) => void;
  onViewAll: () => void;
};

export default function AdminNotificationBell({
  count,
  events,
  className = '',
  onSelectEvent,
  onViewAll,
}: Props) {
  const [open, setOpen] = useState(false);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !centerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div
      className={`admin-notification-center ${className}`.trim()}
      ref={centerRef}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="admin-header-action admin-notification-trigger"
        type="button"
        aria-label={`Notifications. ${count} élément(s) à traiter.`}
        aria-expanded={open}
        aria-controls="admin-notification-popover"
        title="Afficher les notifications reçues"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={17} aria-hidden="true" />
        {count > 0 && (
          <span className="admin-notification-badge" aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && (
        <section
          className="admin-notification-popover"
          id="admin-notification-popover"
          aria-label="Notifications reçues"
        >
          <header>
            <div>
              <b>Notifications reçues</b>
              <small>{count} élément(s) à traiter</small>
            </div>
            <button
              className="admin-notification-close"
              type="button"
              aria-label="Fermer les notifications"
              onClick={() => setOpen(false)}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </header>
          {events.length ? (
            <div className="admin-notification-events">
              {events.slice(0, 8).map((event) => {
                const isSubmission = event.action === 'SUBMISSION_CREATED';
                return (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => {
                      setOpen(false);
                      onSelectEvent(event);
                    }}
                  >
                    <span className="admin-notification-event-icon">
                      {isSubmission ? (
                        <Inbox size={15} aria-hidden="true" />
                      ) : (
                        <Star size={15} aria-hidden="true" />
                      )}
                    </span>
                    <span className="admin-notification-event-copy">
                      <b>{isSubmission ? 'Nouvelle demande reçue' : 'Nouvel avis à modérer'}</b>
                      <small>Reçue le {new Date(event.occurredAt).toLocaleString('fr-FR')}</small>
                    </span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="admin-notification-empty">Aucune notification reçue récemment.</p>
          )}
          <button
            className="admin-notification-footer"
            type="button"
            onClick={() => {
              setOpen(false);
              onViewAll();
            }}
          >
            Consulter le suivi des e-mails
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </section>
      )}
    </div>
  );
}
