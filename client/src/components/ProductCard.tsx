import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { formatPrice, truncate } from '@/lib/format';
import type { Product } from '@/types';

/**
 * A treatment card. "Price" is optional by design — most treatments are quoted
 * after a consultation, so a blank price reads as "Consultation advised"
 * rather than ₹0.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem } = useCart();
  const unavailable = product.stockStatus === 'out_of_stock';
  const secondary = product.images[1];

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-xl bg-mist">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="block">
          <div className="relative aspect-[4/5]">
            {product.images[0] ? (
              <>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  loading={priority ? 'eager' : 'lazy'}
                  className={`h-full w-full object-cover transition-all duration-[900ms] ease-editorial group-hover:scale-[1.04] ${
                    secondary ? 'group-hover:opacity-0' : ''
                  }`}
                />
                {secondary ? (
                  <img
                    src={secondary}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                ) : null}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-display text-3xl text-teal-700/25">{product.name.slice(0, 2)}</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-teal-900/5" />
          </div>
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.newArrival ? <span className="badge-dark">New</span> : null}
          {product.bestseller ? <span className="badge-line">Most booked</span> : null}
          {unavailable ? <span className="badge-line">Waitlist</span> : null}
        </div>

        <div className="absolute inset-x-3 bottom-3 translate-y-[130%] transition-transform duration-300 ease-editorial group-hover:translate-y-0">
          <button
            type="button"
            disabled={unavailable}
            onClick={() => addItem(product)}
            className="w-full rounded-full bg-teal-800/95 py-2.5 text-[10px] font-semibold uppercase tracking-wide2 text-ivory backdrop-blur transition-colors hover:bg-teal-900 disabled:opacity-50"
          >
            {unavailable ? 'Join the waitlist' : 'Add to appointment'}
          </button>
        </div>
      </div>

      <div className="pt-3.5">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-display text-lg leading-snug text-teal-900 transition-opacity hover:opacity-70">
            {truncate(product.name, 52)}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
            {product.category?.name ?? (product.colour || 'Dental care')}
          </p>
          <p className="text-xs text-teal-700">
            {product.price === null ? 'On consult' : formatPrice(product.price)}
          </p>
        </div>
      </div>
    </article>
  );
}
