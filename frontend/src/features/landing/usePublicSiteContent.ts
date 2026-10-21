import { useEffect, useState } from 'react';
import { requestJson } from '../../shared/api-client.js';
import { services } from '../../shared/service-catalog.js';

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
  const [extraContent, setExtraContent] = useState<{ key: string; title: string; body: string }[]>(
    [],
  );
  const [publicMedia, setPublicMedia] = useState<PublicMedia[]>([]);
  const [serviceContent, setServiceContent] = useState(services);

  useEffect(() => {
    requestJson<{ key: string; content: HeroContent }[]>('/api/public/site')
      .then((blocks) => {
        if (!Array.isArray(blocks)) return;
        const hero = blocks.find((block) => block.key === 'hero');
        if (hero?.content && typeof hero.content === 'object') setHeroContent(hero.content);
        setExtraContent(
          blocks
            .filter(
              (block) => block.key !== 'hero' && block.content && typeof block.content === 'object',
            )
            .flatMap((block) => {
              const title = block.content.title;
              const body = block.content.description ?? block.content.body;
              return typeof title === 'string' && typeof body === 'string'
                ? [{ key: block.key, title, body }]
                : [];
            }),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    requestJson<PublicMedia[]>('/api/public/media')
      .then((items) => setPublicMedia(Array.isArray(items) ? items : []))
      .catch(() => setPublicMedia([]));
  }, []);

  useEffect(() => {
    requestJson<{ name: string; type: string; title: string; zone: string; description: string }[]>(
      '/api/public/services',
    )
      .then((items) => {
        if (!Array.isArray(items)) return;
        setServiceContent((current) =>
          current.map((service) => {
            const source = items.find((item) => item.name === service.name);
            return source
              ? {
                  ...service,
                  tag: source.type,
                  heading: source.title,
                  zone: source.zone,
                  body: source.description,
                }
              : service;
          }),
        );
      })
      .catch(() => {});
  }, []);

  const heroValue = (key: string, fallback: string) =>
    typeof heroContent[key] === 'string' ? (heroContent[key] as string) : fallback;
  const mediaFor = (service: string) =>
    publicMedia.find((item) => item.kind === 'PHOTO' && item.service === service);

  return { heroValue, extraContent, publicMedia, serviceContent, mediaFor };
}
