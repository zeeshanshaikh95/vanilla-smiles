/**
 * Preview catalogue.
 *
 * A static host such as GitHub Pages cannot run the Express API, so the Pages
 * build ships a snapshot of the live catalogue and reads it from
 * `/demo/catalogue.json`. It is opt-in via `VITE_DEMO_CATALOGUE=true` — when an
 * API is configured the storefront always talks to the API instead.
 *
 * Regenerate the snapshot with `npm run demo:catalogue` while the API is
 * running locally. Admin, analytics and ordering-by-server are unavailable in
 * this mode by design.
 */
import type { Category, GalleryItem, Product, PublicSettings, Review } from '@/types';

export interface CatalogueSnapshot {
  generatedAt: string;
  settings: PublicSettings;
  products: Product[];
  categories: Category[];
  reviews: Review[];
  gallery: GalleryItem[];
}

export function isDemoCatalogue(): boolean {
  return import.meta.env.VITE_DEMO_CATALOGUE === 'true';
}

let cached: Promise<CatalogueSnapshot> | null = null;

export function loadCatalogueSnapshot(): Promise<CatalogueSnapshot> {
  if (!cached) {
    cached = fetch(`${import.meta.env.BASE_URL}demo/catalogue.json`, { cache: 'no-cache' }).then(
      async (response) => {
        if (!response.ok) throw new Error('The preview catalogue could not be loaded.');
        return (await response.json()) as CatalogueSnapshot;
      }
    );
  }
  return cached;
}

export interface DemoQuery {
  search?: string;
  category?: string;
  sort?: 'featured' | 'bestseller' | 'newest' | 'price_asc' | 'price_desc';
}

export function querySnapshotProducts(
  products: Product[],
  categories: Category[],
  query: DemoQuery
): Product[] {
  const search = (query.search ?? '').trim().toLowerCase();
  const category = query.category
    ? categories.find((item) => item.slug === query.category)
    : undefined;

  let result = products.filter((product) => {
    if (category && product.category?.slug !== category.slug) return false;
    if (!search) return true;
    return `${product.name} ${product.description} ${product.fabric} ${product.colour}`
      .toLowerCase()
      .includes(search);
  });

  const price = (product: Product) => product.price ?? Number.POSITIVE_INFINITY;

  switch (query.sort) {
    case 'newest':
      result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'bestseller':
      result = [...result].sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
      break;
    case 'price_asc':
      result = [...result].sort((a, b) => price(a) - price(b));
      break;
    case 'price_desc':
      result = [...result].sort((a, b) => price(b) - price(a));
      break;
    default:
      result = [...result].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder
      );
  }

  return result;
}
