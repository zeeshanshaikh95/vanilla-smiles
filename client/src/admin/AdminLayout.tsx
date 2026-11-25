import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { Wordmark } from '@/components/Wordmark';

const NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Treatments' },
  { to: '/admin/categories', label: 'Departments' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/settings', label: 'Settings' },
];

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bone lg:flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 transform bg-ink transition-transform duration-300 ease-editorial lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col px-6 py-7">
          <div className="flex items-start justify-between">
            <Wordmark size="sm" withTagline onDark asLink={false} className="items-start" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-ivory/60 hover:text-ivory lg:hidden"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="mt-10 flex flex-col gap-1" aria-label="Admin">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between border-l px-3 py-2.5 text-[11px] uppercase tracking-wide2 transition-colors ${
                    isActive
                      ? 'border-ivory bg-ivory/10 text-ivory'
                      : 'border-transparent text-ivory/50 hover:text-ivory'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-ivory/15 pt-5">
            <p className="truncate text-[10px] uppercase tracking-wide2 text-ivory/40">{admin?.email}</p>
            <div className="mt-3 flex flex-col gap-2 text-[10px] uppercase tracking-wide2">
              <Link to="/admin/password" className="text-ivory/60 hover:text-ivory">
                Change password
              </Link>
              <Link to="/" target="_blank" className="text-ivory/60 hover:text-ivory">
                View site ↗
              </Link>
              <button type="button" onClick={logout} className="text-left text-ivory/60 hover:text-ivory">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-ink/10 bg-bone px-5 py-3 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="text-[10px] uppercase tracking-wide2">
            ☰ Menu
          </button>
          <span className="text-[10px] uppercase tracking-wide2 text-ink-faint">Vanilla Smiles Admin</span>
        </div>

        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
