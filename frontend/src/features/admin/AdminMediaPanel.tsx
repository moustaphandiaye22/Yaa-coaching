import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { API } from '../../shared/site-content.js';
import { services } from '../services/service-catalog.js';

type MediaItem = {
  id: string;
  kind: 'PHOTO' | 'VIDEO';
  service: string;
  url: string;
  alt: string;
  caption: string;
  position: number;
  published: boolean;
};
type AdminApi = (path: string, options?: RequestInit) => Promise<any>;
type Props = { api: AdminApi; onError: (message: string) => void };

export default function AdminMediaPanel({ api, onError }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [service, setService] = useState('YAA COACHING');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result: MediaItem[] = await api('/api/admin/media');
    setItems(result);
  }, [api]);

  useEffect(() => {
    load().catch((error: unknown) => onError(error instanceof Error ? error.message : 'Impossible de charger les médias.'));
  }, [api, onError]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      onError('Choisissez une photo ou une vidéo à téléverser.');
      return;
    }

    const kind = file.type.startsWith('video/') ? 'VIDEO' : 'PHOTO';
    setBusy(true);
    try {
      const uploadResponse = await fetch(`${API}/api/admin/media/upload?kind=${kind}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const uploaded = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) throw new Error(uploaded.error ?? 'Le téléversement a échoué.');

      await api('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({ kind, service, url: uploaded.url, alt, caption, position: items.length, published: false }),
      });
      setFile(null);
      setAlt('');
      setCaption('');
      const input = document.getElementById('media-file') as HTMLInputElement | null;
      if (input) input.value = '';
      await load();
      onError('');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible d’enregistrer ce média.');
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(item: MediaItem) {
    try {
      await api(`/api/admin/media/${item.id}`, { method: 'PATCH', body: JSON.stringify({ published: !item.published }) });
      await load();
      onError('');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de modifier la publication.');
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Supprimer ce média (${item.alt}) ?`)) return;
    try {
      await api(`/api/admin/media/${item.id}`, { method: 'DELETE' });
      await load();
      onError('');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de supprimer ce média.');
    }
  }

  return (
    <section className="admin-media-panel" aria-label="Gestion de la galerie">
      <div className="admin-content-intro">
        <div><p className="eyebrow">GALERIE PUBLIQUE</p><h2>Photos et vidéos.</h2><p>Ajoutez des médias, puis publiez-les lorsqu’ils sont prêts à apparaître sur le site.</p></div>
        <span className="content-state">{items.length} média{items.length === 1 ? '' : 's'}</span>
      </div>

      <form className="admin-media-upload" onSubmit={upload}>
        <h3><ImagePlus size={17} /> Ajouter un média</h3>
        <label className="field field-wide" htmlFor="media-file"><span>Fichier · photo (10 Mo max.) ou vidéo (100 Mo max.)</span><input id="media-file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
        <label className="field"><span>Accompagnement</span><select value={service} onChange={(event) => setService(event.target.value)}>{services.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
        <label className="field"><span>Texte alternatif pour l’accessibilité</span><input value={alt} onChange={(event) => setAlt(event.target.value)} minLength={3} maxLength={300} required placeholder="Décrivez ce que montre le média" /></label>
        <label className="field field-wide"><span>Légende (facultative)</span><input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={500} /></label>
        <button className="button button-dark" disabled={busy || !file}><Upload size={15} /> {busy ? 'Téléversement…' : 'Téléverser en brouillon'}</button>
      </form>

      {items.length === 0 ? (
        <div className="admin-empty">Aucun média n’a encore été ajouté.</div>
      ) : (
        <div className="admin-media-grid">
          {items.map((item) => (
            <article key={item.id} className="admin-media-card">
              <div className="admin-media-preview">
                {item.kind === 'PHOTO'
                  ? <img src={`${API}${item.url}`} alt={item.alt} />
                  : <video src={`${API}${item.url}`} controls preload="metadata" aria-label={item.alt} />}
              </div>
              <div className="admin-media-card-body">
                <strong>{item.service}</strong><p>{item.caption || item.alt}</p>
                <div className="admin-media-actions"><label><input type="checkbox" checked={item.published} onChange={() => togglePublished(item)} /> Publié</label><button type="button" aria-label={`Supprimer ${item.alt}`} onClick={() => remove(item)}><Trash2 size={15} /></button></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
