import type { Request, Response } from 'express';
import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { Review } from '../models/review.model.js';
import { GalleryItem } from '../models/galleryItem.model.js';
import { AnalyticsEvent } from '../models/analyticsEvent.model.js';
import { getSettings } from '../services/settingsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errors.js';
import { analyticsSchema } from '../validation/schemas.js';
import { escapeRegExp } from '../utils/query.js';

const SORTS: Record<string, Record<string, 1 | -1>> = {
  featured: { featured: -1, displayOrder: 1, createdAt: -1 },
  bestseller: { bestseller: -1, displayOrder: 1, createdAt: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1, displayOrder: 1 },
  price_desc: { price: -1, displayOrder: 1 },
  order: { displayOrder: 1, createdAt: -1 },
};

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const search = String(req.query.search ?? '').trim();
  const categorySlug = String(req.query.category ?? '').trim();
  const sortKey = String(req.query.sort ?? 'featured');

  const filter: Record<string, unknown> = { archived: false };

  if (search) {
    const rx = new RegExp(escapeRegExp(search), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { fabric: rx }, { colour: rx }];
  }

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).select('_id').lean();
    if (!category) {
      res.json({ products: [] });
      return;
    }
    filter.category = category._id;
  }

  const products = await Product.find(filter)
    .sort(SORTS[sortKey] ?? SORTS.featured)
    .limit(200)
    .populate('category', 'name slug')
    .lean();

  res.json({ products });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: String(req.params.slug), archived: false })
    .populate('category', 'name slug')
    .lean();
  if (!product) throw new ApiError(404, 'That piece is no longer available.');
  res.json({ product });
});

export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: String(req.params.slug), archived: false })
    .select('category')
    .lean();
  if (!product) throw new ApiError(404, 'That piece is no longer available.');

  const byCategory = product.category
    ? await Product.find({
        archived: false,
        _id: { $ne: product._id },
        category: product.category,
      })
        .sort({ featured: -1, displayOrder: 1 })
        .limit(4)
        .populate('category', 'name slug')
        .lean()
    : [];

  if (byCategory.length >= 2) {
    res.json({ products: byCategory });
    return;
  }

  const fallback = await Product.find({ archived: false, _id: { $ne: product._id } })
    .sort({ bestseller: -1, displayOrder: 1 })
    .limit(4)
    .populate('category', 'name slug')
    .lean();

  res.json({ products: fallback });
});

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
  res.json({ categories });
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: String(req.params.slug) }).lean();
  if (!category) throw new ApiError(404, 'That collection could not be found.');

  const products = await Product.find({ category: category._id, archived: false })
    .sort({ displayOrder: 1, createdAt: -1 })
    .populate('category', 'name slug')
    .lean();

  res.json({ category, products });
});

export const listReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await Review.find({ status: 'approved' }).sort({ displayOrder: 1, createdAt: -1 }).lean();
  res.json({ reviews });
});

export const listGallery = asyncHandler(async (_req: Request, res: Response) => {
  const items = await GalleryItem.find({ active: true }).sort({ displayOrder: 1, createdAt: -1 }).lean();
  res.json({ items });
});

export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettings();
  res.json({ settings });
});

export const recordAnalyticsEvent = asyncHandler(async (req: Request, res: Response) => {
  const payload = analyticsSchema.parse(req.body ?? {});
  await AnalyticsEvent.create({
    type: payload.type,
    productSlug: payload.productSlug ?? '',
    path: payload.path ?? '',
    referrer: payload.referrer ?? '',
    sessionId: payload.sessionId ?? '',
  });
  res.status(202).json({ ok: true });
});
