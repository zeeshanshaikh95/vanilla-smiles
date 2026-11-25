export type StockStatus = 'in_stock' | 'out_of_stock';

export interface ProductVariant {
  name: string;
  price: number | null;
  stockStatus: StockStatus;
}

export interface CategoryRef {
  _id?: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  fabric: string;
  care: string;
  colour: string;
  category: CategoryRef | null;
  images: string[];
  variants: ProductVariant[];
  stockStatus: StockStatus;
  bestseller: boolean;
  featured: boolean;
  newArrival: boolean;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface Review {
  _id: string;
  customerName: string;
  rating: number;
  text: string;
  image: string;
  status: ReviewStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  _id: string;
  image: string;
  caption: string;
  externalUrl: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  imageUrl: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

export interface PublicSettings {
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
  heroSlides: HeroSlide[];
  about: { intro: string; story: string; founderImageUrl: string };
  announcements: { enabled: boolean; text: string };
  policies: { shipping: string; returns: string };
}

export interface AdminSettings extends PublicSettings {
  updatedAt: string;
}

export interface AnalyticsSummary {
  range: { days: number; since: string };
  totals: {
    events: number;
    pageViews: number;
    productViews: number;
    whatsappClicks: number;
    cartAdds: number;
    orderWhatsappClicks: number;
  };
  topProducts: Array<{ slug: string; name: string | null; exists: boolean; count: number }>;
  topPaths: Array<{ _id: string; count: number }>;
  topReferrers: Array<{ _id: string; count: number }>;
  productCount: number;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number | null;
  variantName: string | null;
  quantity: number;
  maxQuantity: number;
}
