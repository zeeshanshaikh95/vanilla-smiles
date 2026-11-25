import { api, resolveAssetUrl } from './client';
import {
  isDemoCatalogue,
  loadCatalogueSnapshot,
  querySnapshotProducts,
} from './demo';
import type {
  AdminSettings,
  AnalyticsSummary,
  Category,
  GalleryItem,
  Product,
  PublicSettings,
  Review,
} from '@/types';

function cleanImage(value: unknown): string {
  const url = String(value ?? '').trim();
  if (!url) return '';
  return resolveAssetUrl(url);
}

function normProduct(product: Product): Product {
  return { ...product, images: (product.images ?? []).map(cleanImage).filter(Boolean) };
}

function normCategory(category: Category): Category {
  return { ...category, image: cleanImage(category.image) };
}

function normReview(review: Review): Review {
  return { ...review, image: cleanImage(review.image) };
}

function normGalleryItem(item: GalleryItem): GalleryItem {
  return { ...item, image: cleanImage(item.image) };
}

function normSettings(settings: PublicSettings): PublicSettings {
  return {
    ...settings,
    heroSlides: (settings.heroSlides ?? []).map((slide) => ({
      ...slide,
      imageUrl: cleanImage(slide.imageUrl),
    })),
    about: { ...settings.about, founderImageUrl: cleanImage(settings.about?.founderImageUrl) },
  };
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  sort?: 'featured' | 'bestseller' | 'newest' | 'price_asc' | 'price_desc';
}

function toQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

// ── Public ──────────────────────────────────────────────────────

export const publicApi = {
  getSettings: () =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => ({ settings: snapshot.settings }))
      : api.get<{ settings: PublicSettings }>('/settings')
    ).then((r) => ({ settings: normSettings(r.settings) })),

  listProducts: (params: ProductQueryParams = {}) =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => ({
          products: querySnapshotProducts(snapshot.products, snapshot.categories, params),
        }))
      : api.get<{ products: Product[] }>(
          `/products${toQuery({ search: params.search, category: params.category, sort: params.sort })}`
        )
    ).then((r) => ({ products: r.products.map(normProduct) })),

  getProduct: (slug: string) =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => {
          const product = snapshot.products.find((item) => item.slug === slug);
          if (!product) throw new Error('That piece is no longer available.');
          return { product };
        })
      : api.get<{ product: Product }>(`/products/${encodeURIComponent(slug)}`)
    ).then((r) => ({ product: normProduct(r.product) })),

  getRelated: (slug: string) =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => {
          const current = snapshot.products.find((item) => item.slug === slug);
          const related = snapshot.products.filter(
            (item) =>
              item.slug !== slug &&
              (!current?.category || item.category?.slug === current.category.slug)
          );
          return { products: (related.length ? related : snapshot.products.filter((item) => item.slug !== slug)).slice(0, 4) };
        })
      : api.get<{ products: Product[] }>(`/products/${encodeURIComponent(slug)}/related`)
    ).then((r) => ({ products: r.products.map(normProduct) })),

  listCategories: () =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => ({ categories: snapshot.categories }))
      : api.get<{ categories: Category[] }>('/categories')
    ).then((r) => ({ categories: r.categories.map(normCategory) })),

  getCategory: (slug: string) =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => {
          const category = snapshot.categories.find((item) => item.slug === slug);
          if (!category) throw new Error('That collection could not be found.');
          return {
            category,
            products: snapshot.products.filter((item) => item.category?.slug === slug),
          };
        })
      : api.get<{ category: Category; products: Product[] }>(
          `/categories/${encodeURIComponent(slug)}`
        )
    ).then((r) => ({
      category: normCategory(r.category),
      products: r.products.map(normProduct),
    })),

  listReviews: () =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => ({ reviews: snapshot.reviews }))
      : api.get<{ reviews: Review[] }>('/reviews')
    ).then((r) => ({ reviews: r.reviews.map(normReview) })),

  listGallery: () =>
    (isDemoCatalogue()
      ? loadCatalogueSnapshot().then((snapshot) => ({ items: snapshot.gallery }))
      : api.get<{ items: GalleryItem[] }>('/gallery')
    ).then((r) => ({ items: r.items.map(normGalleryItem) })),
};

// ── Admin ───────────────────────────────────────────────────────

export interface ProductInput {
  name: string;
  slug?: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  fabric: string;
  care: string;
  colour: string;
  category: string | null;
  images: string[];
  variants: Array<{ name: string; price: number | null; stockStatus: 'in_stock' | 'out_of_stock' }>;
  stockStatus: 'in_stock' | 'out_of_stock';
  bestseller: boolean;
  featured: boolean;
  newArrival: boolean;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  archived: boolean;
}

export interface AdminSessionUser {
  id: string;
  email: string;
  mustChangePassword?: boolean;
}

export const adminApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; admin: AdminSessionUser }>('/admin/auth/login', { email, password }),
  me: () => api.get<{ admin: AdminSessionUser }>('/admin/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ ok: boolean; admin?: AdminSessionUser }>('/admin/auth/password', {
      currentPassword,
      newPassword,
    }),

  listProducts: () =>
    api
      .get<{ products: Product[] }>('/admin/products')
      .then((r) => ({ products: r.products.map(normProduct) })),
  getProduct: (id: string) =>
    api
      .get<{ product: Product }>(`/admin/products/${id}`)
      .then((r) => ({ product: normProduct(r.product) })),
  createProduct: (input: ProductInput) =>
    api.post<{ product: Product }>('/admin/products', input),
  updateProduct: (id: string, input: ProductInput) =>
    api.put<{ product: Product }>(`/admin/products/${id}`, input),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  archiveProduct: (id: string) => api.post<{ product: Product }>(`/admin/products/${id}/archive`),
  restoreProduct: (id: string) => api.post<{ product: Product }>(`/admin/products/${id}/restore`),

  listCategories: () =>
    api
      .get<{ categories: Category[] }>('/admin/categories')
      .then((r) => ({ categories: r.categories.map(normCategory) })),
  createCategory: (input: Partial<Category>) =>
    api.post<{ category: Category }>('/admin/categories', input),
  updateCategory: (id: string, input: Partial<Category>) =>
    api.put<{ category: Category }>(`/admin/categories/${id}`, input),
  deleteCategory: (id: string) =>
    api.delete<{ ok: boolean; detachedProducts: number }>(`/admin/categories/${id}`),
  reorderCategories: (items: Array<{ id: string; displayOrder: number }>) =>
    api.put('/admin/categories/reorder', { items }),

  listReviews: () =>
    api
      .get<{ reviews: Review[] }>('/admin/reviews')
      .then((r) => ({ reviews: r.reviews.map(normReview) })),
  createReview: (input: Partial<Review>) => api.post<{ review: Review }>('/admin/reviews', input),
  updateReview: (id: string, input: Partial<Review>) =>
    api.put<{ review: Review }>(`/admin/reviews/${id}`, input),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
  setReviewStatus: (id: string, status: Review['status']) =>
    api.post<{ review: Review }>(`/admin/reviews/${id}/status`, { status }),

  listGallery: () =>
    api
      .get<{ items: GalleryItem[] }>('/admin/gallery')
      .then((r) => ({ items: r.items.map(normGalleryItem) })),
  createGalleryItem: (input: Partial<GalleryItem>) =>
    api.post<{ item: GalleryItem }>('/admin/gallery', input),
  updateGalleryItem: (id: string, input: Partial<GalleryItem>) =>
    api.put<{ item: GalleryItem }>(`/admin/gallery/${id}`, input),
  deleteGalleryItem: (id: string) => api.delete(`/admin/gallery/${id}`),

  getAnalytics: (range: '7' | '30' | '90' = '30') =>
    api.get<AnalyticsSummary>(`/admin/analytics?range=${range}`),

  getSettings: () =>
    api
      .get<{ settings: AdminSettings }>('/admin/settings')
      .then((r) => ({
        settings: { ...normSettings(r.settings), updatedAt: r.settings.updatedAt },
      })),
  updateSettings: (input: AdminSettings) =>
    api.put<{ settings: AdminSettings }>('/admin/settings', input),

  uploadImages: (files: FileList | File[]) => {
    const form = new FormData();
    Array.from(files).forEach((file) => form.append('images', file));
    return api.upload<{ urls: string[]; images: Array<{ url: string; publicId: string }> }>(
      '/admin/uploads',
      form
    );
  },
};

export type { AdminSettings, AnalyticsSummary, Category, GalleryItem, Product, PublicSettings, Review };
