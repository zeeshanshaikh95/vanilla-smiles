import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { publicApi } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { normaliseNumber } from '@/lib/whatsapp';
import type { PublicSettings } from '@/types';

const FALLBACK: PublicSettings = {
  businessName: 'Vanilla Smiles',
  tagline: 'Dental & Esthetic Care',
  whatsappNumber: '',
  instagramUrl: 'https://www.instagram.com/vanillasmilesclinic/',
  instagramHandle: 'vanillasmilesclinic',
  email: '',
  city: 'Andheri West, Mumbai',
  mapsUrl: '',
  whatsappTemplate: '',
  whatsappSingleProductTemplate: '',
  heroSlides: [],
  about: { intro: '', story: '', founderImageUrl: '' },
  announcements: { enabled: false, text: '' },
  policies: { shipping: '', returns: '' },
};

interface SettingsContextValue {
  settings: PublicSettings;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  whatsappConfigured: boolean;
  instagramHandle: string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, refetch } = useApi(() => publicApi.getSettings(), []);

  const value = useMemo<SettingsContextValue>(() => {
    const settings = data?.settings ?? FALLBACK;
    return {
      settings,
      loading,
      error,
      refetch,
      whatsappConfigured: normaliseNumber(settings.whatsappNumber).length >= 8,
      instagramHandle: settings.instagramHandle.replace(/^@/, ''),
    };
  }, [data, loading, error, refetch]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
}
