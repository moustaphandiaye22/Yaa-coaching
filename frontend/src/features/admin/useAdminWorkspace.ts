import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createAdminApi, requestJson } from '../../shared/api-client.js';
import type { AdminFaq, ReviewAdmin, Submission } from './admin-types.js';

export function useAdminWorkspace() {
  const [user, setUser] = useState(''),
    [sessionChecked, setSessionChecked] = useState(false),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [loginPending, setLoginPending] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [tab, setTab] = useState('presentation'),
    [items, setItems] = useState<Submission[]>([]),
    [reviews, setReviews] = useState<ReviewAdmin[]>([]),
    [faqsData, setFaqsData] = useState<AdminFaq[]>([]),
    [selected, setSelected] = useState<Submission | null>(null),
    [detailLoading, setDetailLoading] = useState(false),
    [health, setHealth] = useState<'checking' | 'ready' | 'error'>('checking'),
    [statusFilter, setStatusFilter] = useState(''),
    [query, setQuery] = useState(''),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [faqQ, setFaqQ] = useState(''),
    [faqA, setFaqA] = useState(''),
    [counts, setCounts] = useState({ NEW: 0, PENDING: 0 });
  const api = useMemo(() => createAdminApi(() => setUser('')), []);
  const loadSequence = useRef(0);
  const checkHealth = useCallback(async () => {
    try {
      await requestJson('/api/health');
      await requestJson('/api/ready');
      setHealth('ready');
    } catch {
      setHealth('error');
    }
  }, []);
  useEffect(() => {
    void checkHealth();
    const timer = window.setInterval(() => void checkHealth(), 30000);
    return () => window.clearInterval(timer);
  }, [checkHealth]);
  useEffect(() => {
    api<{ role: string; email: string }>('/api/auth/me')
      .then((d) => {
        if (d.role === 'ADMIN') setUser(d.email);
        else setError('Cet espace est réservé aux comptes administrateurs.');
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true));
  }, [api]);
  const selectedId = selected?.id;
  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    api<Submission>(`/api/admin/submissions/${selectedId}`)
      .then(setSelected)
      .catch((e) => setError(e instanceof Error ? e.message : 'Impossible de charger la demande.'))
      .finally(() => setDetailLoading(false));
  }, [api, selectedId]);
  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    try {
      const [data, newData, rv, faqItems] = await Promise.all([
        api<{ items: Submission[]; total: number }>(
          `/api/admin/submissions?page=${page}&size=50${statusFilter ? `&status=${statusFilter}` : ''}${query.trim() ? `&q=${encodeURIComponent(query.trim())}` : ''}`,
        ),
        api<{ total: number }>('/api/admin/submissions?status=NEW&size=1'),
        api<ReviewAdmin[]>('/api/admin/reviews'),
        api<AdminFaq[]>('/api/admin/faqs'),
      ]);
      if (sequence !== loadSequence.current) return;
      setItems(data.items);
      setTotal(data.total);
      setCounts({
        NEW: newData.total,
        PENDING: rv.filter((x: ReviewAdmin) => x.status === 'PENDING').length,
      });
      setReviews(rv);
      setFaqsData(faqItems);
    } catch (e) {
      if (sequence !== loadSequence.current) return;
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
    }
  }, [api, statusFilter, query, page]);
  useEffect(() => {
    if (user) void load();
  }, [user, load]);
  useEffect(() => {
    if (!user) return;
    const interval = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(interval);
  }, [user, load]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (loginPending) return;
    setError('');
    setLoginPending(true);
    try {
      const d = await api<{ role: string; email: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (d.role !== 'ADMIN') {
        await api('/api/auth/logout', { method: 'POST' });
        throw new Error('Cet espace est réservé aux comptes administrateurs.');
      }
      setUser(d.email);
      setSessionChecked(true);
      setNotice('Connexion réussie. Vous êtes dans l’espace d’administration.');
    } catch (e) {
      setNotice('');
      setError(e instanceof Error ? e.message : 'Connexion impossible');
    } finally {
      setLoginPending(false);
    }
  }
  async function deleteSubmission() {
    if (!selected || !confirm('Supprimer définitivement cette demande et ses données ?'))
      return false;
    try {
      await api(`/api/admin/submissions/${selected.id}`, { method: 'DELETE' });
      setSelected(null);
      await load();
      setError('');
      setNotice('La demande et ses données ont été supprimées.');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
      return false;
    }
  }
  async function updateSubmission(id: string, data: Record<string, unknown>) {
    try {
      await api(`/api/admin/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      await load();
      if (selected) setSelected({ ...selected, ...data });
      setError('');
      setNotice('Les modifications de la demande ont été enregistrées.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  async function updateReview(id: string, status: string) {
    try {
      await api(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
      setError('');
      setNotice(
        status === 'PUBLISHED'
          ? 'L’avis a été publié sur le site.'
          : status === 'REJECTED'
            ? 'L’avis a été rejeté et ne sera pas publié.'
            : 'L’avis a été masqué du site.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  async function deleteReview(id: string) {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    try {
      await api(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      await load();
      setError('');
      setNotice('L’avis a été supprimé.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  }
  async function addFaq(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/api/admin/faqs', {
        method: 'POST',
        body: JSON.stringify({ question: faqQ, answer: faqA, position: faqsData.length }),
      });
      setFaqQ('');
      setFaqA('');
      await load();
      setError('');
      setNotice('La question fréquente a été ajoutée.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  async function updateFaq(id: string, published: boolean) {
    try {
      await api(`/api/admin/faqs/${id}`, { method: 'PATCH', body: JSON.stringify({ published }) });
      await load();
      setError('');
      setNotice(
        published ? 'La question est publiée sur le site.' : 'La question est masquée du site.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Modification impossible');
    }
  }
  async function saveFaq(id: string, question: string, answer: string) {
    try {
      await api(`/api/admin/faqs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ question, answer }),
      });
      await load();
      setError('');
      setNotice('La question et sa réponse ont été mises à jour.');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'La modification de la question a échoué.');
      return false;
    }
  }
  async function deleteFaq(id: string) {
    if (!confirm('Supprimer cette question ?')) return;
    try {
      await api(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      await load();
      setError('');
      setNotice('La question a été supprimée.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  }
  return {
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
  };
}
