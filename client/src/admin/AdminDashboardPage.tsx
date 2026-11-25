import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { PageHeader, Spinner, Notice } from './AdminUI';
import { normaliseNumber } from '@/lib/whatsapp';

const RANGES = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
] as const;

export function AdminDashboardPage() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const analytics = useApi(() => adminApi.getAnalytics(range), [range]);
  const products = useApi(() => adminApi.listProducts(), []);
  const settings = useApi(() => adminApi.getSettings(), []);

  const totals = analytics.data?.totals;
  const missingWhatsApp = settings.data ? normaliseNumber(settings.data.settings.whatsappNumber).length < 8 : false;
  const unapproved = 0;

  const cards = [
    { label: 'Page views', value: totals?.pageViews ?? 0 },
    { label: 'Treatment views', value: totals?.productViews ?? 0 },
    { label: 'Added to bag', value: totals?.cartAdds ?? 0 },
    { label: 'Order messages', value: totals?.orderWhatsappClicks ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Studio"
        title="Overview"
        description="How the shop is being used, what needs attention, and the fastest way to add a new piece."
        actions={
          <Link to="/admin/products/new" className="btn-solid !px-5 !py-2.5 text-[10px]">
            Add a piece
          </Link>
        }
      />

      {missingWhatsApp ? (
        <Notice tone="warn">
          <strong className="font-medium">No order number set.</strong> Order buttons currently open
          Instagram DMs. Add the WhatsApp number in{' '}
          <Link to="/admin/settings" className="underline">
            Settings → Contact
          </Link>{' '}
          to switch them over.
        </Notice>
      ) : null}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Last {range} days</h2>
        <div className="flex gap-1">
          {RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRange(option.value)}
              className={`border px-3 py-1.5 text-[10px] uppercase tracking-wide2 transition-colors ${
                range === option.value
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-ink/15 text-ink-soft hover:border-ink/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {analytics.loading ? (
        <Spinner label="Reading the numbers…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px bg-ink/10 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="bg-ivory p-5">
                <p className="eyebrow">{card.label}</p>
                <p className="mt-3 font-display text-4xl leading-none">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="panel p-5">
              <h3 className="font-display text-xl">Most viewed treatments</h3>
              {analytics.data?.topProducts.length ? (
                <ul className="mt-4 divide-y divide-ink/10">
                  {analytics.data.topProducts.map((row) => (
                    <li key={row.slug} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="truncate text-ink-soft">
                        {row.exists ? row.name : `${row.slug} (removed)`}
                      </span>
                      <span className="shrink-0 text-xs text-ink-faint">{row.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-xs text-ink-faint">No piece views recorded in this range yet.</p>
              )}
            </section>

            <section className="panel p-5">
              <h3 className="font-display text-xl">Where people arrive</h3>
              {analytics.data?.topReferrers.length ? (
                <ul className="mt-4 divide-y divide-ink/10">
                  {analytics.data.topReferrers.map((row) => (
                    <li key={row._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="truncate text-ink-soft">{row._id}</span>
                      <span className="shrink-0 text-xs text-ink-faint">{row.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-xs text-ink-faint">
                  Direct visits so far. Referrer data appears once the shop is shared.
                </p>
              )}
            </section>
          </div>
        </>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        <Link to="/admin/products" className="panel group p-5 transition-colors hover:bg-ivory">
          <p className="eyebrow">Catalogue</p>
          <p className="mt-2 font-display text-3xl">
            {products.loading ? '—' : products.data?.products.filter((item) => !item.archived).length ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-soft">live treatments</p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-wide2 text-ink-faint group-hover:text-ink">
            Manage →
          </span>
        </Link>
        <Link to="/admin/categories" className="panel group p-5">
          <p className="eyebrow">Departments</p>
          <p className="mt-2 font-display text-3xl">—</p>
          <p className="mt-1 text-xs text-ink-soft">collections in the nav</p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-wide2 text-ink-faint group-hover:text-ink">
            Manage →
          </span>
        </Link>
        <Link to="/admin/reviews" className="panel group p-5">
          <p className="eyebrow">Reviews</p>
          <p className="mt-2 font-display text-3xl">{unapproved}</p>
          <p className="mt-1 text-xs text-ink-soft">awaiting moderation</p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-wide2 text-ink-faint group-hover:text-ink">
            Moderate →
          </span>
        </Link>
      </div>
    </div>
  );
}
