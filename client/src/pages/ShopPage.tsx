import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicApi, type Product } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { Seo } from '@/components/seo/Seo';

type SortKey = 'featured' | 'bestseller' | 'newest' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'featured', label: 'Recommended' },
  { value: 'newest', label: 'Recently added' },
  { value: 'bestseller', label: 'Most booked' },
  { value: 'price_asc', label: 'Fee: low to high' },
  { value: 'price_desc', label: 'Fee: high to low' },
];

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const initialSort = (params.get('sort') as SortKey) || 'featured';

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<SortKey>(initialSort);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search.trim()), 320);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (sort === 'featured') next.delete('sort');
    else next.set('sort', sort);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const categories = useApi(() => publicApi.listCategories().then((r) => r.categories), []);
  const products = useApi<Product[]>(
    () =>
      publicApi
        .listProducts({ search: debounced, category, sort })
        .then((r) => r.products)
        .then((list) => (sort === 'bestseller' ? list.filter((product) => product.bestseller) : list)),
    [debounced, category, sort]
  );

  const activeCategory = categories.data?.find((item) => item.slug === category);

  return (
    <>
      <Seo
        title={`${activeCategory ? `${activeCategory.name} — ` : ''}Treatments — Vanilla Smiles`}
        description="The full Vanilla Smiles treatment menu — check-ups, cleaning, fillings, root canals, smile design, aligners, implants, whitening and children's dentistry in Andheri West."
        canonicalPath={activeCategory ? `/category/${activeCategory.slug}` : '/shop'}
      />

      <section className="relative overflow-hidden border-b border-teal-900/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 80% at 80% 0%, #E8F2EF 0%, rgba(232,242,239,0) 70%)' }}
        />
        <div className="shell relative py-12 sm:py-16">
          <p className="eyebrow">Treatment menu</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-4xl leading-none text-teal-900 sm:text-6xl">
              {activeCategory ? activeCategory.name : 'Everything we treat'}
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
              {products.loading ? 'Loading' : `${products.data?.length ?? 0} treatments`}
            </p>
          </div>
          {activeCategory?.description ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">{activeCategory.description}</p>
          ) : (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
              Add treatments to your appointment list the way you would a shopping bag — then send the
              list to us on WhatsApp and we will confirm a slot. Fees are quoted at consultation.
            </p>
          )}
        </div>
      </section>

      <div className="shell py-8">
        <div className="flex flex-col gap-4 border-b border-teal-900/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wide2 transition-colors ${
                category === ''
                  ? 'border-teal-800 bg-teal-800 text-ivory'
                  : 'border-teal-900/15 text-ink-soft hover:border-teal-700/40 hover:text-teal-800'
              }`}
            >
              All
            </button>
            {(categories.data ?? []).map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setCategory(item.slug)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wide2 transition-colors ${
                  category === item.slug
                    ? 'border-teal-800 bg-teal-800 text-ivory'
                    : 'border-teal-900/15 text-ink-soft hover:border-teal-700/40 hover:text-teal-800'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="relative flex-1 lg:w-60">
              <span className="sr-only">Search treatments</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a treatment…"
                className="w-full rounded-full border border-teal-900/15 bg-white/70 px-4 py-2 pr-9 text-sm placeholder:text-ink-faint focus:border-teal-500 focus:outline-none"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" strokeLinecap="round" />
              </svg>
            </label>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Sort treatments"
              className="rounded-full border border-teal-900/15 bg-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-wide2 text-teal-900 focus:border-teal-500 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-10">
          {products.loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="skeleton aspect-[4/5]" />
              ))}
            </div>
          ) : products.error ? (
            <EmptyState
              tone="error"
              title="We couldn’t load the treatment menu"
              description={products.error}
              action={
                <button type="button" className="btn-line" onClick={products.refetch}>
                  Try again
                </button>
              }
            />
          ) : !products.data?.length ? (
            <EmptyState
              title={debounced ? 'Nothing matches that search' : 'No treatments here yet'}
              description={
                debounced
                  ? 'Try a shorter word — or browse the full menu.'
                  : 'This department is being written. The full menu is one tap away.'
              }
              action={
                <button
                  type="button"
                  className="btn-line"
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                  }}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
              {products.data.map((product, index) => (
                <ProductCard key={product._id} product={product} priority={index < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
