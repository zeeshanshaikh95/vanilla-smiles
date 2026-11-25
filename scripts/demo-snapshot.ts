/**
 * Writes client/public/demo/catalogue.json without a database.
 *
 * The GitHub Pages build has no API, so the static preview ships this snapshot
 * and reads it through src/api/demo.ts. It is generated from the exact same
 * catalogue the database seed uses, so nothing can drift.
 *
 *   npx tsx scripts/demo-snapshot.ts
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { categories, gallery, treatments } from '../server/src/seed/catalogue.js';
import {
  HERO_SLIDES_DEFAULT,
  WHATSAPP_TEMPLATE_DEFAULT,
  WHATSAPP_TEMPLATE_SINGLE_DEFAULT,
} from '../server/src/models/siteSettings.model.js';

const OUT = path.resolve('client/public/demo/catalogue.json');
const now = new Date().toISOString();

const objectId = (index: number) => `${index}`.padStart(24, '0');

async function main() {
  const categoryDocs = categories.map((category, index) => ({
    _id: objectId(index + 100),
    ...category,
    createdAt: now,
    updatedAt: now,
  }));

  const categoryBySlug = new Map(categoryDocs.map((category) => [category.slug, category]));

  const productDocs = treatments.map((treatment, index) => {
    const category = categoryBySlug.get(treatment.categorySlug) ?? null;
    // Stagger timestamps so "recently added" sorting has something real to sort by.
    const createdAt = new Date(Date.now() - (treatments.length - treatment.displayOrder) * 36e5).toISOString();
    return {
      _id: objectId(index + 1),
      name: treatment.name,
      slug: treatment.slug,
      description: treatment.description,
      price: treatment.price,
      compareAtPrice: treatment.compareAtPrice,
      fabric: treatment.fabric,
      care: treatment.care,
      colour: treatment.colour,
      category: category ? { _id: category._id, name: category.name, slug: category.slug } : null,
      images: treatment.images,
      variants: treatment.variants,
      stockStatus: treatment.stockStatus ?? 'in_stock',
      bestseller: treatment.bestseller,
      featured: treatment.featured,
      newArrival: treatment.newArrival,
      seoTitle: '',
      seoDescription: '',
      displayOrder: treatment.displayOrder,
      archived: false,
      createdAt,
      updatedAt: now,
    };
  });

  const snapshot = {
    generatedAt: now,
    settings: {
      businessName: 'Vanilla Smiles',
      tagline: 'Dental & Esthetic Care',
      whatsappNumber: '919004704391',
      instagramUrl: 'https://www.instagram.com/vanillasmilesclinic/',
      instagramHandle: 'vanillasmilesclinic',
      email: '',
      city: 'Andheri West, Mumbai',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Vanilla+Smiles+Dental+Clinic+A-002+Aditi+CHS+MHADA+Rd+Andheri+West+Mumbai+400053',
      whatsappTemplate: WHATSAPP_TEMPLATE_DEFAULT,
      whatsappSingleProductTemplate: WHATSAPP_TEMPLATE_SINGLE_DEFAULT,
      heroSlides: HERO_SLIDES_DEFAULT,
      about: {
        intro:
          'Vanilla Smiles is a dental and esthetic practice in Andheri West, Mumbai — general, cosmetic and children’s dentistry under one roof, at a pace that leaves room for questions.',
        story: '',
        founderImageUrl: '/images/clinic-interior.jpg',
      },
      announcements: {
        enabled: true,
        text: 'Mon – Sat · 10:00 – 21:00 · Andheri West, Mumbai · Walk-ins subject to slots',
      },
      policies: { shipping: '', returns: '' },
    },
    products: productDocs,
    categories: categoryDocs,
    reviews: [],
    gallery: gallery.map((item, index) => ({
      _id: objectId(index + 200),
      ...item,
      active: true,
      createdAt: now,
      updatedAt: now,
    })),
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`[demo] snapshot written: ${productDocs.length} treatments, ${categoryDocs.length} departments`);
}

main().catch((error) => {
  console.error('[demo] failed', error);
  process.exit(1);
});
