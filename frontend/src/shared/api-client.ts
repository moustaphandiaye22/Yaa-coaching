import { API } from './site-content.js';

type ApiErrorBody = { error?: string };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
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
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
    credentials: options.credentials ?? 'same-origin',
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = body as ApiErrorBody | null;
    throw new ApiError(error?.error ?? 'Une erreur est survenue.', response.status);
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
