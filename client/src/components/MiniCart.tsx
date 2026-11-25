import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/lib/format';
import { buildOrderLink, buildOrderMessage } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

export function MiniCart() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal, count, clear } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const link = items.length ? buildOrderLink(settings, buildOrderMessage(settings, items)) : null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Appointment list">
      <button
        type="button"
        aria-label="Close appointment list"
        onClick={closeCart}
        className="absolute inset-0 bg-teal-900/40 backdrop-blur-[2px]"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-bone shadow-panel">
        <header className="flex items-center justify-between border-b border-teal-900/10 px-6 py-5">
          <div>
            <p className="eyebrow">Appointment list</p>
            <p className="mt-1 font-display text-2xl text-teal-900">
              {count} {count === 1 ? 'treatment' : 'treatments'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-ink-soft hover:bg-mist hover:text-teal-800"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="font-display text-2xl text-teal-900">Nothing on the list yet</p>
              <p className="max-w-[17rem] text-sm leading-relaxed text-ink-soft">
                Add the treatments you are interested in, then send the list to us — we will build a plan
                and a slot around it.
              </p>
              <Link to="/shop" onClick={closeCart} className="btn-line mt-2">
                Browse treatments
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-teal-900/10">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="w-20 shrink-0 overflow-hidden rounded-lg bg-mist"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="aspect-[4/5] h-full w-full object-cover" />
                    ) : (
                      <div className="aspect-[4/5]" />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-display text-lg leading-tight text-teal-900 hover:opacity-70"
                        >
                          {item.name}
                        </Link>
                        {item.variantName ? (
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
                            {item.variantName}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint hover:text-wine-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                      <div className="flex items-center rounded-full border border-teal-900/15">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="h-8 w-8 text-ink-soft hover:text-teal-800"
                          aria-label={`Reduce ${item.name} quantity`}
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="h-8 w-8 text-ink-soft hover:text-teal-800"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs text-teal-800">{formatPrice(item.unitPrice)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <footer className="border-t border-teal-900/10 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Indicative total</span>
              <span className="font-display text-xl text-teal-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
              Fees are confirmed after an examination. Sending the list starts a conversation, not a
              payment — {link?.channel === 'whatsapp' ? 'on WhatsApp' : 'on Instagram'}.
            </p>

            {link ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ type: 'order_whatsapp_click' })}
                className="btn-solid mt-4 w-full"
              >
                {link.channel === 'whatsapp' ? 'Request this appointment' : 'Send on Instagram'}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : null}

            <button
              type="button"
              onClick={clear}
              className="mt-3 w-full text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint hover:text-teal-800"
            >
              Clear list
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
