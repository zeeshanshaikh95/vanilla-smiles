import { useSettings } from '@/context/SettingsContext';
import { Seo } from '@/components/seo/Seo';
import { buildOrderLink, buildSingleProductMessage, normaliseNumber } from '@/lib/whatsapp';

const HOURS = [
  ['Monday', '10:00 – 21:00'],
  ['Tuesday', '10:00 – 21:00'],
  ['Wednesday', '10:00 – 21:00'],
  ['Thursday', '10:00 – 21:00'],
  ['Friday', '10:00 – 21:00'],
  ['Saturday', '10:00 – 21:00'],
  ['Sunday', 'Closed'],
];

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Vanilla+Smiles+Dental+Clinic+A-002+Aditi+CHS+MHADA+Rd+Andheri+West+Mumbai+400053';

export function ContactPage() {
  const { settings } = useSettings();
  const whatsapp = normaliseNumber(settings.whatsappNumber);

  const bookLink = buildOrderLink(
    settings,
    buildSingleProductMessage(settings, {
      productName: 'an appointment',
      variantName: null,
      quantity: 1,
      price: null,
    })
  );

  const channels = [
    {
      label: 'WhatsApp',
      value: whatsapp ? 'Book or ask a question' : 'Set the number in Admin → Settings',
      href: whatsapp ? `https://wa.me/${whatsapp}` : null,
      note: 'Fastest route to a slot. Send a photo if something is hurting.',
    },
    {
      label: 'Phone',
      value: '+91 90047 04391',
      href: 'tel:+919004704391',
      note: 'Reception answers during clinic hours, Monday to Saturday.',
    },
    {
      label: 'Instagram',
      value: `@${settings.instagramHandle.replace(/^@/, '')}`,
      href: settings.instagramUrl || 'https://www.instagram.com/vanillasmilesclinic/',
      note: 'Clinic notes, cases and the occasional reminder to floss.',
    },
  ];

  return (
    <>
      <Seo
        title="Visit & book — Vanilla Smiles, Andheri West"
        description="Book a dental appointment at Vanilla Smiles, A-002 Aditi CHS, MHADA Road, Andheri West, Mumbai 400053. Mon–Sat 10am–9pm. Call +91 90047 04391."
        canonicalPath="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Dentist',
          name: 'Vanilla Smiles Dental & Esthetic Care',
          telephone: '+919004704391',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'A-002, Aditi CHS, MHADA Rd, opposite MTNL',
            addressLocality: 'Andheri West, Mumbai',
            postalCode: '400053',
            addressCountry: 'IN',
          },
          openingHours: 'Mo-Sa 10:00-21:00',
        }}
      />

      <section className="relative overflow-hidden border-b border-teal-900/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(55% 90% at 78% 6%, #E8F2EF 0%, rgba(232,242,239,0) 68%)' }}
        />
        <div className="shell relative py-14 sm:py-20">
          <p className="eyebrow">Visit &amp; book</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.0] text-balance text-teal-900 sm:text-7xl">
            Tell us what hurts. We’ll find you a slot.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-[1.9] text-ink-soft">
            A person reads every message. Describe the problem, or just ask for a routine check-up — we
            will tell you honestly whether it can wait.
          </p>
        </div>
      </section>

      <div className="shell grid gap-4 py-12 sm:py-16 md:grid-cols-3">
        {channels.map((channel) => (
          <div key={channel.label} className="glass p-6 sm:p-7">
            <p className="eyebrow">{channel.label}</p>
            {channel.href ? (
              <a
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="mt-4 block font-display text-2xl text-teal-900 hover:opacity-70"
              >
                {channel.value}
              </a>
            ) : (
              <p className="mt-4 font-display text-2xl text-ink-faint">{channel.value}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{channel.note}</p>
          </div>
        ))}
      </div>

      <section className="shell grid gap-6 pb-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="panel p-6 sm:p-8">
            <p className="eyebrow">Clinic hours</p>
            <dl className="mt-4 divide-y divide-teal-900/10">
              {HOURS.map(([day, time]) => (
                <div key={day} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-ink-soft">{day}</dt>
                  <dd className={time === 'Closed' ? 'text-wine-600' : 'text-teal-900'}>{time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[11px] leading-relaxed text-ink-faint">
              Dental emergencies are seen as soon as a chair is free. Message before you travel and we
              will hold a slot if we can.
            </p>
          </div>

          <div className="panel mt-4 p-6 sm:p-8">
            <p className="eyebrow">Fees &amp; payment</p>
            <div className="prose-editorial mt-3">
              {settings.policies.shipping ? (
                <p className="whitespace-pre-line">{settings.policies.shipping}</p>
              ) : (
                <p>
                  Consultation fees are shared when you book. Treatment costs are quoted in writing after
                  the examination — never mid-procedure. Card, UPI and cash are all accepted.
                </p>
              )}
              {settings.policies.returns ? (
                <p className="whitespace-pre-line">{settings.policies.returns}</p>
              ) : (
                <p>
                  If a plan changes after we begin, we stop and talk it through before continuing. You
                  are never billed for something you did not agree to.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <div className="overflow-hidden rounded-xl border border-teal-900/10 bg-ivory shadow-soft">
            <div className="relative aspect-[4/3] bg-mist">
              <img
                src="/images/clinic-reception.jpg"
                alt="Vanilla Smiles reception, Andheri West"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-6">
              <p className="eyebrow">Find us</p>
              <p className="mt-3 font-display text-xl leading-snug text-teal-900">
                A-002, Aditi CHS,<br />
                MHADA Rd, opposite MTNL,<br />
                Andheri West, Mumbai 400053
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Two minutes from the Four Bungalows signal. Step-free entrance.
              </p>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn-line mt-5 w-full">
                Open in Maps
              </a>
              {bookLink ? (
                <a
                  href={bookLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-solid mt-2.5 w-full"
                >
                  {bookLink.channel === 'whatsapp' ? 'Book on WhatsApp' : 'Message on Instagram'}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
