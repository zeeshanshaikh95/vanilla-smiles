import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';

export function usePageView(): void {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    trackEvent({ type: 'page_view', path: location.pathname });
  }, [location.pathname]);
}
