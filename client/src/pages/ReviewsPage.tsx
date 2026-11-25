import { Link } from 'react-router-dom';
import { publicApi } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { useSettings } from '@/context/SettingsContext';
import { Seo } from '@/components/seo/Seo';
import { Stars } from '@/components/Stars';
import { EmptyState } from '@/components/EmptyState';
import { buildOrderLink, buildSingleProductMessage } from '@/lib/whatsapp';

export function ReviewsPage() {
  const { settings } = useSettings();
  const { data, loading, error } = useApi(() => publicApi.listReviews(), []);

  const shareLink = buildOrderLink(
    settings,
    buildSingleProductMessage(settings, {
      productName: 'my visit',
      variantName: null,
      quantity: 1,
      price: null,
    })
  );

  return (
    <>
      <Seo
        title="Patient reviews — Vanilla Smiles"
        description="Words from patients of Vanilla Smiles Dental & Esthetic Care in Andheri West — treatment notes and what a visit is really like."
        canonicalPath="/reviews"
      />

      <section className="border-b border-teal-900/10">
        <div className="shell py-14 sm:py-20">
          <p className="eyebrow">Patient words</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[0.98] text-balance text-teal-900 sm:text-7xl">
            What a visit is really like.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-[1.9] text-ink-soft">
            Published only with the patient’s permission, and never edited to sound better.
          </p>
        </div>
      </section>

      <div className="shell py-12 sm:py-16">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="skeleton h-48" />
            ))}
          </div>
        ) : error ? (
          <EmptyState tone="error" title="Reviews could not load" description={error} />
        ) : !data?.reviews.length ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <EmptyState
                title="The first notes are on their way"
                description="We publish patient words only after they are shared with us directly. If you have been treated here, we would love to hear how it went."
                action={
                  shareLink ? (
                    <a href={shareLink.href} target="_blank" rel="noopener noreferrer" className="btn-line">
                      Send us your note
                    </a>
                  ) : null
                }
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="eyebrow">A note on honesty</p>
              <p className="mt-3 text-sm leading-[1.9] text-ink-soft">
                We do not write reviews for patients, and we do not edit them. What appears here is what
                was sent to us — including the critical ones.
              </p>
              <Link to="/shop" className="link-quiet mt-4 inline-block text-sm">
                Browse treatments
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.reviews.map((review) => (
              <figure key={review._id} className="panel flex flex-col p-6">
                <Stars rating={review.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-[1.9] text-ink-soft">
                  “{review.text}”
                </blockquote>
                {review.image ? (
                  <img
                    src={review.image}
                    alt={`Patient photo from ${review.customerName}`}
                    loading="lazy"
                    className="mt-5 aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ) : null}
                <figcaption className="mt-5 border-t border-teal-900/10 pt-4 text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
                  {review.customerName}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
