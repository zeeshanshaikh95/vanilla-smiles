import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { Wordmark } from '@/components/Wordmark';
import { normaliseNumber } from '@/lib/whatsapp';

const CLINIC_ADDRESS = 'A-002, Aditi CHS, MHADA Rd, opp. MTNL, Andheri West, Mumbai 400053';

export function Footer() {
  const { settings } = useSettings();
  const whatsapp = normaliseNumber(settings.whatsappNumber);
  const instagram = settings.instagramUrl || 'https://www.instagram.com/vanillasmilesclinic/';

  return (
    <footer className="mt-24 border-t border-teal-900/10 bg-mist/60">
      <div className="shell grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:py-16">
        <div>
          <Wordmark size="md" asLink={false} />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-soft">
            {settings.about.intro ||
              'A calm, precise dental and esthetic practice in Andheri West — general, cosmetic and children’s dentistry under one roof.'}
          </p>
        </div>

        <div>
          <p className="eyebrow">Treatments</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link to="/shop" className="hover:text-teal-800">All treatments</Link></li>
            <li><Link to="/category/general-dentistry" className="hover:text-teal-800">General dentistry</Link></li>
            <li><Link to="/category/smile-design" className="hover:text-teal-800">Smile design</Link></li>
            <li><Link to="/category/orthodontics" className="hover:text-teal-800">Aligners &amp; braces</Link></li>
            <li><Link to="/category/kids-dentistry" className="hover:text-teal-800">Kids&apos; dentistry</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Clinic</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li><Link to="/about" className="hover:text-teal-800">About the clinic</Link></li>
            <li><Link to="/gallery" className="hover:text-teal-800">Smile gallery</Link></li>
            <li><Link to="/reviews" className="hover:text-teal-800">Patient reviews</Link></li>
            <li><Link to="/contact" className="hover:text-teal-800">Visit &amp; contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Visit us</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li className="leading-relaxed">{CLINIC_ADDRESS}</li>
            <li>Mon – Sat · 10:00 – 21:00</li>
            {whatsapp ? (
              <li>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-teal-800">
                  +91 {whatsapp.slice(-10)}
                </a>
              </li>
            ) : null}
            <li>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-teal-800">
                Instagram · @{settings.instagramHandle.replace(/^@/, '')}
              </a>
            </li>
            {settings.email ? (
              <li><a href={`mailto:${settings.email}`} className="hover:text-teal-800">{settings.email}</a></li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-teal-900/10">
        <div className="shell flex flex-col items-start justify-between gap-3 py-5 text-[10px] uppercase tracking-wide2 text-ink-faint sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link to="/contact" className="hover:text-teal-800">Policies</Link>
            <Link to="/admin" className="hover:text-teal-800">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
