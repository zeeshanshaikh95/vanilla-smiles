import mongoose, { Schema, model, type Model } from 'mongoose';

export interface IHeroSlide {
  imageUrl: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

export const HERO_SLIDES_DEFAULT: IHeroSlide[] = [
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
    ctaHref: '/category/smile-design',
    active: true,
  },
  {
    imageUrl: '/images/hero-aligners.jpg',
    eyebrow: 'Aligners & braces',
    headline: 'Straighten quietly, at your pace',
    subheadline:
      'Clear aligners and ceramic braces with a plan you can see from day one, and check-ins that keep it on track.',
    ctaLabel: 'Explore orthodontics',
    ctaHref: '/category/orthodontics',
    active: true,
  },
  {
    imageUrl: '/images/hero-kids.jpg',
    eyebrow: "Children's dentistry",
    headline: 'First visits that do not scare',
    subheadline:
      'A tell–show–do approach for young patients, so a check-up becomes something they stop worrying about.',
    ctaLabel: 'Book a kids check-up',
    ctaHref: '/category/kids-dentistry',
    active: true,
  },
];

export const WHATSAPP_TEMPLATE_DEFAULT =
  'Hello Vanilla Smiles! 🦷\n' +
  'I would like to book an appointment for:\n' +
  '{{ITEMS}}\n' +
  'Indicative total: {{TOTAL}}\n\n' +
  'Please share the next available slots.';

export const WHATSAPP_TEMPLATE_SINGLE_DEFAULT =
  'Hello Vanilla Smiles! 🦷\n' +
  'I would like to ask about:\n' +
  '• {{PRODUCT}}\n' +
  '{{VARIANT_LINE}}{{QTY_LINE}}Fee: {{PRICE}}\n\n' +
  'Please share availability and what the visit involves.';

export interface ISiteSettings {
  businessName: string;
  tagline: string;
  whatsappNumber: string;
  instagramUrl: string;
  instagramHandle: string;
  email: string;
  city: string;
  mapsUrl: string;
  whatsappTemplate: string;
  whatsappSingleProductTemplate: string;
  heroSlides: IHeroSlide[];
  about: {
    intro: string;
    story: string;
    founderImageUrl: string;
  };
  announcements: {
    enabled: boolean;
    text: string;
  };
  policies: {
    shipping: string;
    returns: string;
  };
  updatedAt: Date;
}

const slideSchema = new Schema<IHeroSlide>(
  {
    imageUrl: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    headline: { type: String, default: '' },
    subheadline: { type: String, default: '' },
    ctaLabel: { type: String, default: 'Book an appointment' },
    ctaHref: { type: String, default: '/contact' },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    businessName: { type: String, default: 'Vanilla Smiles' },
    tagline: { type: String, default: 'Dental & Esthetic Care' },
    // Published clinic number; confirmed from the clinic's public listing.
    whatsappNumber: { type: String, default: '919004704391' },
    instagramUrl: { type: String, default: 'https://www.instagram.com/vanillasmilesclinic/' },
    instagramHandle: { type: String, default: 'vanillasmilesclinic' },
    email: { type: String, default: '' },
    city: { type: String, default: 'Andheri West, Mumbai' },
    mapsUrl: {
      type: String,
      default:
        'https://www.google.com/maps/search/?api=1&query=Vanilla+Smiles+Dental+Clinic+A-002+Aditi+CHS+MHADA+Rd+Andheri+West+Mumbai+400053',
    },
    whatsappTemplate: { type: String, default: WHATSAPP_TEMPLATE_DEFAULT },
    whatsappSingleProductTemplate: { type: String, default: WHATSAPP_TEMPLATE_SINGLE_DEFAULT },
    heroSlides: { type: [slideSchema], default: () => HERO_SLIDES_DEFAULT },
    about: {
      intro: {
        type: String,
        default:
          'Vanilla Smiles is a dental and esthetic practice in Andheri West, Mumbai — general, cosmetic and children’s dentistry under one roof, at a pace that leaves room for questions.',
      },
      story: { type: String, default: '' },
      founderImageUrl: { type: String, default: '/images/clinic-interior.jpg' },
    },
    announcements: {
      enabled: { type: Boolean, default: true },
      text: {
        type: String,
        default: 'Mon – Sat · 10:00 – 21:00 · Andheri West, Mumbai · Walk-ins subject to slots',
      },
    },
    policies: {
      shipping: { type: String, default: '' },
      returns: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ?? model<ISiteSettings>('SiteSettings', siteSettingsSchema);
