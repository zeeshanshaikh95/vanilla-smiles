// CI passes an empty string when the repository variable is unset; `??` alone
// would then build a URL from "" and throw before the app mounts.
const RAW_BASE =
  (import.meta.env.VITE_API_URL ?? '').trim() || 'http://localhost:4000/api';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');
export const API_ORIGIN = new URL(API_BASE).origin;

const TOKEN_KEY = 'hn.admin.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable — session stays in memory only */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiRequestError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(status: number, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiRequestError(0, 'Cannot reach the API. Is the server running?');
  }

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : 'Something went wrong.';
    const details = Array.isArray(payload.details)
      ? (payload.details as Array<{ field: string; message: string }>)
      : undefined;
    throw new ApiRequestError(response.status, message, details);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
};

/** Server-stored uploads resolve against the API origin; bundled art against the SPA base. */
export function resolveAssetUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  // Already resolved (or served from the site root) — never prefix twice.
  if (!base || url === base || url.startsWith(`${base}/`)) return url;
  return `${base}${url}`;
}
