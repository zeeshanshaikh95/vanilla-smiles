import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { Seo } from '@/components/seo/Seo';
import { assetUrl, FOUNDER_IMAGE } from '@/lib/brand';

export function AboutPage() {
  const { settings } = useSettings();
  const story =
    settings.about.story ||
    'Vanilla Smiles began with a simple observation: most people who avoid the dentist are not afraid of dentistry — they are afraid of being surprised. Of pain that was not explained, of a bill that arrived later, of being talked over while lying back in a chair.\n\nSo the clinic is built the other way round. Appointments are long enough to talk. Options are written down before treatment starts. Children are shown the instruments before anything is used, so a first visit becomes a story they tell rather than one they dread.\n\nWe are a general and esthetic dental practice in Andheri West — check-ups, cleaning, fillings and root canals, alongside aligners, smile design and whitening. The equipment is modern, the sterilisation is strict, and the pace is deliberately unhurried. Whatever brings you in, you will leave knowing what is happening in your mouth and what it will take to keep it healthy.';
  const paragraphs = story.split('\n').filter((paragraph) => paragraph.trim());

  return (
    <>
      <Seo
        title="The clinic — Vanilla Smiles, Andheri West"
        description="Vanilla Smiles is a dental and esthetic practice in Andheri West, Mumbai — general dentistry, smile design, aligners and children's care."
        canonicalPath="/about"
      />

      <section className="relative overflow-hidden border-b border-teal-900/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(55% 90% at 85% 10%, #E8F2EF 0%, rgba(232,242,239,0) 70%)' }}
        />
        <div className="shell relative py-14 sm:py-20">
          <p className="eyebrow">The clinic</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.0] text-balance text-teal-900 sm:text-7xl">
            Calm hands, clear answers.
          </h1>
          <div className="mt-8 flex flex-wrap gap-6 text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
            <span>{settings.city || 'Andheri West, Mumbai'}</span>
            <span>Mon – Sat · 10:00 – 21:00</span>
            <span>4.5★ on Google</span>
          </div>
        </div>
      </section>

      <section className="shell grid gap-10 py-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl bg-mist">
            <img
              src={settings.about.founderImageUrl || assetUrl(FOUNDER_IMAGE)}
              alt="The Vanilla Smiles treatment room"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide2 text-ink-faint">
            The treatment room, Andheri West
          </p>
        </div>

        <div className="prose-editorial lg:col-span-6 lg:col-start-7">
          <p className="eyebrow">Our approach</p>
          <h2 className="mb-6 mt-3 font-display text-4xl leading-tight text-teal-900">
            {settings.about.intro || 'Dentistry without the dread.'}
          </h2>
          {paragraphs.slice(0, 1).map((paragraph) => (
            <p key="first" className="text-base">{paragraph}</p>
          ))}
          {paragraphs.slice(1).map((paragraph, index) => (
            <p key={`rest-${index}`}>{paragraph}</p>
          ))}

          <div className="mt-8 border-t border-teal-900/10 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-micro text-ink-faint">
              Dental &amp; Esthetic Care
            </p>
            <Link to="/shop" className="btn-line mt-4">
              See the treatment menu
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-teal-900/10 bg-ivory py-14 sm:py-20">
        <div className="shell grid gap-px overflow-hidden rounded-xl bg-teal-900/10 sm:grid-cols-3">
          {[
            ['Explain first', 'A diagnosis and a written plan before treatment — including the option of waiting.'],
            ['Sterile, always', 'Instruments are pouch-sealed and autoclaved each cycle; single-use items are single-use.'],
            ['Children welcome', 'Tell–show–do for young patients, and a parent in the room whenever they want one.'],
          ].map(([title, text], index) => (
            <div key={title} className="bg-ivory p-7 sm:p-8">
              <p className="text-[10px] font-semibold tracking-wide2 text-gold-500">0{index + 1}</p>
              <h3 className="mt-4 font-display text-2xl text-teal-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-16">
        <div className="glass mx-auto max-w-3xl p-8 text-center sm:p-12">
          <p className="font-display text-2xl italic leading-snug text-balance text-teal-900 sm:text-3xl">
            “The best dentistry is the kind you stop thinking about afterwards.”
          </p>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-micro text-ink-faint">The clinic note</p>
          <Link to="/contact" className="btn-solid mt-7">
            Book an appointment
          </Link>
        </div>
      </section>
    </>
  );
}
