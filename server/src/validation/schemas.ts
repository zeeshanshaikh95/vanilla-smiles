import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value === '' || value.startsWith('/') || /^https?:\/\//i.test(value),
    'Use an https:// link or a path starting with /'
  );

const stockStatus = z.enum(['in_stock', 'out_of_stock']);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z
    .string()
    .min(10, 'Use at least 10 characters')
    .max(128, 'That password is too long')
    .refine((v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v), 'Include at least one letter and one number'),
});

const variantSchema = z.object({
  name: z.string().trim().min(1, 'Give the size or option a name').max(60),
  price: z.number().min(0).nullable(),
  stockStatus: stockStatus.default('in_stock'),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Give the piece a name').max(140),
  slug: z.string().trim().max(90).optional(),
  description: z.string().trim().max(4000).default(''),
  price: z.number().min(0).nullable().default(null),
  compareAtPrice: z.number().min(0).nullable().default(null),
  fabric: z.string().trim().max(400).default(''),
  care: z.string().trim().max(600).default(''),
  colour: z.string().trim().max(120).default(''),
  category: z.string().trim().regex(/^[a-f0-9]{24}$/i, 'Choose a category').nullable().default(null),
  images: z.array(optionalUrl).max(10).default([]),
  variants: z.array(variantSchema).max(20).default([]),
  stockStatus: stockStatus.default('in_stock'),
  bestseller: z.boolean().default(false),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  seoTitle: z.string().trim().max(160).default(''),
  seoDescription: z.string().trim().max(320).default(''),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  archived: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Give the category a name').max(80),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(600).default(''),
  image: optionalUrl.default(''),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});

export const reviewSchema = z.object({
  customerName: z.string().trim().min(2, 'Add the customer name').max(80),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(5, 'Add the review text').max(1200),
  image: optionalUrl.default(''),
  status: z.enum(['pending', 'approved', 'hidden']).default('pending'),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});

export const gallerySchema = z.object({
  image: optionalUrl.default(''),
  caption: z.string().trim().max(200).default(''),
  externalUrl: optionalUrl.default(''),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
});

export const heroSlideSchema = z.object({
  imageUrl: optionalUrl.default(''),
  eyebrow: z.string().trim().max(60).default(''),
  headline: z.string().trim().max(120).default(''),
  subheadline: z.string().trim().max(400).default(''),
  ctaLabel: z.string().trim().max(40).default('Shop the edit'),
  ctaHref: z.string().trim().max(200).default('/shop'),
  active: z.boolean().default(true),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(120).default(''),
  whatsappNumber: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === '' || /^[0-9]{8,15}$/.test(v.replace(/[\s+-]/g, '')), 'Use digits only, with country code'),
  instagramUrl: optionalUrl.default(''),
  instagramHandle: z.string().trim().max(60).default(''),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]).default(''),
  city: z.string().trim().max(80).default(''),
  mapsUrl: optionalUrl.default(''),
  whatsappTemplate: z.string().trim().min(1).max(2000),
  whatsappSingleProductTemplate: z.string().trim().min(1).max(2000),
  heroSlides: z.array(heroSlideSchema).max(8).default([]),
  about: z.object({
    intro: z.string().trim().max(1200).default(''),
    story: z.string().trim().max(6000).default(''),
    founderImageUrl: optionalUrl.default(''),
  }),
  announcements: z.object({
    enabled: z.boolean().default(false),
    text: z.string().trim().max(200).default(''),
  }),
  policies: z.object({
    shipping: z.string().trim().max(3000).default(''),
    returns: z.string().trim().max(3000).default(''),
  }),
});

export const analyticsSchema = z.object({
  type: z.enum(['page_view', 'product_view', 'whatsapp_click', 'cart_add', 'order_whatsapp_click']),
  productSlug: z.string().trim().max(120).optional(),
  path: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(500).optional(),
  sessionId: z.string().trim().max(80).optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().regex(/^[a-f0-9]{24}$/i), displayOrder: z.number().int().min(0) })).min(1),
});

export const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'hidden']),
});
