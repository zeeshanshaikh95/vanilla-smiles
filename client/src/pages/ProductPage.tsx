import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/context/ToastContext';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { Seo } from '@/components/seo/Seo';
import { trackEvent } from '@/lib/analytics';
import { formatPrice } from '@/lib/format';
import { buildOrderLink, buildSingleProductMessage } from '@/lib/whatsapp';

export function ProductPage() {
  const { slug = '' } = useParams();
  const { data, loading, error } = useApi(() => publicApi.getProduct(slug), [slug]);
  const related = useApi(() => publicApi.getRelated(slug), [slug]);
  const { addItem, openCart } = useCart();
  const { settings } = useSettings();
  const { toast } = useToast();

  const product = data?.product;
  const [activeImage, setActiveImage] = useState(0);
  const [variantName, setVariantName] = useState<string | null>(null);

  useEffect(() => {
    setActiveImage(0);
    setVariantName(null);
  }, [slug]);

  useEffect(() => {
    if (product) trackEvent({ type: 'product_view', productSlug: product.slug });
  }, [product?.slug, product]);

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.name === variantName) ?? product?.variants[0] ?? null,
    [product, variantName]
  );

  if (loading) {
    return (
      <div className="shell grid gap-10 py-14 lg:grid-cols-2">
        <div className="skeleton aspect-[4/5]" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-1/3" />
          <div className="skeleton h-12 w-2/3" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="shell py-24">
        <EmptyState
          tone="error"
          title="This treatment is not listed"
          description={error || 'It may have been renamed or moved to another department.'}
          action={
            <Link to="/shop" className="btn-line">
              Browse treatments
            </Link>
          }
        />
      </div>
    );
  }

  const images = product.images.length ? product.images : [''];
  const unavailable = product.stockStatus === 'out_of_stock' || selectedVariant?.stockStatus === 'out_of_stock';
  const price = selectedVariant?.price ?? product.price;

  const orderLink = buildOrderLink(
    settings,
    buildSingleProductMessage(settings, {
      productName: product.name,
      variantName: selectedVariant?.name ?? null,
      quantity: 1,
      price,
    })
  );

  return (
    <>
      <Seo
        title={product.seoTitle || `${product.name} — Vanilla Smiles`}
        description={product.seoDescription || product.description.slice(0, 160)}
        canonicalPath={`/product/${product.slug}`}
        image={product.images[0]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'MedicalProcedure',
          name: product.name,
          description: product.description,
          image: product.images,
          provider: { '@type': 'Dentist', name: 'Vanilla Smiles' },
        }}
      />

      <nav className="shell flex items-center gap-2 py-5 text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
        <Link to="/shop" className="hover:text-teal-800">Treatments</Link>
        <span>/</span>
        {product.category ? (
          <>
            <Link to={`/category/${product.category.slug}`} className="hover:text-teal-800">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-teal-800">{product.name}</span>
      </nav>

      <div className="shell grid gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist">
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="h-full w-full animate-fade-in object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-display text-5xl text-teal-700/20">{product.name.slice(0, 2)}</span>
              </div>
            )}

            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.newArrival ? <span className="badge-dark">New</span> : null}
              {product.bestseller ? <span className="badge-line">Most booked</span> : null}
            </div>

            {images.length > 1 ? (
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-teal-900/45 to-transparent p-4">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeImage ? 'w-8 bg-ivory' : 'w-3 bg-ivory/50 hover:bg-ivory/80'
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={`thumb-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`aspect-[4/5] overflow-hidden rounded-lg border-2 bg-mist transition-colors ${
                    index === activeImage ? 'border-teal-700' : 'border-transparent hover:border-teal-700/30'
                  }`}
                >
                  {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{product.category?.name ?? 'Dental care'}</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] text-teal-900 sm:text-5xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-lg text-teal-800">{price === null ? 'Fee quoted at consultation' : formatPrice(price)}</p>
            {product.compareAtPrice ? (
              <p className="text-sm text-ink-faint line-through">{formatPrice(product.compareAtPrice)}</p>
            ) : null}
            {product.colour ? (
              <p className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">{product.colour}</p>
            ) : null}
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-[1.9] text-ink-soft">{product.description}</p>

          {product.variants.length ? (
            <div className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <p className="eyebrow">Option</p>
                <p className="text-[10px] text-ink-faint">Unsure? Ask us and we will advise.</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const isActive = (selectedVariant?.name ?? null) === variant.name;
                  return (
                    <button
                      key={variant.name}
                      type="button"
                      onClick={() => setVariantName(variant.name)}
                      aria-pressed={isActive}
                      className={`min-w-[3.5rem] rounded-full border px-4 py-2.5 text-xs transition-colors ${
                        isActive
                          ? 'border-teal-800 bg-teal-800 text-ivory'
                          : 'border-teal-900/20 text-teal-900 hover:border-teal-700'
                      } ${variant.stockStatus === 'out_of_stock' ? 'line-through opacity-50' : ''}`}
                    >
                      {variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={unavailable}
              onClick={() => {
                addItem(product, selectedVariant?.name ?? null);
                toast(`${product.name} added to your appointment list`);
                openCart();
              }}
              className="btn-solid w-full"
            >
              {unavailable ? 'Currently on waitlist' : 'Add to appointment list'}
            </button>

            {orderLink && !unavailable ? (
              <a
                href={orderLink.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ type: 'whatsapp_click', productSlug: product.slug })}
                className="btn-line w-full"
              >
                {orderLink.channel === 'whatsapp' ? 'Ask about this on WhatsApp' : 'Ask on Instagram'}
              </a>
            ) : null}
          </div>

          <div className="mt-8 divide-y divide-teal-900/10 rounded-xl border border-teal-900/10 bg-ivory px-5">
            {[
              ['What it involves', product.fabric],
              ['Aftercare', product.care],
              ['Visits & duration', settings.policies.shipping],
              ['Fees & payment', settings.policies.returns],
            ]
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <details key={label} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-semibold uppercase tracking-wide2 text-teal-900">
                    {label}
                    <span className="text-ink-faint transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{value}</p>
                </details>
              ))}
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-ink-faint">
            Every treatment plan is confirmed after an examination. Nothing here replaces a clinical
            diagnosis.
          </p>
        </div>
      </div>

      {related.data?.products.length ? (
        <section className="border-t border-teal-900/10 py-16">
          <div className="shell">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl text-teal-900">Often booked together</h2>
              <Link to="/shop" className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-soft hover:text-teal-800">
                All treatments
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {related.data.products.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
