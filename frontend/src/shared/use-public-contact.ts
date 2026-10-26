import { useEffect, useState } from 'react';
import { requestJson } from './api-client.js';
import { defaultSocialLinks } from './social-links.js';

type ContactDetails = {
  email: string;
  phone: string;
  phoneLink: string;
  footerCoaching: string;
  footerPlayer: string;
  footerSignature: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  whatsappUrl: string;
};

export function usePublicContact() {
  const [contact, setContact] = useState<ContactDetails>({
    email: '',
    phone: '',
    phoneLink: '',
    footerCoaching: '',
    footerPlayer: '',
    footerSignature: '',
    ...defaultSocialLinks,
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
          instagramUrl: typeof content.instagramUrl === 'string' ? content.instagramUrl : defaultSocialLinks.instagramUrl,
          tiktokUrl: typeof content.tiktokUrl === 'string' ? content.tiktokUrl : defaultSocialLinks.tiktokUrl,
          facebookUrl: typeof content.facebookUrl === 'string' ? content.facebookUrl : defaultSocialLinks.facebookUrl,
          linkedinUrl: typeof content.linkedinUrl === 'string' ? content.linkedinUrl : defaultSocialLinks.linkedinUrl,
          whatsappUrl: typeof content.whatsappUrl === 'string' ? content.whatsappUrl : defaultSocialLinks.whatsappUrl,
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
          ...defaultSocialLinks,
        }),
      );
  }, []);

  return contact;
}
