import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Files,
  History,
  Images,
  Inbox,
  Mail,
  Star,
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
function Admin({ onNavigate }: AdminProps) {
  const {
    user,
    setUser,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
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
    deleteFaq,
  } = useAdminWorkspace();
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
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="admin-error">{error}</p>}
            <button className="button button-dark">
              Se connecter <ArrowRight size={15} />
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
        <div className="admin-menu-label">GESTION</div>
        <nav className="admin-menu" aria-label="Navigation administration">
          {[
            { id: 'demandes', Icon: Inbox, label: 'Demandes', count: counts.NEW },
            { id: 'avis', Icon: Star, label: 'Avis', count: counts.PENDING },
            { id: 'faq', Icon: CircleHelp, label: 'Questions fréquentes' },
            { id: 'contenu', Icon: Files, label: 'Contenus' },
            { id: 'medias', Icon: Images, label: 'Médias' },
            { id: 'comptes', Icon: UsersRound, label: 'Comptes' },
            { id: 'journal', Icon: History, label: 'Journal' },
            { id: 'notifications', Icon: Mail, label: 'Notifications' },
          ].map(({ id, Icon, label, count }) => (
            <button
              key={id}
              className={`admin-menu-item ${tab === id ? 'active' : ''}`}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => setTab(id)}
            >
              <span>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>
              {label}
              {count ? <i>{count}</i> : null}
            </button>
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
          <button
            onClick={async () => {
              await api('/api/auth/logout', { method: 'POST' });
              setUser('');
            }}
          >
            Déconnexion <ArrowUpRight size={14} />
          </button>
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
            <h1>
              {tab === 'demandes'
                ? 'Demandes'
                : tab === 'avis'
                  ? 'Modération des avis'
                  : tab === 'faq'
                    ? 'Questions fréquentes'
                    : tab === 'medias'
                      ? 'Galerie médias'
                      : tab === 'comptes'
                        ? 'Comptes administrateurs'
                        : tab === 'journal'
                          ? 'Journal d’activité'
                          : tab === 'notifications'
                            ? 'Notifications e-mail'
                            : 'Contenus du site'}
            </h1>
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
              title="Actualiser les données et l’état de l’API"
              onClick={() => {
                void load();
                void checkHealth();
              }}
            >
              ↻
            </button>
          </div>
        </header>
        {error && (
          <div className="admin-error-bar">
            {error}
            <button onClick={() => setError('')}>
              <X size={14} />
            </button>
          </div>
        )}
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
                  <span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span>
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
                    <button onClick={() => updateReview(r.id, 'PUBLISHED')}>
                      <Check size={14} /> Publier
                    </button>
                  )}
                  {r.status !== 'REJECTED' && (
                    <button onClick={() => updateReview(r.id, 'REJECTED')}>Rejeter</button>
                  )}
                  {r.status === 'PUBLISHED' && (
                    <button onClick={() => updateReview(r.id, 'HIDDEN')}>Masquer</button>
                  )}
                  <button onClick={() => void deleteReview(r.id)}>Supprimer</button>
                </div>
              </article>
            ))}
            {!reviews.length && <div className="admin-empty">Aucun avis reçu pour le moment.</div>}
          </div>
        )}
        {tab === 'faq' && (
          <>
            <form className="admin-faq-form" onSubmit={addFaq}>
              <h3>Ajouter une question</h3>
              <input
                value={faqQ}
                onChange={(e) => setFaqQ(e.target.value)}
                placeholder="Question"
                required
              />
              <textarea
                value={faqA}
                onChange={(e) => setFaqA(e.target.value)}
                placeholder="Réponse"
                required
                rows={3}
              />
              <button className="button button-dark">
                Ajouter à la FAQ <ArrowRight size={14} />
              </button>
            </form>
            <div className="admin-faq-list">
              {faqsData.map((f, i) => (
                <article key={f.id}>
                  <span>0{i + 1}</span>
                  <div>
                    <b>{f.question}</b>
                    <p>{f.answer}</p>
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={f.published}
                      onChange={(e) => void updateFaq(f.id, e.target.checked)}
                    />{' '}
                    Publiée
                  </label>
                  <button onClick={() => void deleteFaq(f.id)}>
                    <X size={15} />
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
        {tab === 'contenu' && <AdminContentPanel api={api} onError={setError} />}{' '}
        {tab === 'medias' && <AdminMediaPanel api={api} onError={setError} />}{' '}
        {['comptes', 'journal', 'notifications'].includes(tab) && (
          <AdminOperationsPanel
            section={tab as 'comptes' | 'journal' | 'notifications'}
            api={api}
            onError={setError}
          />
        )}
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
