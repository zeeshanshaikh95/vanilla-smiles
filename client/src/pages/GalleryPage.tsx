import { useEffect, useState } from 'react';
import { publicApi } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { useSettings } from '@/context/SettingsContext';
import { Seo } from '@/components/seo/Seo';
import { EmptyState } from '@/components/EmptyState';

export function GalleryPage() {
  const { settings } = useSettings();
  const { data, loading, error } = useApi(() => publicApi.listGallery(), []);
  const items = data?.items ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
      if (event.key === 'ArrowRight') setOpenIndex((index) => (index === null ? null : (index + 1) % items.length));
      if (event.key === 'ArrowLeft')
        setOpenIndex((index) => (index === null ? null : (index - 1 + items.length) % items.length));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, items.length]);

  const current = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <Seo
        title="Smile gallery — Vanilla Smiles"
        description="Cases, clinic notes and behind-the-scenes photographs from Vanilla Smiles Dental & Esthetic Care in Andheri West, Mumbai."
        canonicalPath="/gallery"
      />

      <section className="border-b border-teal-900/10">
        <div className="shell flex flex-col justify-between gap-6 py-14 sm:flex-row sm:items-end sm:py-20">
          <div>
            <p className="eyebrow">Smile gallery</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.98] text-teal-900 sm:text-7xl">
              Cases &amp; clinic life
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              Photographs shared with patient consent. Nothing here is retouched to hide a result.
            </p>
          </div>
          <a
            href={settings.instagramUrl || 'https://www.instagram.com/vanillasmilesclinic/'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold uppercase tracking-wide2 text-teal-800 hover:text-teal-900"
          >
            Follow @{settings.instagramHandle.replace(/^@/, '')}
          </a>
        </div>
      </section>

      <div className="shell py-12 sm:py-16">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="skeleton aspect-[4/5]" />
            ))}
          </div>
        ) : error ? (
          <EmptyState tone="error" title="The gallery could not load" description={error} />
        ) : !items.length ? (
          <EmptyState
            title="The gallery is being assembled"
            description="Case photographs and clinic notes will appear here once they are published."
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {items.map((item, index) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setOpenIndex(index)}
                className={`group relative overflow-hidden rounded-lg bg-mist ${
                  index % 5 === 0 ? 'row-span-2 aspect-[4/5] sm:aspect-auto' : 'aspect-[4/5]'
                }`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.caption || 'Vanilla Smiles case photograph'}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-105"
                  />
                ) : null}
                {item.caption ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-900/80 to-transparent p-4 text-left text-[10px] font-semibold uppercase tracking-wide2 text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.caption}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {current ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-teal-900/95" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide2 text-ivory/60">
              {String((openIndex ?? 0) + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </p>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="p-2 text-ivory/70 hover:text-ivory"
              aria-label="Close image"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-4">
            {current.image ? (
              <img
                src={current.image}
                alt={current.caption || 'Vanilla Smiles'}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-ivory/15 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenIndex((index) => (index === null ? null : (index - 1 + items.length) % items.length))}
              className="text-[10px] font-semibold uppercase tracking-wide2 text-ivory/70 hover:text-ivory"
            >
              ← Previous
            </button>
            {current.caption ? (
              <p className="text-[10px] uppercase tracking-wide2 text-ivory/50">{current.caption}</p>
            ) : null}
            <button
              type="button"
              onClick={() => setOpenIndex((index) => (index === null ? null : (index + 1) % items.length))}
              className="text-[10px] font-semibold uppercase tracking-wide2 text-ivory/70 hover:text-ivory"
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
