import { api } from '@/api/client';
import { isDemoCatalogue } from '@/api/demo';

const SESSION_KEY = 'hn.session';

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return 'anonymous';
  }
}

export interface TrackPayload {
  type: 'page_view' | 'product_view' | 'whatsapp_click' | 'cart_add' | 'order_whatsapp_click';
  productSlug?: string;
  path?: string;
}

/** Fire-and-forget: analytics must never break the storefront. */
export function trackEvent(payload: TrackPayload): void {
  // The static preview has no API; don't fire doomed requests from it.
  if (isDemoCatalogue()) return;
  const body = {
    ...payload,
    path: payload.path ?? window.location.pathname,
    referrer: document.referrer ? new URL(document.referrer).hostname : '',
    sessionId: sessionId(),
  };
  api.post('/analytics/events', body).catch(() => undefined);
}
