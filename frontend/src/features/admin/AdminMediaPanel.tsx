import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { mediaUrl } from '../../shared/site-content.js';
import { requestJson } from '../../shared/api-client.js';
import type { AdminApi } from '../../shared/api-client.js';
import { useServiceCatalog } from '../../shared/service-catalog.js';

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
type Props = {
  api: AdminApi;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

export default function AdminMediaPanel({ api, onError, onSuccess }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [service, setService] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const services = useServiceCatalog();

  const load = useCallback(async () => {
    const result: MediaItem[] = await api('/api/admin/media');
    setItems(result);
  }, [api]);

  useEffect(() => {
    load().catch((error: unknown) =>
      onError(error instanceof Error ? error.message : 'Impossible de charger les médias.'),
    );
  }, [load, onError]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      onError('Choisissez une photo ou une vidéo à téléverser.');
      return;
    }

    const photoTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm'];
    const kind = videoTypes.includes(file.type) ? 'VIDEO' : 'PHOTO';
    if (!photoTypes.includes(file.type) && !videoTypes.includes(file.type)) {
      onError(
        'Format non accepté. Choisissez une image JPEG, PNG ou WebP, ou une vidéo MP4 ou WebM.',
      );
      return;
    }
    const maximumSize = kind === 'PHOTO' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maximumSize) {
      onError(
        `Le fichier dépasse la limite de ${kind === 'PHOTO' ? '10 Mo' : '100 Mo'}. Choisissez un fichier plus léger.`,
      );
      return;
    }
    setBusy(true);
    try {
      const uploaded = await requestJson<{ url: string }>(`/api/admin/media/upload?kind=${kind}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await api('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          kind,
          service,
          url: uploaded.url,
          alt,
          caption,
          position: items.length,
          published: false,
        }),
      });
      setFile(null);
      setAlt('');
      setCaption('');
      const input = document.getElementById('media-file') as HTMLInputElement | null;
      if (input) input.value = '';
      await load();
      onError('');
      onSuccess('Le média a été téléversé et enregistré comme brouillon.');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible d’enregistrer ce média.');
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(item: MediaItem) {
    try {
      await api(`/api/admin/media/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !item.published }),
      });
      await load();
      onError('');
      onSuccess(
        item.published
          ? 'Le média a été retiré du site.'
          : 'Le média est maintenant publié sur le site.',
      );
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
      onSuccess('Le média a été supprimé.');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de supprimer ce média.');
    }
  }

  return (
    <section className="admin-media-panel" aria-label="Gestion de la galerie">
      <div className="admin-content-intro">
        <div>
          <p className="eyebrow">GALERIE PUBLIQUE</p>
          <p>
            Ajoutez des médias, puis publiez-les lorsqu’ils sont prêts à apparaître sur le site.
          </p>
        </div>
        <span className="content-state">
          {items.length} média{items.length === 1 ? '' : 's'}
        </span>
      </div>

      <form className="admin-media-upload" onSubmit={upload}>
        <h3>
          <ImagePlus size={17} /> Ajouter un média
        </h3>
        <label className="field field-wide" htmlFor="media-file">
          <span>Fichier · photo (10 Mo max.) ou vidéo (100 Mo max.)</span>
          <input
            id="media-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            required
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="field">
          <span>Accompagnement</span>
          <select value={service} onChange={(event) => setService(event.target.value)} required>
            <option value="">Choisissez un accompagnement</option>
            {services.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Texte alternatif pour l’accessibilité</span>
          <input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            minLength={3}
            maxLength={300}
            required
            placeholder="Décrivez ce que montre le média"
          />
        </label>
        <label className="field field-wide">
          <span>Légende (facultative)</span>
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={500}
          />
        </label>
        <button className="button button-dark" disabled={busy || !file || !service}>
          <Upload size={15} /> {busy ? 'Téléversement…' : 'Téléverser en brouillon'}
        </button>
      </form>

      {items.length === 0 ? (
        <div className="admin-empty">Aucun média n’a encore été ajouté.</div>
      ) : (
        <div className="admin-media-grid">
          {items.map((item) => (
            <article key={item.id} className="admin-media-card">
              <div className="admin-media-preview">
                {item.kind === 'PHOTO' ? (
                  <img src={mediaUrl(item.url)} alt={item.alt} />
                ) : (
                  <video
                    src={mediaUrl(item.url)}
                    controls
                    preload="metadata"
                    aria-label={item.alt}
                  />
                )}
              </div>
              <div className="admin-media-card-body">
                <strong>{item.service}</strong>
                <p>{item.caption || item.alt}</p>
                <div className="admin-media-actions">
                  <label>
                    <input
                      type="checkbox"
                      checked={item.published}
                      onChange={() => togglePublished(item)}
                    />{' '}
                    Publié
                  </label>
                  <button
                    type="button"
                    aria-label={`Supprimer ${item.alt}`}
                    onClick={() => remove(item)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
