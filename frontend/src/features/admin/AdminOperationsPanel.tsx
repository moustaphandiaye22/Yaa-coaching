import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import type { AdminApi } from '../../shared/api-client.js';
import AdminListToolbar from './AdminListToolbar.js';
import AdminPagination from './AdminPagination.js';
import { matchesAdminSearch } from './admin-list-utils.js';

type UserRecord = {
  id: string;
  email: string;
  role: 'ADMIN' | 'COACH';
  active: boolean;
  createdAt: string;
};
type AuditRecord = {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  occurredAt: string;
  actor?: { email: string } | null;
};
type NotificationRecord = {
  id: string;
  kind: string;
  attempts: number;
  sentAt: string | null;
  lastError: string | null;
  createdAt: string;
};
type Props = {
  section: 'comptes' | 'journal' | 'notifications';
  api: AdminApi;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

const labels = {
  comptes: 'Comptes administrateurs',
  journal: 'Journal d’activité',
  notifications: 'Notifications e-mail',
};
const auditActionLabels: Record<string, string> = {
  FAQ_CREATED: 'Question fréquente ajoutée',
  FAQ_UPDATED: 'Question fréquente modifiée',
  FAQ_DELETED: 'Question fréquente supprimée',
  FAQ_PUBLISHED: 'Question fréquente publiée',
  FAQ_UNPUBLISHED: 'Question fréquente masquée',
  USER_CREATED: 'Compte créé',
  USER_UPDATED: 'Compte modifié',
  USER_DELETED: 'Compte supprimé',
  MEDIA_CREATED: 'Média ajouté',
  MEDIA_UPDATED: 'Média modifié',
  MEDIA_DELETED: 'Média supprimé',
  CONTENT_UPDATED: 'Contenu modifié',
  CONTENT_PUBLISHED: 'Contenu publié',
  CONTENT_UNPUBLISHED: 'Publication retirée',
  REVIEW_PUBLISHED: 'Avis publié',
  REVIEW_SUBMITTED: 'Avis reçu pour modération',
  REVIEW_REJECTED: 'Avis refusé',
  REVIEW_HIDDEN: 'Avis masqué',
  REVIEW_DELETED: 'Avis supprimé',
  SUBMISSION_UPDATED: 'Demande mise à jour',
  SUBMISSION_CREATED: 'Nouvelle demande reçue',
  SUBMISSION_NEW: 'Demande marquée comme nouvelle',
  SUBMISSION_TO_CONTACT: 'Demande à contacter',
  SUBMISSION_CONTACTED: 'Demande marquée comme contactée',
  SUBMISSION_IN_PROGRESS: 'Accompagnement en cours',
  SUBMISSION_CLOSED: 'Demande clôturée',
  SUBMISSION_REJECTED: 'Demande refusée',
  SUBMISSION_DELETED: 'Demande supprimée',
  SUBMISSION_NOTE_UPDATED: 'Note interne modifiée',
};
const entityLabels: Record<string, string> = {
  Faq: 'Question fréquente',
  Review: 'Avis',
  User: 'Compte',
  Media: 'Média',
  Content: 'Contenu',
  ContentBlock: 'Contenu',
  Submission: 'Demande',
};
const notificationLabels: Record<string, string> = {
  SUBMISSION_RECEIVED: 'Nouvelle demande reçue',
  SUBMISSION_RECEIPT: 'Confirmation de réception',
  REVIEW_SUBMITTED: 'Nouvel avis à modérer',
};

export default function AdminOperationsPanel({ section, api, onError, onSuccess }: Props) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'COACH'>('ADMIN');
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [dispatched, setDispatched] = useState<number | null>(null);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState('');
  const [accountStateFilter, setAccountStateFilter] = useState('');
  const [notificationSearch, setNotificationSearch] = useState('');
  const [notificationStateFilter, setNotificationStateFilter] = useState('');
  const [notificationPage, setNotificationPage] = useState(1);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const loadSequence = useRef(0);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (!accountRoleFilter || user.role === accountRoleFilter) &&
          (accountStateFilter === '' || user.active === (accountStateFilter === 'active')) &&
          matchesAdminSearch(accountSearch, user.email, user.role),
      ),
    [users, accountSearch, accountRoleFilter, accountStateFilter],
  );
  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const state = notification.sentAt ? 'SENT' : notification.lastError ? 'FAILED' : 'PENDING';
        return (
          (!notificationStateFilter || state === notificationStateFilter) &&
          matchesAdminSearch(
            notificationSearch,
            notificationLabels[notification.kind] ?? notification.kind,
            notification.kind,
            notification.lastError,
            state === 'SENT' ? 'Envoyée' : state === 'FAILED' ? 'Échec' : 'En attente',
          )
        );
      }),
    [notifications, notificationSearch, notificationStateFilter],
  );

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    if (section === 'comptes') {
      const result = await api<UserRecord[]>('/api/admin/users');
      if (sequence === loadSequence.current) setUsers(result);
    }
    if (section === 'journal') {
      const result = await api<{ items: AuditRecord[]; nextCursor: string | null }>(
        '/api/admin/audit',
      );
      if (sequence === loadSequence.current) {
        setAudit(result.items);
        setCursor(result.nextCursor);
      }
    }
    if (section === 'notifications') {
      const params = new URLSearchParams({ page: String(notificationPage), size: '50' });
      if (notificationStateFilter) params.set('status', notificationStateFilter);
      if (notificationSearch.trim()) params.set('q', notificationSearch.trim());
      const result = await api<{ items: NotificationRecord[]; total: number }>(
        `/api/admin/notifications?${params.toString()}`,
      );
      if (sequence === loadSequence.current) {
        setNotifications(result.items);
        setNotificationTotal(result.total);
      }
    }
  }, [api, section, notificationPage, notificationStateFilter, notificationSearch]);

  async function loadMoreAudit() {
    if (!cursor) return;
    try {
      const result = await api<{ items: AuditRecord[]; nextCursor: string | null }>(
        `/api/admin/audit?before=${encodeURIComponent(cursor)}`,
      );
      setAudit((current) => [...current, ...result.items]);
      setCursor(result.nextCursor);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de charger le journal.');
    }
  }

  function changeNotificationSearch(value: string) {
    setNotificationPage(1);
    setNotificationSearch(value);
  }

  function changeNotificationStatus(value: string) {
    setNotificationPage(1);
    setNotificationStateFilter(value);
  }

  function changeNotificationPage(page: number) {
    setNotificationPage(page);
  }

  useEffect(() => {
    load().catch((error: unknown) =>
      onError(error instanceof Error ? error.message : 'Impossible de charger ces informations.'),
    );
  }, [load, onError]);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      setEmail('');
      setPassword('');
      setRole('ADMIN');
      onError('');
      await load();
      onSuccess('Le compte a été créé avec les droits sélectionnés.');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Création du compte impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function updateUser(
    user: UserRecord,
    changes: Partial<UserRecord> & { password?: string },
  ) {
    try {
      await api(`/api/admin/users/${user.id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      onError('');
      await load();
      onSuccess(
        changes.password
          ? 'Le mot de passe du compte a été modifié.'
          : changes.role
            ? 'Le rôle du compte a été modifié.'
            : 'Le statut du compte a été modifié.',
      );
      return true;
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Modification du compte impossible.');
      return false;
    }
  }

  async function updateRole(user: UserRecord, nextRole: UserRecord['role']) {
    if (nextRole === user.role) return;
    if (
      nextRole === 'COACH' &&
      !window.confirm(
        'Un compte Coach ne peut pas ouvrir l’espace d’administration. Confirmer ce changement ?',
      )
    )
      return;
    await updateUser(user, { role: nextRole });
  }

  async function resetPassword(user: UserRecord) {
    const password = passwordDrafts[user.id] ?? '';
    if (password.length < 12) {
      onError('Le nouveau mot de passe doit contenir au moins 12 caractères.');
      return;
    }
    if (await updateUser(user, { password }))
      setPasswordDrafts((current) => ({ ...current, [user.id]: '' }));
  }

  async function deleteUser(user: UserRecord) {
    if (!window.confirm(`Supprimer le compte ${user.email} ?`)) return;
    try {
      await api(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      onError('');
      await load();
      onSuccess('Le compte a été supprimé.');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Suppression du compte impossible.');
    }
  }

  async function retryNotifications() {
    setBusy(true);
    try {
      const result = await api<{ dispatched: number }>('/api/admin/notifications/retry', {
        method: 'POST',
      });
      setDispatched(result.dispatched);
      onError('');
      await load();
      onSuccess(
        result.dispatched === 0
          ? 'Aucune notification n’était prête à être relancée.'
          : `${result.dispatched} notification${result.dispatched > 1 ? 's' : ''} relancée${result.dispatched > 1 ? 's' : ''}.`,
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Relance impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-operations" aria-label={labels[section]}>
      <div className="admin-content-intro">
        <div>
          <p className="eyebrow">OUTILS D’ADMINISTRATION</p>
          <p>
            {section === 'comptes'
              ? 'Gérez les accès et les rôles. Les mots de passe doivent contenir au moins 12 caractères. Un compte Coach ne peut pas ouvrir cet espace.'
              : section === 'journal'
                ? 'Les actions sensibles enregistrées par le backend apparaissent ici.'
                : 'Consultez les envois en attente et relancez les notifications qui ont échoué.'}
          </p>
        </div>
        <button className="button button-light" type="button" onClick={() => void load()}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {section === 'comptes' && (
        <>
          <form className="admin-user-create" onSubmit={createUser}>
            <label className="field">
              <span>Adresse e-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Mot de passe temporaire</span>
              <input
                type="password"
                minLength={12}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Rôle</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as 'ADMIN' | 'COACH')}
              >
                <option value="COACH">Coach</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </label>
            <button className="button button-dark" disabled={busy}>
              <UserPlus size={14} /> Créer le compte
            </button>
          </form>
          <AdminListToolbar
            searchLabel="Rechercher un compte"
            searchPlaceholder="Adresse e-mail…"
            searchValue={accountSearch}
            onSearchChange={setAccountSearch}
            resultCount={filteredUsers.length}
            resultLabel="compte(s)"
            filters={[
              {
                label: 'Rôle',
                value: accountRoleFilter,
                onChange: setAccountRoleFilter,
                options: [
                  { value: '', label: 'Tous les rôles' },
                  { value: 'ADMIN', label: 'Administrateurs' },
                  { value: 'COACH', label: 'Coachs' },
                ],
              },
              {
                label: 'État',
                value: accountStateFilter,
                onChange: setAccountStateFilter,
                options: [
                  { value: '', label: 'Tous les états' },
                  { value: 'active', label: 'Actifs' },
                  { value: 'inactive', label: 'Désactivés' },
                ],
              },
            ]}
          />
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>COMPTE</th>
                  <th>RÔLE</th>
                  <th>ÉTAT</th>
                  <th>CRÉÉ LE</th>
                  <th>RÉINITIALISER LE MOT DE PASSE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <b>{user.email}</b>
                    </td>
                    <td>
                      <select
                        aria-label={`Rôle de ${user.email}`}
                        value={user.role}
                        onChange={(event) =>
                          void updateRole(user, event.target.value as UserRecord['role'])
                        }
                      >
                        <option value="ADMIN">Administrateur</option>
                        <option value="COACH">Coach</option>
                      </select>
                    </td>
                    <td>
                      <label>
                        <input
                          aria-label={`Compte actif : ${user.email}`}
                          type="checkbox"
                          checked={user.active}
                          onChange={(event) =>
                            void updateUser(user, { active: event.target.checked })
                          }
                        />{' '}
                        Actif
                      </label>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <form
                        className="admin-password-reset"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void resetPassword(user);
                        }}
                      >
                        <input
                          type="password"
                          minLength={12}
                          maxLength={128}
                          required
                          aria-label={`Nouveau mot de passe pour ${user.email}`}
                          value={passwordDrafts[user.id] ?? ''}
                          onChange={(event) =>
                            setPasswordDrafts((current) => ({
                              ...current,
                              [user.id]: event.target.value,
                            }))
                          }
                        />
                        <button className="button button-light" type="submit">
                          Réinitialiser
                        </button>
                      </form>
                    </td>
                    <td>
                      <button
                        className="admin-icon-button"
                        type="button"
                        aria-label={`Supprimer ${user.email}`}
                        onClick={() => void deleteUser(user)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredUsers.length && (
              <div className="admin-empty">
                {users.length
                  ? 'Aucun compte ne correspond à la recherche et aux filtres sélectionnés.'
                  : 'Aucun compte.'}
              </div>
            )}
          </div>
        </>
      )}

      {section === 'journal' && (
        <>
          <div className="admin-audit-list">
            {audit.map((item) => (
              <article key={item.id}>
                <span>
                  <ShieldCheck size={15} />
                </span>
                <div>
                  <b>{auditActionLabels[item.action] ?? 'Action d’administration'}</b>
                  <small>
                    {item.entity ? (entityLabels[item.entity] ?? 'Élément') : 'Action système'}
                    {item.entityId ? ` · ${item.entityId}` : ''}
                  </small>
                </div>
                <div>
                  <b>{item.actor?.email ?? 'Système'}</b>
                  <small>{new Date(item.occurredAt).toLocaleString('fr-FR')}</small>
                </div>
              </article>
            ))}
            {!audit.length && <div className="admin-empty">Aucune action enregistrée.</div>}
          </div>
          {cursor && (
            <button
              className="button button-light"
              type="button"
              onClick={() => void loadMoreAudit()}
            >
              Charger les événements plus anciens
            </button>
          )}
        </>
      )}

      {section === 'notifications' && (
        <>
          <div className="admin-notification-toolbar">
            <p>
              {dispatched === null
                ? 'Les notifications sont traitées par le service d’envoi configuré.'
                : `${dispatched} notification(s) envoyée(s) lors de la dernière relance.`}
            </p>
            <button
              className="button button-dark"
              type="button"
              disabled={busy}
              onClick={() => void retryNotifications()}
            >
              <RefreshCw size={14} />
              {busy ? 'Relance…' : 'Relancer les envois échoués'}
            </button>
          </div>
          <AdminListToolbar
            searchLabel="Rechercher une notification"
            searchPlaceholder="Type, état ou message d’erreur…"
            searchValue={notificationSearch}
            onSearchChange={changeNotificationSearch}
            resultCount={notificationTotal}
            resultLabel="notification(s)"
            filters={[
              {
                label: 'État',
                value: notificationStateFilter,
                onChange: changeNotificationStatus,
                options: [
                  { value: '', label: 'Tous les états' },
                  { value: 'PENDING', label: 'En attente' },
                  { value: 'FAILED', label: 'En échec' },
                  { value: 'SENT', label: 'Envoyées' },
                ],
              },
            ]}
          />
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>CRÉÉE LE</th>
                  <th>TENTATIVES</th>
                  <th>ÉTAT</th>
                  <th>DERNIÈRE ERREUR</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((item) => (
                  <tr key={item.id}>
                    <td>{notificationLabels[item.kind] ?? 'Notification'}</td>
                    <td>{new Date(item.createdAt).toLocaleString('fr-FR')}</td>
                    <td>{item.attempts}</td>
                    <td>
                      <span
                        className={`status-pill ${item.sentAt ? 'status-published' : item.lastError ? 'status-rejected' : 'status-pending'}`}
                      >
                        {item.sentAt ? 'Envoyée' : item.lastError ? 'Échec' : 'En attente'}
                      </span>
                    </td>
                    <td>
                      {item.lastError ? (
                        <details className="admin-technical-error">
                          <summary>Échec d’envoi · Détail technique</summary>
                          <p>{item.lastError}</p>
                        </details>
                      ) : (
                        'Aucune erreur enregistrée'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredNotifications.length && (
              <div className="admin-empty">
                {notifications.length
                  ? 'Aucune notification de cette page ne correspond aux critères.'
                  : 'Aucune notification.'}
              </div>
            )}
          </div>
          <AdminPagination
            page={notificationPage}
            total={notificationTotal}
            resultLabel={notificationTotal === 1 ? 'notification' : 'notifications'}
            onPageChange={changeNotificationPage}
          />
        </>
      )}
    </section>
  );
}
