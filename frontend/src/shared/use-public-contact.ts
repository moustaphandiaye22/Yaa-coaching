import { useEffect, useState } from 'react';
import { requestJson } from './api-client.js';

type ContactDetails = {
  email: string;
  phone: string;
  phoneLink: string;
  footerCoaching: string;
  footerPlayer: string;
  footerSignature: string;
};

export function usePublicContact() {
  const [contact, setContact] = useState<ContactDetails>({
    email: '',
    phone: '',
    phoneLink: '',
    footerCoaching: '',
    footerPlayer: '',
    footerSignature: '',
  });

  useEffect(() => {
    requestJson<{ key: string; content: Record<string, unknown> }[]>('/api/public/site')
      .then((blocks) => {
        const content = blocks.find((block) => block.key === 'contacts')?.content;
        if (!content) return;
        setContact({
          email: typeof content.email === 'string' ? content.email : '',
          phone: typeof content.phone === 'string' ? content.phone : '',
          phoneLink: typeof content.phoneLink === 'string' ? content.phoneLink : '',
          footerCoaching: typeof content.footerCoaching === 'string' ? content.footerCoaching : '',
          footerPlayer: typeof content.footerPlayer === 'string' ? content.footerPlayer : '',
          footerSignature:
            typeof content.footerSignature === 'string' ? content.footerSignature : '',
        });
      })
      .catch(() =>
        setContact({
          email: '',
          phone: '',
          phoneLink: '',
          footerCoaching: '',
          footerPlayer: '',
          footerSignature: '',
        }),
      );
  }, []);

  return contact;
}
