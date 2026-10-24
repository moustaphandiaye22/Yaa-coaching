import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LogOut,
  Mail,
  MapPin,
  ListChecks,
  BookOpen,
  UserRound,
  Pencil,
  RefreshCw,
  Star,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import AdminSubmissionsPanel from './AdminSubmissionsPanel.js';
import AdminSubmissionDrawer from './AdminSubmissionDrawer.js';
import AdminContentPanel from './AdminContentPanel.js';
import AdminMediaPanel from './AdminMediaPanel.js';
import AdminOperationsPanel from './AdminOperationsPanel.js';
import { useAdminWorkspace } from './useAdminWorkspace.js';

type AdminProps = { onNavigate: (p: string) => void };
const reviewStatusLabels: Record<string, string> = {
  PENDING: 'En attente',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
  HIDDEN: 'Masqué',
};
const adminPages: Record<string, { title: string; description: string }> = {
  demandes: {
    title: 'Demandes de contact',
    description:
      'Consultez les demandes, retrouvez les coordonnées et suivez chaque prise de contact.',
  },
  avis: {
    title: 'Avis et modération',
    description: 'Examinez les témoignages et décidez lesquels peuvent être publiés sur le site.',
  },
  faq: {
    title: 'Questions fréquentes',
    description:
      'Rédigez des réponses utiles et choisissez les questions visibles par les visiteurs.',
  },
  presentation: {
    title: 'Accueil et accompagnements',
    description: 'Gérez ensemble les textes de présentation et les appels à l’action de l’accueil.',
  },
  approche: {
    title: 'Méthode et coach',
    description: 'Présentez l’approche YAA et le parcours du coach depuis cette page.',
  },
  player: {
    title: 'YAA Player',
    description: 'Gérez les textes de l’accompagnement dédié aux jeunes footballeurs.',
  },
  questionnaires: {
    title: 'Questionnaires',
    description: 'Gérez les étapes, questions et choix affichés dans les formulaires publics.',
  },
  informations: {
    title: 'Zones et coordonnées',
    description: 'Mettez à jour les zones d’intervention et les coordonnées affichées.',
  },
  medias: {
    title: 'Galerie photos et vidéos',
    description: 'Ajoutez des médias accessibles, puis contrôlez leur publication sur le site.',
  },
  comptes: {
    title: 'Comptes et accès',
    description: 'Créez les comptes de l’équipe et gérez leurs rôles et leurs accès.',
  },
  notifications: {
    title: 'Notifications e-mail',
    description: 'Suivez les envois liés aux demandes et relancez ceux qui sont en échec.',
  },
};

function Admin({ onNavigate }: AdminProps) {
  const {
    user,
    setUser,
    sessionChecked,
    email,
    setEmail,
    password,
    setPassword,
    loginPending,
    error,
    setError,
    notice,
    setNotice,
    tab,
    setTab,
    items,
    reviews,
    faqsData,
    selected,
    setSelected,
    detailLoading,
    health,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    page,
    setPage,
    total,
    faqQ,
    setFaqQ,
    faqA,
    setFaqA,
    counts,
    api,
    checkHealth,
    load,
    login,
    deleteSubmission,
    updateSubmission,
    updateReview,
    deleteReview,
    addFaq,
    updateFaq,
    saveFaq,
    deleteFaq,
  } = useAdminWorkspace();
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqDraftQuestion, setFaqDraftQuestion] = useState('');
  const [faqDraftAnswer, setFaqDraftAnswer] = useState('');
  const currentPage = adminPages[tab] ?? adminPages.demandes;

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      setError('');
      setUser('');
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? `La déconnexion a échoué : ${logoutError.message}`
          : 'La déconnexion a échoué. Réessayez.',
      );
    }
  }

  if (!sessionChecked)
    return (
      <main className="admin-session-check" role="status" aria-live="polite">
        <div>
          <RefreshCw size={22} aria-hidden="true" />
          <p>Vérification de votre session administrateur…</p>
        </div>
      </main>
    );

  if (!user)
    return (
      <main className="admin-login">
        <div className="login-card">
          <a
            className="brand"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
          >
            <span className="brand-mark">Y</span>
            <span>
              <b>YAA COACHING</b>
              <small>ESPACE ADMINISTRATION</small>
            </span>
          </a>
          <p className="eyebrow">ESPACE SÉCURISÉ</p>
          <h1>Bon retour.</h1>
          <p>Connectez-vous pour retrouver les demandes et les avis.</p>
          <form onSubmit={login}>
            <label className="field">
              <span>Adresse e-mail</span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-dark" type="submit" disabled={loginPending}>
              {loginPending ? 'Connexion en cours…' : 'Se connecter'} <ArrowRight size={15} />
            </button>
          </form>
          <a
            className="login-back"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
          >
            <ArrowLeft size={14} /> Retour au site
          </a>
        </div>
      </main>
    );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
        >
          <span className="brand-mark">Y</span>
          <span>
            <b>YAA COACHING</b>
            <small>ESPACE ADMIN</small>
          </span>
        </a>
        <nav className="admin-menu" aria-label="Navigation administration">
          {[
            {
              title: 'ACTIVITÉ',
              items: [
                { id: 'demandes', Icon: Inbox, label: 'Demandes', count: counts.NEW },
                { id: 'avis', Icon: Star, label: 'Avis', count: counts.PENDING },
                { id: 'faq', Icon: CircleHelp, label: 'Questions fréquentes' },
              ],
            },
            {
              title: 'PAGES DU SITE',
              items: [
                { id: 'presentation', Icon: FileText, label: 'Accueil & accompagnements' },
                { id: 'approche', Icon: BookOpen, label: 'Méthode & coach' },
                { id: 'player', Icon: UserRound, label: 'YAA Player' },
                { id: 'questionnaires', Icon: ListChecks, label: 'Questionnaires' },
                { id: 'informations', Icon: MapPin, label: 'Zones & coordonnées' },
              ],
            },
            {
              title: 'ADMINISTRATION',
              items: [
                { id: 'medias', Icon: Images, label: 'Médias' },
                { id: 'comptes', Icon: UsersRound, label: 'Comptes' },
                { id: 'notifications', Icon: Mail, label: 'Notifications' },
              ],
            },
          ].map((group) => (
            <div className="admin-menu-group" key={group.title}>
              <div className="admin-menu-label">{group.title}</div>
              {group.items.map(({ id, Icon, label, count }) => (
                <button
                  key={id}
                  className={`admin-menu-item ${tab === id ? 'active' : ''}`}
                  aria-current={tab === id ? 'page' : undefined}
                  onClick={() => {
                    setTab(id);
                    setError('');
                    setNotice('');
                  }}
                >
                  <span>
                    <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  {label}
                  {count ? <i>{count}</i> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <span>Y</span>
            <div>
              <b>{user.split('@')[0]}</b>
              <small>Administrateur</small>
            </div>
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
          >
            Voir le site <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">
              YAA COACHING <span>/</span> ADMINISTRATION
            </p>
            <h1>{currentPage.title}</h1>
            <p className="admin-page-description">{currentPage.description}</p>
          </div>
          <div className="admin-top-right">
            <span className={`api-status api-${health}`} aria-live="polite">
              <i />
              {health === 'checking'
                ? 'Vérification…'
                : health === 'ready'
                  ? 'API et base prêtes'
                  : 'API ou base indisponible'}
            </span>
            <button
              className="admin-header-action"
              type="button"
              aria-label="Actualiser les données et vérifier la connexion"
              title="Actualiser les données et l’état de l’API"
              onClick={() => {
                void load();
                void checkHealth();
              }}
            >
              <RefreshCw size={16} aria-hidden="true" />
            </button>
            <a className="admin-header-action" href="/" aria-label="Voir le site public">
              <ExternalLink size={16} aria-hidden="true" />
            </a>
            <button
              className="admin-header-action admin-header-logout"
              type="button"
              onClick={() => void logout()}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </header>
        {error && (
          <div className="admin-error-bar" role="alert">
            {error}
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Fermer le message d’erreur"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {notice && (
          <div className="admin-success-bar" role="status">
            {notice}
            <button onClick={() => setNotice('')} aria-label="Fermer le message de confirmation">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="admin-page-content">
          {tab === 'demandes' && (
            <AdminSubmissionsPanel
              counts={counts}
              total={total}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              query={query}
              onQueryChange={setQuery}
              page={page}
              onPageChange={setPage}
              items={items}
              onSelect={setSelected}
            />
          )}
          {tab === 'avis' && (
            <div className="admin-reviews">
              {reviews.map((r) => (
                <article key={r.id}>
                  <div className="admin-review-top">
                    <b>{r.pseudonym}</b>
                    <span className={`status-pill status-${r.status.toLowerCase()}`}>
                      {reviewStatusLabels[r.status] ?? 'En attente'}
                    </span>
                  </div>
                  <div className="admin-stars" aria-label={`${r.rating} sur 5`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={15}
                        fill={index < r.rating ? 'currentColor' : 'none'}
                        aria-hidden="true"
                      />
                    ))}{' '}
                    <small>
                      {r.service} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </small>
                  </div>
                  <p>{r.message}</p>
                  <small className="review-email">{r.email}</small>
                  <div className="admin-review-actions">
                    {r.status !== 'PUBLISHED' && (
                      <button type="button" onClick={() => updateReview(r.id, 'PUBLISHED')}>
                        <Check size={14} /> Publier
                      </button>
                    )}
                    {r.status !== 'REJECTED' && (
                      <button type="button" onClick={() => updateReview(r.id, 'REJECTED')}>
                        Rejeter
                      </button>
                    )}
                    {r.status === 'PUBLISHED' && (
                      <button type="button" onClick={() => updateReview(r.id, 'HIDDEN')}>
                        Masquer
                      </button>
                    )}
                    <button type="button" onClick={() => void deleteReview(r.id)}>
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
              {!reviews.length && (
                <div className="admin-empty">Aucun avis reçu pour le moment.</div>
              )}
            </div>
          )}
          {tab === 'faq' && (
            <>
              <form className="admin-faq-form" onSubmit={addFaq}>
                <h3>Ajouter une question à la FAQ</h3>
                <label className="field">
                  <span>Question</span>
                  <input
                    value={faqQ}
                    onChange={(e) => setFaqQ(e.target.value)}
                    placeholder="Ex. Faut-il être sportif pour commencer ?"
                    minLength={5}
                    maxLength={300}
                    required
                  />
                </label>
                <label className="field">
                  <span>Réponse</span>
                  <textarea
                    value={faqA}
                    onChange={(e) => setFaqA(e.target.value)}
                    placeholder="Rédigez une réponse claire et utile."
                    minLength={5}
                    maxLength={3000}
                    required
                    rows={3}
                  />
                </label>
                <button className="button button-dark" type="submit">
                  Ajouter à la FAQ <ArrowRight size={14} />
                </button>
              </form>
              <div className="admin-faq-list">
                {faqsData.map((f, i) => (
                  <article key={f.id}>
                    <span>0{i + 1}</span>
                    {editingFaqId === f.id ? (
                      <form
                        className="admin-faq-edit"
                        onSubmit={async (event) => {
                          event.preventDefault();
                          if (await saveFaq(f.id, faqDraftQuestion, faqDraftAnswer)) {
                            setEditingFaqId(null);
                          }
                        }}
                      >
                        <label className="field">
                          <span>Question</span>
                          <input
                            value={faqDraftQuestion}
                            onChange={(event) => setFaqDraftQuestion(event.target.value)}
                            minLength={5}
                            maxLength={300}
                            required
                          />
                        </label>
                        <label className="field">
                          <span>Réponse</span>
                          <textarea
                            value={faqDraftAnswer}
                            onChange={(event) => setFaqDraftAnswer(event.target.value)}
                            minLength={5}
                            maxLength={3000}
                            rows={4}
                            required
                          />
                        </label>
                        <div className="admin-faq-edit-actions">
                          <button className="button button-dark" type="submit">
                            Enregistrer les modifications
                          </button>
                          <button
                            className="button button-light"
                            type="button"
                            onClick={() => setEditingFaqId(null)}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <b>{f.question}</b>
                        <p>{f.answer}</p>
                      </div>
                    )}
                    <label>
                      <input
                        type="checkbox"
                        checked={f.published}
                        onChange={(e) => void updateFaq(f.id, e.target.checked)}
                      />{' '}
                      Publiée
                    </label>
                    <button
                      type="button"
                      className="admin-faq-edit-button"
                      aria-label={`Modifier la question : ${f.question}`}
                      onClick={() => {
                        setEditingFaqId(f.id);
                        setFaqDraftQuestion(f.question);
                        setFaqDraftAnswer(f.answer);
                      }}
                      disabled={editingFaqId !== null && editingFaqId !== f.id}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteFaq(f.id)}
                      aria-label={`Supprimer la question : ${f.question}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </article>
                ))}
              </div>
              {!faqsData.length && (
                <div className="admin-empty">
                  Aucune question publiée ou enregistrée pour le moment.
                </div>
              )}
            </>
          )}
          {['presentation', 'approche', 'player', 'informations', 'questionnaires'].includes(
            tab,
          ) && (
            <div className="admin-content-group-grid">
              {(tab === 'presentation'
                ? ['hero', 'services', 'closing']
                : tab === 'approche'
                  ? ['methode', 'coach']
                  : tab === 'informations'
                    ? ['zones', 'contacts']
                    : tab === 'questionnaires'
                      ? ['questionnaires']
                      : ['player']
              ).map((contentKey) => (
                <AdminContentPanel
                  key={contentKey}
                  api={api}
                  contentKey={contentKey}
                  onError={setError}
                  onSuccess={setNotice}
                />
              ))}
            </div>
          )}
          {tab === 'medias' && (
            <AdminMediaPanel api={api} onError={setError} onSuccess={setNotice} />
          )}
          {['comptes', 'notifications'].includes(tab) && (
            <AdminOperationsPanel
              section={tab as 'comptes' | 'notifications'}
              api={api}
              onError={setError}
              onSuccess={setNotice}
            />
          )}
        </div>
      </main>
      <AdminSubmissionDrawer
        selected={selected}
        loading={detailLoading}
        onClose={() => setSelected(null)}
        onDelete={deleteSubmission}
        onUpdate={updateSubmission}
      />
    </div>
  );
}

export default Admin;
