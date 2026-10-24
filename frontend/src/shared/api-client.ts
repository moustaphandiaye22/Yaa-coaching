import { API } from './site-content.js';

type ApiErrorBody = { error?: string; fields?: Record<string, string[]> };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type AdminApi = <T = unknown>(path: string, options?: RequestInit) => Promise<T>;

export async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers,
      credentials: options.credentials ?? 'same-origin',
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
      0,
    );
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = body as ApiErrorBody | null;
    throw new ApiError(
      error?.error ?? 'La demande n’a pas abouti. Réessayez dans quelques instants.',
      response.status,
      error?.fields,
    );
  }
  return body as T;
}

export function createAdminApi(onUnauthorized: () => void): AdminApi {
  return async function adminApi<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    try {
      return await requestJson<T>(path, {
        ...options,
        credentials: options.credentials ?? 'include',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
      throw error;
    }
  };
}
