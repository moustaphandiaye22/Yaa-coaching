import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import type { AdminApi } from '../../shared/api-client.js';

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
};

const labels = {
  comptes: 'Comptes administrateurs',
  journal: 'Journal d’activité',
  notifications: 'Notifications e-mail',
};

export default function AdminOperationsPanel({ section, api, onError }: Props) {
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

  const load = useCallback(async () => {
    if (section === 'comptes') setUsers(await api<UserRecord[]>('/api/admin/users'));
    if (section === 'journal') {
      const result = await api<{ items: AuditRecord[]; nextCursor: string | null }>(
        '/api/admin/audit',
      );
      setAudit(result.items);
      setCursor(result.nextCursor);
    }
    if (section === 'notifications') {
      const result = await api<{ items: NotificationRecord[] }>('/api/admin/notifications?size=50');
      setNotifications(result.items);
    }
  }, [api, section]);

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
          <h2>{labels[section]}.</h2>
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
                {users.map((user) => (
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
            {!users.length && <div className="admin-empty">Aucun compte.</div>}
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
                  <b>{item.action}</b>
                  <small>
                    {item.entity ?? 'Action système'}
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
                {notifications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.kind}</td>
                    <td>{new Date(item.createdAt).toLocaleString('fr-FR')}</td>
                    <td>{item.attempts}</td>
                    <td>
                      <span
                        className={`status-pill ${item.sentAt ? 'status-published' : 'status-pending'}`}
                      >
                        {item.sentAt ? 'Envoyée' : 'En attente'}
                      </span>
                    </td>
                    <td>{item.lastError ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!notifications.length && <div className="admin-empty">Aucune notification.</div>}
          </div>
        </>
      )}
    </section>
  );
}
