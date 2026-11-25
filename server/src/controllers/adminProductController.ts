import type { Request, Response } from 'express';
import { Product } from '../models/product.model.js';
import { ApiError } from '../middleware/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/query.js';
import { productSchema } from '../validation/schemas.js';

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'piece';
  let candidate = root;
  let suffix = 2;
  // Bounded loop — a handful of collisions at most in practice.
  for (let i = 0; i < 50; i += 1) {
    const exists = await Product.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select('_id')
      .lean();
    if (!exists) return candidate;
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return `${root}-${Date.now()}`;
}

export const listAdminProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find()
    .sort({ archived: 1, displayOrder: 1, createdAt: -1 })
    .populate('category', 'name slug')
    .lean();
  res.json({ products });
});

export const getAdminProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug').lean();
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = productSchema.parse(req.body ?? {});
  const slug = await uniqueSlug(input.slug || input.name);
  const product = await Product.create({ ...input, slug });
  res.status(201).json({ product: await product.populate('category', 'name slug') });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = productSchema.parse(req.body ?? {});
  const existing = await Product.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Product not found.');

  const slug =
    input.slug && input.slug !== existing.slug
      ? await uniqueSlug(input.slug, String(existing._id))
      : existing.slug;

  Object.assign(existing, input, { slug });
  await existing.save();
  res.json({ product: await existing.populate('category', 'name slug') });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ ok: true });
});

export const archiveProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ product });
});

export const restoreProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { archived: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ product });
});
