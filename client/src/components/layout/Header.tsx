import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { Wordmark } from '@/components/Wordmark';
import { normaliseNumber } from '@/lib/whatsapp';

const NAV_ITEMS = [
  { to: '/shop', label: 'Treatments' },
  { to: '/about', label: 'The Clinic' },
  { to: '/gallery', label: 'Smile Gallery' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Book' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();
  const { settings } = useSettings();
  const location = useLocation();
  const whatsapp = normaliseNumber(settings.whatsappNumber);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-bone/90 backdrop-blur-md">
      {settings.announcements.enabled && settings.announcements.text ? (
        <div className="bg-teal-900 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wide2 text-ivory/85">
          {settings.announcements.text}
        </div>
      ) : null}

      <div className="shell flex h-[74px] items-center justify-between gap-4 border-b border-teal-900/10 sm:h-20">
        <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide2 transition-colors ${
                  isActive ? 'text-teal-800' : 'text-ink-soft hover:text-teal-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 justify-start lg:justify-center">
          <Wordmark size="sm" withTagline={false} />
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-3">
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Secondary">
            {NAV_ITEMS.slice(2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide2 transition-colors ${
                    isActive ? 'text-teal-800' : 'text-ink-soft hover:text-teal-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-teal-700 px-4 py-2 text-[9px] font-semibold uppercase tracking-wide2 text-ivory transition-colors hover:bg-teal-800 sm:inline-flex"
            >
              WhatsApp
            </a>
          ) : null}

          <a
            href={settings.instagramUrl || 'https://www.instagram.com/vanillasmilesclinic/'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hidden p-2 text-ink-soft transition-colors hover:text-teal-800 sm:block"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
            </svg>
          </a>

          <button
            type="button"
            onClick={openCart}
            className="relative p-2 text-teal-900 transition-opacity hover:opacity-60"
            aria-label={`Open appointment list (${count} treatments)`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3.5" y="5" width="17" height="15" rx="3" />
              <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
            </svg>
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-teal-700 px-1 text-[9px] font-semibold text-ivory">
                {count}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 text-teal-900 lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 8h16M4 16h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-b border-teal-900/10 bg-bone px-5 pb-6 pt-2 lg:hidden" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block border-b border-teal-900/5 py-3.5 font-display text-xl ${
                  isActive ? 'text-teal-800' : 'text-ink-soft'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn-solid mt-5 w-full">
            Book an appointment
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
