import { Link } from 'react-router-dom';
import { publicApi } from '@/api/endpoints';
import { useApi } from '@/hooks/useApi';
import { useSettings } from '@/context/SettingsContext';
import { HeroSlider } from '@/components/HeroSlider';
import { ProductCard } from '@/components/ProductCard';
import { SectionIntro } from '@/components/SectionIntro';
import { Seo } from '@/components/seo/Seo';
import { EmptyState } from '@/components/EmptyState';
import { Stars } from '@/components/Stars';
import { assetUrl, FOUNDER_IMAGE } from '@/lib/brand';
import { buildOrderLink, buildSingleProductMessage } from '@/lib/whatsapp';

const TRUST = [
  ['Walk-ins', 'Welcome, subject to slots'],
  ['Same-day', 'Emergency care'],
  ['Wheelchair', 'Step-free entrance'],
  ['Sterilised', 'Autoclave, every cycle'],
];

const PROMISES = [
  {
    title: 'Explained before treated',
    text: 'A diagnosis, the options and the cost come first — you decide with a clear head, never mid-procedure.',
  },
  {
    title: 'Gentle by default',
    text: 'Topical numbing, slow injections and unhurried appointments, for adults and children alike.',
  },
  {
    title: 'One clinic, one file',
    text: 'General, cosmetic and children’s dentistry in the same practice, so your records stay in one place.',
  },
];

const STEPS = [
  ['01', 'Message or call', 'Tell us what is bothering you, or book a routine check-up. We confirm a slot the same day.'],
  ['02', 'Consult & plan', 'An examination, digital X-ray if needed, and a written plan with costs before anything starts.'],
  ['03', 'Treat & review', 'Treatment in as few visits as we can manage, then a review and a simple home-care routine.'],
];

export function HomePage() {
  const { settings } = useSettings();
  const featured = useApi(() => publicApi.listProducts({ sort: 'newest' }).then((r) => r.products), []);
  const signatures = useApi(
    () => publicApi.listProducts({ sort: 'bestseller' }).then((r) => r.products),
    []
  );
  const categories = useApi(() => publicApi.listCategories().then((r) => r.categories), []);
  const reviews = useApi(() => publicApi.listReviews().then((r) => r.reviews), []);
  const gallery = useApi(() => publicApi.listGallery().then((r) => r.items), []);

  const bookLink = buildOrderLink(
    settings,
    buildSingleProductMessage(settings, {
      productName: 'a consultation',
      variantName: null,
      quantity: 1,
      price: null,
    })
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: settings.businessName,
    description:
      settings.about.intro ||
      'Dental and esthetic care in Andheri West, Mumbai — general, cosmetic and children’s dentistry.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'A-002, Aditi CHS, MHADA Rd, opposite MTNL',
      addressLocality: 'Andheri West, Mumbai',
      postalCode: '400053',
      addressCountry: 'IN',
    },
    telephone: '+919004704391',
    openingHours: 'Mo-Sa 10:00-21:00',
    ...(settings.instagramUrl ? { sameAs: [settings.instagramUrl] } : {}),
  };

  return (
    <>
      <Seo
        title="Vanilla Smiles — Dental & Esthetic Care, Andheri West"
        description="Calm, precise dentistry in Andheri West, Mumbai. General dentistry, smile design, aligners, implants, whitening and children's care. Book on WhatsApp."
        canonicalPath="/"
        jsonLd={jsonLd}
      />

      <HeroSlider />

      {/* Trust strip */}
      <section className="border-y border-teal-900/10 bg-ivory/70">
        <div className="shell grid grid-cols-2 gap-px bg-teal-900/10 sm:grid-cols-4">
          {TRUST.map(([title, note]) => (
            <div key={title} className="bg-ivory px-4 py-4 sm:px-5">
              <p className="font-display text-base text-teal-900">{title}</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide2 text-ink-faint">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="shell py-16 sm:py-20">
        <SectionIntro
          eyebrow="Departments"
          title="Four ways we look after a smile"
          description="Start where it hurts, or start with a plan. Every department shares one clinical file."
          linkTo="/shop"
          linkLabel="All treatments"
        />

        {categories.loading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton aspect-[4/5]" />
            ))}
          </div>
        ) : !categories.data?.length ? (
          <div className="mt-10">
            <EmptyState
              title="Departments are being set up"
              description="Departments appear here once the clinic publishes them from the admin panel."
            />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {categories.data.slice(0, 4).map((category, index) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group relative block overflow-hidden rounded-xl bg-mist ring-1 ring-inset ring-teal-900/5 transition-shadow duration-300 hover:shadow-lift"
              >
                <div className="relative aspect-[4/5]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/85 via-teal-900/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-micro text-gold-200">
                      0{index + 1}
                    </p>
                    <h3 className="mt-1.5 font-display text-xl leading-tight text-ivory">{category.name}</h3>
                    <span className="mt-2.5 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide2 text-ivory/80">
                      Explore
                      <span className="h-px w-5 bg-ivory/60 transition-all duration-300 group-hover:w-8" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Signature treatments */}
      <section className="border-y border-teal-900/10 bg-ivory py-16 sm:py-20">
        <div className="shell">
          <SectionIntro
            eyebrow="Most booked"
            title="The treatments patients come back for"
            linkTo="/shop?sort=bestseller"
            linkLabel="See all treatments"
          />

          {signatures.loading ? (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="skeleton aspect-[4/5]" />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {(signatures.data ?? []).slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Clinic story */}
      <section className="shell grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <div className="overflow-hidden rounded-2xl bg-mist">
            <img
              src={settings.about.founderImageUrl || assetUrl(FOUNDER_IMAGE)}
              alt="Inside the Vanilla Smiles clinic in Andheri West"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 right-4 hidden rounded-lg border border-white/70 bg-ivory px-5 py-4 shadow-soft sm:block">
            <p className="font-display text-2xl leading-none text-teal-800">4.5★</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-micro text-ink-faint">
              Google · 21 reviews
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <p className="eyebrow">The clinic</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] text-balance text-teal-900 sm:text-5xl">
            A dental visit you don’t have to dread
          </h2>
          <p className="mt-5 text-sm leading-[1.9] text-ink-soft">
            {settings.about.intro ||
              'Vanilla Smiles is a dental and esthetic practice in Andheri West, Mumbai. We keep appointments unhurried, explain every option in plain language, and treat children the way we would want ours treated.'}
          </p>
          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide2 text-teal-800"
          >
            Meet the clinic
            <span className="h-px w-8 bg-teal-800" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-teal-900/10 bg-mist/50 py-16 sm:py-20">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">How a visit works</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-teal-900 sm:text-[2.6rem]">
              Three steps, no surprises
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map(([step, title, text]) => (
              <div
                key={step}
                className="glass p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
              >
                <p className="font-display text-2xl text-gold-500">{step}</p>
                <h3 className="mt-3 font-display text-xl text-teal-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New in the clinic */}
      <section className="shell py-16 sm:py-20">
        <SectionIntro
          eyebrow="Now available"
          title="Recently added to the menu"
          description="New equipment and new protocols — listed here as they arrive."
          linkTo="/shop?sort=newest"
          linkLabel="All treatments"
        />

        {featured.loading ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton aspect-[4/5]" />
            ))}
          </div>
        ) : featured.error ? (
          <div className="mt-10">
            <EmptyState
              tone="error"
              title="We couldn’t load the treatment list"
              description={featured.error}
              action={
                <button type="button" className="btn-line" onClick={featured.refetch}>
                  Try again
                </button>
              }
            />
          </div>
        ) : !featured.data?.length ? (
          <div className="mt-10">
            <EmptyState
              title="The treatment menu is being written"
              description="Treatments appear here as soon as the clinic publishes them. Message us in the meantime and we will tell you what is available."
            />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {featured.data.slice(0, 4).map((product, index) => (
              <ProductCard key={product._id} product={product} priority={index < 2} />
            ))}
          </div>
        )}
      </section>

      {/* Promises */}
      <section className="border-y border-teal-900/10 bg-ivory py-16 sm:py-20">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">How we practise</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-teal-900 sm:text-[2.6rem]">
              Fewer surprises, better dentistry
            </h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl bg-teal-900/10 sm:grid-cols-3">
            {PROMISES.map((promise, index) => (
              <div key={promise.title} className="bg-ivory p-6 sm:p-8">
                <p className="text-[10px] font-semibold tracking-wide2 text-gold-500">0{index + 1}</p>
                <h3 className="mt-4 font-display text-2xl text-teal-900">{promise.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{promise.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smile gallery */}
      {gallery.data?.length ? (
        <section className="shell py-16 sm:py-20">
          <SectionIntro
            eyebrow={`@${settings.instagramHandle.replace(/^@/, '')}`}
            title="From the clinic feed"
            linkTo="/gallery"
            linkLabel="Open the gallery"
          />
          <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {gallery.data.slice(0, 6).map((item) => (
              <a
                key={item._id}
                href={item.externalUrl || settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-mist"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.caption || 'Vanilla Smiles on Instagram'}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                  />
                ) : null}
                <span className="absolute inset-0 bg-teal-900/0 transition-colors duration-300 group-hover:bg-teal-900/25" />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {/* Reviews */}
      <section className="shell pb-16 sm:pb-20">
        {reviews.data?.length ? (
          <>
            <SectionIntro eyebrow="Patient words" title="What it is like here" linkTo="/reviews" linkLabel="All reviews" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.data.slice(0, 3).map((review) => (
                <figure key={review._id} className="panel flex flex-col p-6">
                  <Stars rating={review.rating} />
                  <blockquote className="mt-4 flex-1 font-display text-xl leading-snug text-teal-900">
                    “{review.text}”
                  </blockquote>
                  <figcaption className="mt-5 text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
                    {review.customerName}
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : null}
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-teal-900 py-20 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-teal-500/25 blur-[110px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-gold-400/20 blur-[100px]" />
        <div className="shell relative flex flex-col items-center text-center">
          <p className="text-[10px] font-semibold uppercase tracking-micro text-gold-200">
            Pain today? Message first.
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-ivory text-balance sm:text-6xl">
            Tell us what hurts. We’ll tell you when to come in.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/65">
            A real person reads every message — share a photograph or describe the pain, and we will
            advise honestly, including whether it can wait.
          </p>
          {bookLink ? (
            <a
              href={bookLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-8 border-gold-300 bg-gold-300 text-teal-900 hover:bg-ivory"
            >
              {bookLink.channel === 'whatsapp' ? 'Book on WhatsApp' : 'Message on Instagram'}
            </a>
          ) : null}
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide2 text-ivory/40">
            Mon – Sat · 10:00 – 21:00 · Andheri West
          </p>
        </div>
      </section>
    </>
  );
}
