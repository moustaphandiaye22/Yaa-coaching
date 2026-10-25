export const funnelLinks = {
  offers: 'https://yanmane29.systeme.io/2de320c2',
  coaching: 'https://yanmane29.systeme.io/7a84d4ba',
  player: 'https://yanmane29.systeme.io/bilan-yaa-player',
  autonomie: 'https://yanmane29.systeme.io/5b366a13',
  autonomieBilan: 'https://yanmane29.systeme.io/dabd2704',
} as const;

export function funnelLinkForService(slug: string) {
  switch (slug) {
    case 'coaching':
      return funnelLinks.coaching;
    case 'player':
      return funnelLinks.player;
    case 'autonomie':
      return funnelLinks.autonomie;
    default:
      return funnelLinks.offers;
  }
}
