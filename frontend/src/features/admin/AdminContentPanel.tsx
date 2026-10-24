import { useCallback, useEffect, useState } from 'react';
import { History, Plus, Save, Send, Trash2, Undo2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AdminApi } from '../../shared/api-client.js';

type ContentRecord = Record<string, unknown>;
type ContentBlock = {
  key: string;
  content: ContentRecord;
  publishedContent: ContentRecord | null;
  revision: number;
  publishedAt: string | null;
  updatedAt: string;
};
type Revision = {
  id: string;
  revision: number;
  content: ContentRecord;
  createdAt: string;
  actor?: { email: string } | null;
};
type Props = {
  api: AdminApi;
  contentKey: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

const starterHero = {
  eyebrow: 'COACHING · FOOTBALL · AUTONOMIE',
  title: 'Accompagnement physique & mental.',
  accent: 'À votre rythme.',
  description:
    'Accompagner, c’est cheminer à vos côtés en tenant compte de vos besoins. Que vous soyez sportif ou non, commencez à vous stimuler ou reprenez une activité adaptée à vos capacités, à vos besoins et à votre rythme.',
  location: 'YAA COACHING à Vierzon et alentours ; YAA PLAYER sans limite géographique.',
  buttonLabel: 'Trouver mon accompagnement',
};
const contentBlockLabels: Record<string, string> = {
  hero: 'Accueil',
  services: 'Accompagnements',
  methode: 'Méthode',
  player: 'YAA Player',
  coach: 'Votre coach',
  zones: 'Zones d’intervention',
  contacts: 'Coordonnées',
  closing: 'Conclusion',
  questionnaires: 'Questionnaires',
  method: 'Méthode',
  pillars: 'Axes de travail',
  steps: 'Étapes',
  experiences: 'Expériences',
  photo: 'Photo',
  footer: 'Pied de page',
  contact: 'Contact',
  service: 'Accompagnement',
  media: 'Média',
};
const fieldLabels: Record<string, string> = {
  eyebrow: 'Accroche',
  title: 'Titre',
  accent: 'Titre mis en valeur',
  introduction: 'Introduction',
  description: 'Présentation',
  body: 'Texte',
  location: 'Zone d’intervention',
  buttonLabel: 'Texte du bouton',
  methodTitle: 'Titre de la méthode',
  methodAccent: 'Titre mis en valeur',
  methodEyebrow: 'Accroche de la méthode',
  methodDescription: 'Présentation de la méthode',
  pillarsTitle: 'Titre des axes',
  pillarsAccent: 'Titre mis en valeur',
  pillarsEyebrow: 'Accroche des axes',
  pillarsIntroduction: 'Introduction des axes',
  photoSeal: 'Signature de la photo',
  photoCaption: 'Légende de la photo',
  photoLocation: 'Lieu de la photo',
  callToAction: 'Texte du bouton',
  audience: 'Public concerné',
  serviceLabel: 'Nom de l’accompagnement',
  mediaLabel: 'Mention du média',
  questionnaireSituation: 'Situation du questionnaire',
  contactLabel: 'Texte du contact',
  contactEmail: 'E-mail de contact',
  email: 'Adresse e-mail',
  phone: 'Téléphone',
  phoneLink: 'Lien téléphonique',
  footerCoaching: 'Texte du pied de page · Coaching',
  footerPlayer: 'Texte du pied de page · Player',
  footerSignature: 'Signature du pied de page',
  name: 'Nom',
  slug: 'Identifiant URL',
  type: 'Catégorie',
  zone: 'Zone',
  image: 'Image',
  alt: 'Texte alternatif',
  link: 'Lien',
  label: 'Libellé',
  key: 'Identifiant',
  required: 'Obligatoire',
  options: 'Choix proposés',
  max: 'Nombre maximal de choix',
  condition: 'Condition d’affichage',
  equals: 'Afficher si la réponse vaut',
  notEquals: 'Masquer si la réponse vaut',
  notices: 'Informations à afficher',
  questions: 'Questions',
  steps: 'Étapes',
  items: 'Éléments',
  paragraphs: 'Paragraphes',
  tags: 'Thèmes',
  pillars: 'Axes de travail',
  experiences: 'Expériences',
  questionnaireSituations: 'Situations proposées',
};

function isRecord(value: unknown): value is ContentRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function updateValue(source: unknown, path: (string | number)[], value: unknown): unknown {
  const [key, ...remaining] = path;
  if (key === undefined) return value;
  if (Array.isArray(source)) {
    const result = [...source];
    const index = Number(key);
    result[index] = remaining.length ? updateValue(source[index], remaining, value) : value;
    return result;
  }
  const record = isRecord(source) ? source : {};
  return {
    ...record,
    [key]: remaining.length ? updateValue(record[key], remaining, value) : value,
  };
}

function pathLabel(path: (string | number)[]) {
  return path
    .filter((part): part is string => typeof part === 'string')
    .map(
      (part) =>
        fieldLabels[part] ??
        (/^[A-Z0-9][A-Z0-9 _&-]*$/.test(part)
          ? part
          : part
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (letter) => letter.toLocaleUpperCase('fr-FR'))),
    )
    .join(' · ');
}

function emptyItem(value: unknown, key: string): unknown {
  if (value !== undefined) {
    if (typeof value === 'string') return '';
    if (typeof value === 'number') return 0;
    if (typeof value === 'boolean') return false;
    if (Array.isArray(value)) return [];
    if (isRecord(value))
      return Object.fromEntries(
        Object.keys(value).map((field) => [field, emptyItem(value[field], field)]),
      );
  }
  if (['items', 'steps', 'questions', 'pillars', 'experiences'].includes(key)) return {};
  return '';
}

function ContentValueEditor({
  value,
  path,
  onChange,
}: {
  value: unknown;
  path: (string | number)[];
  onChange: (path: (string | number)[], next: unknown) => void;
}): ReactNode {
  const key = String(path[path.length - 1] ?? '');
  if (Array.isArray(value)) {
    return (
      <fieldset className="admin-content-collection">
        <legend>
          {pathLabel(path)} <small>{value.length}</small>
        </legend>
        <div className="admin-content-collection-list">
          {value.map((item, index) => (
            <div className="admin-content-collection-item" key={`${path.join('.')}-${index}`}>
              <strong className="admin-content-item-title">
                {isRecord(item) && typeof item.title === 'string' && item.title
                  ? item.title
                  : `${pathLabel(path)} · ${index + 1}`}
              </strong>
              <ContentValueEditor value={item} path={[...path, index]} onChange={onChange} />
              <button
                className="admin-content-remove"
                type="button"
                onClick={() =>
                  onChange(
                    path,
                    value.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <Trash2 size={15} /> Supprimer
              </button>
            </div>
          ))}
        </div>
        <button
          className="admin-content-add"
          type="button"
          onClick={() => onChange(path, [...value, emptyItem(value[0], key)])}
        >
          <Plus size={15} /> Ajouter un élément
        </button>
      </fieldset>
    );
  }
  if (isRecord(value)) {
    return (
      <div className="admin-content-object">
        {Object.entries(value).map(([childKey, childValue]) => (
          <ContentValueEditor
            key={[...path, childKey].join('.')}
            value={childValue}
            path={[...path, childKey]}
            onChange={onChange}
          />
        ))}
      </div>
    );
  }
  if (typeof value === 'boolean') {
    return (
      <label className="admin-content-boolean">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />{' '}
        {pathLabel(path)}
      </label>
    );
  }
  const longText =
    typeof value === 'string' &&
    (value.length > 110 || ['description', 'body', 'introduction', 'label'].includes(key));
  return (
    <label className={`field ${longText ? 'field-wide' : ''}`}>
      <span>{pathLabel(path)}</span>
      {longText ? (
        <textarea
          value={String(value ?? '')}
          onChange={(event) => onChange(path, event.target.value)}
          rows={3}
        />
      ) : (
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value === null ? '' : String(value ?? '')}
          onChange={(event) =>
            onChange(
              path,
              typeof value === 'number' ? Number(event.target.value) : event.target.value,
            )
          }
        />
      )}
    </label>
  );
}

export default function AdminContentPanel({ api, contentKey, onError, onSuccess }: Props) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [draft, setDraft] = useState<ContentRecord>(starterHero);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [busy, setBusy] = useState(false);

  const selectedBlock = blocks.find((block) => block.key === contentKey);

  const loadBlocks = useCallback(async () => {
    const result: ContentBlock[] = await api('/api/admin/content');
    setBlocks(result);
  }, [api]);

  useEffect(() => {
    loadBlocks().catch((error: unknown) =>
      onError(error instanceof Error ? error.message : 'Impossible de charger les contenus.'),
    );
  }, [loadBlocks, onError]);

  useEffect(() => {
    const block = blocks.find((item) => item.key === contentKey);
    const nextDraft = block?.content ?? (contentKey === 'hero' ? starterHero : {});
    setDraft(isRecord(nextDraft) ? nextDraft : {});
    setRevisions([]);
  }, [blocks, contentKey]);

  async function save(publish: boolean) {
    setBusy(true);
    try {
      await api(`/api/admin/content/${encodeURIComponent(contentKey)}`, {
        method: 'PUT',
        body: JSON.stringify({ content: draft, publish }),
      });
      await loadBlocks();
      onError('');
      onSuccess(
        publish ? 'Le contenu a été publié sur le site.' : 'Le brouillon a été enregistré.',
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible d’enregistrer le contenu.');
    } finally {
      setBusy(false);
    }
  }

  async function loadRevisions() {
    try {
      const result: Revision[] = await api(
        `/api/admin/content/${encodeURIComponent(contentKey)}/revisions`,
      );
      setRevisions(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de charger l’historique.');
    }
  }

  async function unpublish() {
    setBusy(true);
    try {
      await api(`/api/admin/content/${encodeURIComponent(contentKey)}/publication`, {
        method: 'DELETE',
      });
      await loadBlocks();
      onError('');
      onSuccess('La publication a été retirée du site. Le brouillon est conservé.');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de retirer la publication.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-content-panel" aria-label="Gestion des contenus du site">
      <div className="admin-content-intro">
        <div>
          <p className="eyebrow">CONTENU DE LA PAGE</p>
          <h2>{contentBlockLabels[contentKey] ?? 'Page du site'}</h2>
          <p>Modifiez les textes, les listes et les questions de cette page.</p>
        </div>
        <span className={`content-state ${selectedBlock?.publishedAt ? 'is-published' : ''}`}>
          {selectedBlock?.publishedAt ? 'Publié' : 'Brouillon'}
          {selectedBlock ? ` · Révision ${selectedBlock.revision}` : ''}
        </span>
      </div>

      <div className="admin-content-workspace">
        <div className="admin-content-editor">
          <div className="admin-content-fields admin-content-recursive-fields">
            {Object.entries(draft).map(([key, value]) => (
              <ContentValueEditor
                key={key}
                value={value}
                path={[key]}
                onChange={(path, next) =>
                  setDraft((current) => updateValue(current, path, next) as ContentRecord)
                }
              />
            ))}
            {Object.keys(draft).length === 0 && (
              <p className="admin-content-empty">
                Aucun texte modifiable dans ce bloc. Les données structurées sont conservées.
              </p>
            )}
          </div>

          <div className="admin-content-actions">
            <button className="button button-light" type="button" onClick={loadRevisions}>
              <History size={14} /> Historique
            </button>
            {selectedBlock?.publishedAt && (
              <button
                className="button button-light"
                type="button"
                onClick={unpublish}
                disabled={busy}
              >
                <Undo2 size={14} /> Dépublier
              </button>
            )}
            <button
              className="button button-light"
              type="button"
              onClick={() => save(false)}
              disabled={busy}
            >
              <Save size={14} /> Enregistrer le brouillon
            </button>
            <button
              className="button button-dark"
              type="button"
              onClick={() => save(true)}
              disabled={busy}
            >
              <Send size={14} /> {busy ? 'Enregistrement…' : 'Publier'}
            </button>
          </div>

          {revisions.length > 0 && (
            <div className="admin-content-result">
              <h4>Historique</h4>
              {revisions.map((revision) => (
                <article key={revision.id}>
                  <b>Révision {revision.revision}</b>
                  <span>{new Date(revision.createdAt).toLocaleString('fr-FR')}</span>
                  <small>{revision.actor?.email ?? 'Système'}</small>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
