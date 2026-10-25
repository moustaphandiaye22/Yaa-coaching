import { useEffect, useState } from 'react';
import { requestJson } from './api-client.js';
import type { Service } from './site-content.js';

export type ServiceData = {
  name: Service;
  slug: string;
  tag: string;
  heading: string;
  body: string;
  zone: string;
  presentation?: string;
  offerHighlight?: string;
  offerDetails?: string;
  image: string;
  alt: string;
  accent: string;
  link: string;
  questionnaireSituations: string[];
};

type ServiceRecord = {
  name: Service;
  slug: string;
  type: string;
  title: string;
  description: string;
  zone: string;
  presentation?: string;
  offerHighlight?: string;
  offerDetails?: string;
  image: string;
  alt: string;
  accent: string;
  link: string;
  questionnaireSituations: string[];
};

export function useServiceCatalog() {
  const [services, setServices] = useState<ServiceData[]>([]);

  useEffect(() => {
    requestJson<ServiceRecord[]>('/api/public/services')
      .then((records) => {
        if (!Array.isArray(records)) return;
        setServices(
          records.map((record) => ({
            name: record.name,
            slug: record.slug,
            tag: record.type,
            heading: record.title,
            body: record.description,
            zone: record.zone,
            presentation: record.presentation,
            offerHighlight: record.offerHighlight,
            offerDetails: record.offerDetails,
            image: record.image,
            alt: record.alt,
            accent: record.accent,
            link: record.link,
            questionnaireSituations: record.questionnaireSituations,
          })),
        );
      })
      .catch(() => setServices([]));
  }, []);

  return services;
}
