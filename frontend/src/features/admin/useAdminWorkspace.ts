import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAdminApi, requestJson } from '../../shared/api-client.js';
import type { AdminFaq, ReviewAdmin, Submission } from './admin-types.js';

export function useAdminWorkspace() {
  const [user, setUser] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [tab, setTab] = useState('demandes'),
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
      .catch(() => {});
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
    try {
      const [data, newData, rv, faqItems] = await Promise.all([
        api<{ items: Submission[]; total: number }>(
          `/api/admin/submissions?page=${page}&size=50${statusFilter ? `&status=${statusFilter}` : ''}${query ? `&q=${encodeURIComponent(query)}` : ''}`,
        ),
        api<{ total: number }>('/api/admin/submissions?status=NEW&size=1'),
        api<ReviewAdmin[]>('/api/admin/reviews'),
        api<AdminFaq[]>('/api/admin/faqs'),
      ]);
      setItems(data.items);
      setTotal(data.total);
      setCounts({
        NEW: newData.total,
        PENDING: rv.filter((x: ReviewAdmin) => x.status === 'PENDING').length,
      });
      setReviews(rv);
      setFaqsData(faqItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
    }
  }, [api, statusFilter, query, page]);
  useEffect(() => {
    if (user) void load();
  }, [user, load]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError('');
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible');
    }
  }
  async function deleteSubmission() {
    if (!selected || !confirm('Supprimer définitivement cette demande et ses données ?')) return;
    try {
      await api(`/api/admin/submissions/${selected.id}`, { method: 'DELETE' });
      setSelected(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  }
  async function updateSubmission(id: string, data: Record<string, unknown>) {
    try {
      await api(`/api/admin/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      await load();
      if (selected) setSelected({ ...selected, ...data });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  async function updateReview(id: string, status: string) {
    try {
      await api(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  async function deleteReview(id: string) {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    try {
      await api(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      await load();
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  async function updateFaq(id: string, published: boolean) {
    try {
      await api(`/api/admin/faqs/${id}`, { method: 'PATCH', body: JSON.stringify({ published }) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Modification impossible');
    }
  }
  async function deleteFaq(id: string) {
    if (!confirm('Supprimer cette question ?')) return;
    try {
      await api(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  }
  return {
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
  };
}
