export type Service = 'YAA COACHING' | 'YAA PLAYER' | 'YAA AUTONOMIE';
export type Answers = Record<string, string | string[]>;
export type Question = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'multi' | 'email' | 'tel' | 'number';
  required?: boolean;
  min?: number;
  maxValue?: number;
  step?: number;
  options?: string[];
  max?: number;
  condition?: [string, string] | { key: string; equals?: string; notEquals?: string };
};
const configuredApiUrl = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env
  .VITE_API_URL;
export const API = (
  import.meta.env.DEV ? (configuredApiUrl ?? 'http://localhost:3000') : ''
).replace(/\/$/, '');

export const playerMultisportImage = {
  url: '/images/player-multisport.jpg',
  alt: 'Un coach échange avec trois jeunes sportifs pratiquant le tennis et le basket.',
  caption: 'YAA PLAYER : un accompagnement pour les jeunes sportifs de toutes disciplines.',
} as const;

export function mediaUrl(path: string): string {
  const resolvedPath = path === '/images/player.webp' ? playerMultisportImage.url : path;
  return resolvedPath.startsWith('/images/') ? resolvedPath : `${API}${resolvedPath}`;
}
