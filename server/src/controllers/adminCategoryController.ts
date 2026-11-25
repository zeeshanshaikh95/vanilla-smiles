import type { Request, Response } from 'express';
import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../middleware/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/query.js';
import { categorySchema, reorderSchema } from '../validation/schemas.js';

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'collection';
  let candidate = root;
  let suffix = 2;
  for (let i = 0; i < 50; i += 1) {
    const exists = await Category.findOne({
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

export const listAdminCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
  const counts = await Product.aggregate<{ _id: string; count: number }>([
    { $match: { archived: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((row) => [String(row._id), row.count]));
  res.json({
    categories: categories.map((category) => ({
      ...category,
      productCount: countMap.get(String(category._id)) ?? 0,
    })),
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = categorySchema.parse(req.body ?? {});
  const slug = await uniqueSlug(input.slug || input.name);
  const category = await Category.create({ ...input, slug });
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = categorySchema.parse(req.body ?? {});
  const existing = await Category.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Category not found.');

  const slug =
    input.slug && input.slug !== existing.slug
      ? await uniqueSlug(input.slug, String(existing._id))
      : existing.slug;

  Object.assign(existing, input, { slug });
  await existing.save();
  res.json({ category: existing });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');

  // Pieces stay in the catalogue, just uncategorised.
  const detached = await Product.updateMany({ category: category._id }, { category: null });
  await category.deleteOne();
  res.json({ ok: true, detachedProducts: detached.modifiedCount });
});

export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  const { items } = reorderSchema.parse(req.body ?? {});
  await Category.bulkWrite(
    items.map((item) => ({
      updateOne: { filter: { _id: item.id }, update: { displayOrder: item.displayOrder } },
    }))
  );
  res.json({ ok: true });
});
