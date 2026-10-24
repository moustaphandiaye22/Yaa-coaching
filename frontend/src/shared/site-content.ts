export type Service = 'YAA COACHING' | 'YAA PLAYER' | 'YAA AUTONOMIE';
export type Answers = Record<string, string | string[]>;
export type Question = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'multi' | 'email' | 'tel';
  required?: boolean;
  options?: string[];
  max?: number;
  condition?: [string, string] | { key: string; equals?: string; notEquals?: string };
};
export const API = (
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:3000' : '')
).replace(/\/$/, '');

export function mediaUrl(path: string): string {
  return path.startsWith('/images/') ? path : `${API}${path}`;
}
