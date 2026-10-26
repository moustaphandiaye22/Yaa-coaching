export const defaultSocialLinks = {
  instagramUrl: 'https://www.instagram.com/yaa_coaching_by_yakhouba/',
  tiktokUrl: 'https://www.tiktok.com/@yaacoaching29',
  facebookUrl: 'https://www.facebook.com/p/Yaa-Coaching-by-Yakhouba-100063732535020/',
  linkedinUrl: 'https://www.linkedin.com/in/yaa-coaching-coaching-physique-et-mental-509a97363/',
  whatsappUrl: 'https://wa.me/33652281155',
} as const;

export type SocialLinkKey = keyof typeof defaultSocialLinks;

export function safeSocialUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}
