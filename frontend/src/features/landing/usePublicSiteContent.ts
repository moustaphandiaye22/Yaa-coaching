import { useEffect, useState } from 'react';
import { requestJson } from '../../shared/api-client.js';
import { useServiceCatalog } from '../../shared/service-catalog.js';

type HeroContent = Record<string, unknown>;
export type PublicMedia = {
  id: string;
  kind: 'PHOTO' | 'VIDEO';
  service: string;
  url: string;
  alt: string;
  caption: string;
  position: number;
};

export function usePublicSiteContent() {
  const [heroContent, setHeroContent] = useState<HeroContent>({});
  const [contentBlocks, setContentBlocks] = useState<Record<string, HeroContent>>({});
  const [extraContent, setExtraContent] = useState<{ key: string; title: string; body: string }[]>(
    [],
  );
  const [publicMedia, setPublicMedia] = useState<PublicMedia[]>([]);
  const [contentStatus, setContentStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [contentRequest, setContentRequest] = useState(0);
  const serviceContent = useServiceCatalog();

  useEffect(() => {
    setContentStatus('loading');
    requestJson<{ key: string; content: HeroContent }[]>('/api/public/site')
      .then((blocks) => {
        if (!Array.isArray(blocks) || !blocks.some((block) => block.key === 'hero')) {
          throw new Error('Contenu public incomplet.');
        }
        setContentBlocks(
          Object.fromEntries(
            blocks
              .filter((block) => block.content && typeof block.content === 'object')
              .map((block) => [block.key, block.content]),
          ),
        );
        const hero = blocks.find((block) => block.key === 'hero');
        if (hero?.content && typeof hero.content === 'object') setHeroContent(hero.content);
        setExtraContent(
          blocks
            .filter(
              (block) =>
                ![
                  'hero',
                  'services',
                  'questionnaires',
                  'methode',
                  'player',
                  'coach',
                  'zones',
                  'contacts',
                  'closing',
                ].includes(block.key) &&
                block.content &&
                typeof block.content === 'object',
            )
            .flatMap((block) => {
              const title = block.content.title;
              const body = block.content.description ?? block.content.body;
              return typeof title === 'string' && typeof body === 'string'
                ? [{ key: block.key, title, body }]
                : [];
            }),
        );
        setContentStatus('ready');
      })
      .catch(() => setContentStatus('error'));
  }, [contentRequest]);

  useEffect(() => {
    requestJson<PublicMedia[]>('/api/public/media')
      .then((items) => setPublicMedia(Array.isArray(items) ? items : []))
      .catch(() => setPublicMedia([]));
  }, []);

  const heroValue = (key: string) =>
    typeof heroContent[key] === 'string' ? (heroContent[key] as string) : '';
  const contentFor = (key: string) => contentBlocks[key] ?? {};
  const mediaFor = (service: string) =>
    publicMedia.find((item) => item.kind === 'PHOTO' && item.service === service);

  return {
    heroValue,
    contentFor,
    extraContent,
    publicMedia,
    serviceContent,
    mediaFor,
    contentStatus,
    reloadContent: () => setContentRequest((current) => current + 1),
  };
}
