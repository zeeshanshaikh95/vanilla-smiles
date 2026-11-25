import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { assetUrl } from '@/lib/brand';
import { normaliseNumber } from '@/lib/whatsapp';
import type { HeroSlide } from '@/types';

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    imageUrl: '/images/hero-care.jpg',
    eyebrow: 'Andheri West · Mumbai',
    headline: 'Dentistry that feels like self-care',
    subheadline:
      'Gentle, precise treatment in a calm clinic — from a routine cleaning to a full smile design, explained before anything begins.',
    ctaLabel: 'Book an appointment',
    ctaHref: '/contact',
    active: true,
  },
  {
    imageUrl: '/images/hero-smile.jpg',
    eyebrow: 'Cosmetic dentistry',
    headline: 'A smile you stop hiding',
    subheadline:
      'Whitening, veneers and edge bonding planned around your face — not a one-shade-fits-all template.',
    ctaLabel: 'See smile design',
    ctaHref: '/shop',
    active: true,
  },
  {
    imageUrl: '/images/hero-aligners.jpg',
    eyebrow: 'Aligners & braces',
    headline: 'Straighten quietly, at your pace',
    subheadline:
      'Clear aligners and ceramic braces with a plan you can see from day one, and check-ins that keep it on track.',
    ctaLabel: 'Explore orthodontics',
    ctaHref: '/shop',
    active: true,
  },
  {
    imageUrl: '/images/hero-kids.jpg',
    eyebrow: "Children's dentistry",
    headline: 'First visits that do not scare',
    subheadline:
      'A tell–show–do approach for young patients, so a check-up becomes something they stop worrying about.',
    ctaLabel: 'Book a kids check-up',
    ctaHref: '/contact',
    active: true,
  },
];

const AUTOPLAY_MS = 7200;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hero: a photo slider staged inside a real CSS 3D scene.
 *
 * The stage is built from separate translateZ planes — a porcelain smile-arch
 * plate holding the active photograph, a rotating champagne halo behind it, an
 * orbit ring standing on edge, a pearl-and-gold geometry cluster and floating
 * glass treatment chips. Moving the pointer (or tilting a phone) shifts the
 * foreground planes further than the photograph, which reads as depth.
 *
 * Only transform/opacity animate, and every depth effect is disabled under
 * prefers-reduced-motion.
 */
export function HeroSlider() {
  const { settings } = useSettings();

  const slides = useMemo(() => {
    const configured = (settings.heroSlides ?? []).filter(
      (slide) => slide.active && (slide.imageUrl || slide.headline)
    );
    return configured.length ? configured : FALLBACK_SLIDES;
  }, [settings.heroSlides]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const touchStart = useRef<number | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  const total = slides.length;
  const slide = slides[Math.min(index, total - 1)] ?? FALLBACK_SLIDES[0];
  const whatsapp = normaliseNumber(settings.whatsappNumber);

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  useEffect(() => {
    setProgress(0);
    if (total < 2 || paused || prefersReducedMotion()) return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      setProgress(Math.min(1, (Date.now() - started) / AUTOPLAY_MS));
    }, 80);
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, AUTOPLAY_MS);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(timer);
    };
  }, [index, total, paused]);

  useEffect(() => {
    if (reduced.current) return;
    const onMove = (event: PointerEvent) => {
      const el = sceneRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: Math.max(-0.5, Math.min(0.5, px)), y: Math.max(-0.5, Math.min(0.5, py)) });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    const el = sceneRef.current;
    el?.addEventListener('pointermove', onMove);
    el?.addEventListener('pointerleave', onLeave);
    return () => {
      el?.removeEventListener('pointermove', onMove);
      el?.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const shift = (depth: number) =>
    `translate3d(${tilt.x * depth}px, ${tilt.y * depth}px, 0) rotateY(${tilt.x * 5}deg) rotateX(${-tilt.y * 5}deg)`;

  const imageFor = (item: HeroSlide) =>
    item.imageUrl
      ? item.imageUrl.startsWith('http')
        ? item.imageUrl
        : assetUrl(item.imageUrl)
      : '';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Vanilla Smiles highlights"
      className="relative isolate overflow-hidden bg-bone"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(index + 1);
        if (event.key === 'ArrowLeft') go(index - 1);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      {/* Ground: vanilla wash with a cool mist bloom on the scene side. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 70% at 78% 34%, #E8F2EF 0%, rgba(232,242,239,0) 62%), radial-gradient(60% 55% at 6% 94%, #F8F0DA 0%, rgba(248,240,218,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-8 h-[36rem] w-[36rem] rounded-full bg-teal-200/35 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-gold-200/45 blur-[120px]"
      />

      <div className="shell relative grid items-center gap-12 pb-14 pt-10 sm:pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-6 lg:pb-20 lg:pt-16">
        {/* ── Copy ─────────────────────────────────────────────────────── */}
        <div className="order-2 lg:order-1 lg:col-span-6 lg:pr-8">
          <div key={index} className="max-w-xl">
            <span
              className="animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-teal-700/15 bg-white/75 px-3.5 py-1.5 backdrop-blur-sm"
              style={{ animationDelay: '30ms' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              <span className="text-[9px] font-semibold uppercase tracking-micro text-teal-700">
                {slide.eyebrow || 'Andheri West · Mumbai'}
              </span>
            </span>

            <h1
              className="animate-fade-up mt-6 font-display text-[2.55rem] leading-[1.02] text-teal-900 text-balance sm:text-[3.5rem] lg:text-[4.1rem]"
              style={{ animationDelay: '110ms' }}
            >
              {slide.headline || 'Dentistry that feels like self-care'}
            </h1>

            {slide.subheadline ? (
              <p
                className="animate-fade-up mt-6 max-w-md text-[15px] leading-[1.85] text-ink-soft"
                style={{ animationDelay: '200ms' }}
              >
                {slide.subheadline}
              </p>
            ) : null}

            <div
              className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '300ms' }}
            >
              <Link to={slide.ctaHref || '/contact'} className="btn-solid group">
                {slide.ctaLabel || 'Book an appointment'}
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href={whatsapp ? `https://wa.me/${whatsapp}` : '/contact'}
                target={whatsapp ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="btn-line"
              >
                {whatsapp ? 'WhatsApp the clinic' : 'Call the clinic'}
              </a>
            </div>

            <dl
              className="animate-fade-up mt-10 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-lg border border-teal-900/10 bg-teal-900/10"
              style={{ animationDelay: '400ms' }}
            >
              {[
                ['4.5★', 'Google rating'],
                ['10–9', 'Mon to Sat'],
                ['Andheri W', 'Mumbai 400053'],
              ].map(([value, label]) => (
                <div key={label} className="bg-ivory/90 px-3 py-3.5 text-center sm:px-4">
                  <dt className="font-display text-base text-teal-900 sm:text-lg">{value}</dt>
                  <dd className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide2 text-ink-faint">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Slider controls */}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-teal-900/10 pt-5">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl text-teal-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="relative h-[3px] w-24 overflow-hidden rounded-full bg-teal-900/10 sm:w-36">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 to-gold-400 transition-[width] duration-100 ease-linear"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <span className="text-[10px] tracking-wide2 text-ink-faint">
                {String(total).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {total > 1 ? (
                <div className="mr-2 hidden items-center gap-1.5 sm:flex" role="tablist" aria-label="Hero slides">
                  {slides.map((item, itemIndex) => (
                    <button
                      key={`dot-${itemIndex}`}
                      type="button"
                      role="tab"
                      aria-selected={itemIndex === index}
                      aria-label={`Go to slide ${itemIndex + 1}${item.eyebrow ? `: ${item.eyebrow}` : ''}`}
                      onClick={() => go(itemIndex)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        itemIndex === index ? 'w-7 bg-teal-700' : 'w-1.5 bg-teal-900/20 hover:bg-teal-900/40'
                      }`}
                    />
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(index - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-900/15 bg-white/75 text-teal-900 transition-colors hover:border-teal-600 hover:bg-teal-700 hover:text-ivory"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(index + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-900/15 bg-white/75 text-teal-900 transition-colors hover:border-teal-600 hover:bg-teal-700 hover:text-ivory"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3D stage ─────────────────────────────────────────────────── */}
        <div
          ref={sceneRef}
          className="scene relative order-1 mx-auto w-full max-w-[440px] lg:order-2 lg:col-span-6 lg:max-w-none"
        >
          <div className="relative mx-auto aspect-[5/6] w-full max-w-[420px] sm:max-w-[460px]">
            {/* Rotating champagne halo, deep behind the plate */}
            <div
              aria-hidden="true"
              className="absolute inset-x-4 bottom-8 top-4 animate-spin-slow rounded-full opacity-80"
              style={{ transform: 'translateZ(-90px) scale(1.08)' }}
            >
              <div className="halo h-full w-full" />
            </div>

            {/* Porcelain smile-arch plate holding the active photograph */}
            <div
              className="layer-3d absolute inset-x-3 bottom-0 top-4 transition-transform duration-300 ease-out sm:inset-x-2"
              style={{ transform: `${shift(12)} translateZ(40px)` }}
            >
              <div className="smile-mask relative h-full w-full border border-white/90 bg-white/70 p-2 shadow-panel sm:p-2.5">
                <div className="smile-mask relative h-full w-full overflow-hidden bg-teal-900">
                  {slides.map((item, itemIndex) => {
                    const isActive = itemIndex === index % total;
                    const src = imageFor(item);
                    return (
                      <div
                        key={`${item.imageUrl}-${itemIndex}`}
                        aria-hidden={!isActive}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-editorial ${
                          isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
                        }`}
                      >
                        {src ? (
                          <img
                            src={src}
                            alt={item.headline || 'Vanilla Smiles clinic'}
                            loading={itemIndex === 0 ? 'eager' : 'lazy'}
                            className={`h-full w-full object-cover object-[center_38%] ${
                              isActive ? 'animate-ken-burns' : ''
                            }`}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-teal-900/70 via-teal-900/5 to-transparent" />

                  {/* Caption plate inside the frame */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 pl-16 sm:p-6">
                    <p className="text-[8px] font-semibold uppercase tracking-micro text-ivory/70">
                      {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </p>
                    <p className="mt-1.5 font-display text-lg leading-tight text-ivory sm:text-xl">
                      {slide.eyebrow || 'Vanilla Smiles'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Champagne orbit ring, standing on edge around the plate */}
            <div
              aria-hidden="true"
              className="layer-3d pointer-events-none absolute inset-[-5%] transition-transform duration-700 ease-out"
              style={{ transform: `${shift(20)} translateZ(120px) rotateX(74deg)` }}
            >
              <div className="ring-3d relative h-full w-full animate-spin-slow" />
            </div>

            {/* Floating glass score card */}
            <div
              className="layer-3d absolute -left-3 top-[14%] sm:-left-8"
              style={{ transform: `${shift(34)} translateZ(170px)` }}
            >
              <div className="chip-glass animate-float rounded-lg px-3.5 py-2.5">
                <p className="font-display text-lg leading-none text-teal-900">4.5★</p>
                <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide2 text-teal-700/80">
                  21 Google reviews
                </p>
              </div>
            </div>

            {/* Treatment chips */}
            <div
              className="layer-3d absolute -right-1 top-[30%] sm:-right-5"
              style={{ transform: `${shift(42)} translateZ(200px)` }}
            >
              <div className="chip-glass animate-float-slow rounded-full px-3.5 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wide2 text-teal-800">
                  Aligners
                </span>
              </div>
            </div>

            <div
              className="layer-3d absolute -left-2 bottom-[24%] sm:-left-6"
              style={{ transform: `${shift(38)} translateZ(180px)` }}
            >
              <div className="chip-glass animate-float rounded-full px-3.5 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wide2 text-teal-800">
                  Whitening
                </span>
              </div>
            </div>

            <div
              className="layer-3d absolute right-[2%] bottom-[20%] sm:right-[-2%]"
              style={{ transform: `${shift(46)} translateZ(215px)` }}
            >
              <div className="chip-glass animate-float-slow rounded-full px-3.5 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wide2 text-teal-800">
                  Kids&apos; dentistry
                </span>
              </div>
            </div>

            {/* Pearl + gold geometry */}
            <div
              className="layer-3d absolute bottom-[2%] left-[-1%]"
              style={{ transform: `${shift(50)} translateZ(225px)` }}
            >
              <div className="h-12 w-12 animate-float-slow rounded-full orb-pearl sm:h-16 sm:w-16" />
            </div>
            <div
              className="layer-3d absolute right-[14%] top-[2%]"
              style={{ transform: `${shift(56)} translateZ(235px)` }}
            >
              <div className="relative h-8 w-8 sm:h-10 sm:w-10">
                <div className="h-full w-full animate-float rounded-full orb-gold" />
                <div className="absolute -inset-2.5 animate-pulse-ring rounded-full border border-gold-400/50" />
              </div>
            </div>

            {/* Light shards */}
            <div
              aria-hidden="true"
              className="layer-3d absolute -left-5 bottom-[42%] h-20 w-1.5 rounded-full shard"
              style={{ transform: `${shift(24)} translateZ(95px) rotate(-14deg)` }}
            />
            <div
              aria-hidden="true"
              className="layer-3d absolute -right-3 top-[52%] h-14 w-1 rounded-full shard opacity-70"
              style={{ transform: `${shift(16)} translateZ(70px) rotate(11deg)` }}
            />

            {/* Booking pulse badge */}
            <Link
              to="/contact"
              className="layer-3d absolute bottom-[30%] right-[-4%] flex items-center gap-2 rounded-full bg-teal-800 px-3.5 py-2.5 text-[9px] font-semibold uppercase tracking-wide2 text-ivory shadow-lift transition-transform hover:-translate-y-0.5 sm:right-[-6%]"
              style={{ transform: `${shift(30)} translateZ(195px)` }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-300" />
              </span>
              Booking now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
