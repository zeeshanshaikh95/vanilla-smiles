import { useSettings } from '@/context/SettingsContext';
import { buildOrderLink, buildSingleProductMessage, normaliseNumber } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

export function OrderFloat() {
  const { settings } = useSettings();
  const whatsapp = normaliseNumber(settings.whatsappNumber);
  const link = buildOrderLink(
    settings,
    buildSingleProductMessage(settings, {
      productName: 'a consultation',
      variantName: null,
      quantity: 1,
      price: null,
    })
  );

  if (!link) return null;

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent({ type: 'order_whatsapp_click' })}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-teal-800 bg-teal-800 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide2 text-ivory shadow-lift transition-colors hover:bg-ivory hover:text-teal-800 sm:bottom-8 sm:right-8"
    >
      {link.channel === 'whatsapp' ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2zm4.5 12c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.1-.7 3.4.6 1.7 2 3.3 3.6 4.2 1.7.9 2.9 1.1 3.9.8.6-.2 1.4-.7 1.6-1.3.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.3z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      )}
      {link.channel === 'whatsapp' && whatsapp ? 'Book on WhatsApp' : 'Book a visit'}
    </a>
  );
}
