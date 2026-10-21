import { useCallback, useEffect, useState } from 'react';
import { Eye, History, Plus, Save, Send, Undo2 } from 'lucide-react';

type ContentRecord = Record<string, unknown>;
type ContentBlock = {
  key: string;
  content: ContentRecord;
  publishedContent: ContentRecord | null;
  revision: number;
  publishedAt: string | null;
  updatedAt: string;
};
type Revision = { id: string; revision: number; content: ContentRecord; createdAt: string; actor?: { email: string } | null };
type AdminApi = (path: string, options?: RequestInit) => Promise<any>;
type Props = { api: AdminApi; onError: (message: string) => void };

const starterHero = {
  eyebrow: 'COACHING · FOOTBALL · AUTONOMIE',
  title: 'Accompagnement physique & mental.',
  accent: 'À votre rythme.',
  description: 'Accompagner, c’est cheminer à vos côtés en tenant compte de vos besoins. Que vous soyez sportif ou non, commencez à vous stimuler ou reprenez une activité adaptée à vos capacités, à vos besoins et à votre rythme.',
  location: 'YAA COACHING à Vierzon et alentours ; YAA PLAYER sans limite géographique.',
  buttonLabel: 'Trouver mon accompagnement',
};

function isRecord(value: unknown): value is ContentRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export default function AdminContentPanel({ api, onError }: Props) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedKey, setSelectedKey] = useState('hero');
  const [draft, setDraft] = useState<ContentRecord>(starterHero);
  const [jsonDraft, setJsonDraft] = useState('');
  const [newKey, setNewKey] = useState('');
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [preview, setPreview] = useState<ContentRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedBlock = blocks.find((block) => block.key === selectedKey);
  const isHero = selectedKey === 'hero';

  const loadBlocks = useCallback(async () => {
    const result: ContentBlock[] = await api('/api/admin/content');
    setBlocks(result);
  }, [api]);

  useEffect(() => {
    loadBlocks().catch((error: unknown) => onError(error instanceof Error ? error.message : 'Impossible de charger les contenus.'));
  }, [loadBlocks, onError]);

  useEffect(() => {
    const block = blocks.find((item) => item.key === selectedKey);
    const nextDraft = block?.content ?? (selectedKey === 'hero' ? starterHero : { title: '' });
    setDraft(isRecord(nextDraft) ? nextDraft : {});
    setJsonDraft(JSON.stringify(isRecord(nextDraft) ? nextDraft : {}, null, 2));
    setPreview(null);
    setRevisions([]);
  }, [blocks, selectedKey]);

  function updateHero(field: string, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save(publish: boolean) {
    let content = draft;
    if (!isHero) {
      try {
        const parsed: unknown = JSON.parse(jsonDraft);
        if (!isRecord(parsed) || !Object.keys(parsed).length) throw new Error('Le bloc doit être un objet JSON non vide.');
        content = parsed;
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Le JSON du bloc est invalide.');
        return;
      }
    }

    setBusy(true);
    try {
      await api(`/api/admin/content/${encodeURIComponent(selectedKey)}`, {
        method: 'PUT',
        body: JSON.stringify({ content, publish }),
      });
      await loadBlocks();
      onError('');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible d’enregistrer le contenu.');
    } finally {
      setBusy(false);
    }
  }

  async function createBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = newKey.trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]{1,63}$/.test(key)) {
      onError('Identifiant invalide : utilisez au moins 2 lettres, chiffres ou tirets, en commençant par une lettre.');
      return;
    }
    setSelectedKey(key);
    setNewKey('');
    if (key !== selectedKey) setJsonDraft('{"title":""}');
  }

  async function loadPreview() {
    try {
      const result = await api(`/api/admin/content/${encodeURIComponent(selectedKey)}/preview`);
      setPreview(isRecord(result.content) ? result.content : {});
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Aucun brouillon à prévisualiser.');
    }
  }

  async function loadRevisions() {
    try {
      const result: Revision[] = await api(`/api/admin/content/${encodeURIComponent(selectedKey)}/revisions`);
      setRevisions(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de charger l’historique.');
    }
  }

  async function unpublish() {
    setBusy(true);
    try {
      await api(`/api/admin/content/${encodeURIComponent(selectedKey)}/publication`, { method: 'DELETE' });
      await loadBlocks();
      onError('');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de retirer la publication.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-content-panel" aria-label="Gestion des contenus du site">
      <div className="admin-content-intro">
        <div><p className="eyebrow">CONTENU PUBLIC</p><h2>Le site, avec vos mots.</h2><p>Modifiez un brouillon, prévisualisez-le, puis publiez-le quand il est prêt.</p></div>
        <span className={`content-state ${selectedBlock?.publishedAt ? 'is-published' : ''}`}>{selectedBlock?.publishedAt ? 'Publié' : 'Brouillon'}</span>
      </div>

      <form className="admin-content-create" onSubmit={createBlock}>
        <label htmlFor="new-content-key">Créer un bloc</label>
        <input id="new-content-key" value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="ex. methode" pattern="[a-z][a-z0-9-]{1,63}" maxLength={64} required />
        <button className="button button-light" type="submit"><Plus size={14} /> Nouveau bloc</button>
      </form>

      <div className="admin-content-workspace">
        <aside className="admin-content-block-list" aria-label="Blocs disponibles">
          <button type="button" className={`content-block-choice ${selectedKey === 'hero' ? 'active' : ''}`} onClick={() => setSelectedKey('hero')}>
            <span>Accueil</span><small>hero</small>
          </button>
          {blocks.filter((block) => block.key !== 'hero').map((block) => (
            <button type="button" key={block.key} className={`content-block-choice ${selectedKey === block.key ? 'active' : ''}`} onClick={() => setSelectedKey(block.key)}>
              <span>{block.key}</span><small>{block.publishedAt ? 'Publié' : 'Brouillon'}</small>
            </button>
          ))}
        </aside>

        <div className="admin-content-editor">
          <div className="admin-content-editor-head"><div><small>BLOC SÉLECTIONNÉ</small><h3>{selectedKey}</h3></div><span>Révision {selectedBlock?.revision ?? 0}</span></div>
          {isHero ? (
            <div className="admin-content-fields">
              <label className="field"><span>Accroche</span><input value={String(draft.eyebrow ?? '')} onChange={(event) => updateHero('eyebrow', event.target.value)} maxLength={120} /></label>
              <label className="field"><span>Titre principal</span><input value={String(draft.title ?? '')} onChange={(event) => updateHero('title', event.target.value)} maxLength={180} /></label>
              <label className="field"><span>Titre mis en valeur</span><input value={String(draft.accent ?? '')} onChange={(event) => updateHero('accent', event.target.value)} maxLength={120} /></label>
              <label className="field field-wide"><span>Présentation</span><textarea value={String(draft.description ?? '')} onChange={(event) => updateHero('description', event.target.value)} rows={4} maxLength={1200} /></label>
              <label className="field field-wide"><span>Zone d’intervention</span><input value={String(draft.location ?? '')} onChange={(event) => updateHero('location', event.target.value)} maxLength={240} /></label>
              <label className="field field-wide"><span>Texte du bouton</span><input value={String(draft.buttonLabel ?? '')} onChange={(event) => updateHero('buttonLabel', event.target.value)} maxLength={80} /></label>
            </div>
          ) : (
            <label className="field admin-content-json"><span>Contenu JSON</span><textarea value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} rows={14} spellCheck={false} /></label>
          )}

          <div className="admin-content-actions">
            <button className="button button-light" type="button" onClick={loadPreview}><Eye size={14} /> Prévisualiser</button>
            <button className="button button-light" type="button" onClick={loadRevisions}><History size={14} /> Historique</button>
            {selectedBlock?.publishedAt && <button className="button button-light" type="button" onClick={unpublish} disabled={busy}><Undo2 size={14} /> Dépublier</button>}
            <button className="button button-light" type="button" onClick={() => save(false)} disabled={busy}><Save size={14} /> Enregistrer le brouillon</button>
            <button className="button button-dark" type="button" onClick={() => save(true)} disabled={busy}><Send size={14} /> {busy ? 'Enregistrement…' : 'Publier'}</button>
          </div>

          {preview && <div className="admin-content-result"><h4>Prévisualisation du brouillon</h4><pre>{JSON.stringify(preview, null, 2)}</pre></div>}
          {revisions.length > 0 && <div className="admin-content-result"><h4>Historique</h4>{revisions.map((revision) => <article key={revision.id}><b>Révision {revision.revision}</b><span>{new Date(revision.createdAt).toLocaleString('fr-FR')}</span><small>{revision.actor?.email ?? 'Système'}</small></article>)}</div>}
        </div>
      </div>
    </section>
  );
}
