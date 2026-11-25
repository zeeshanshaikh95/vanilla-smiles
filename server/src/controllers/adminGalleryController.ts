import type { Request, Response } from 'express';
import { GalleryItem } from '../models/galleryItem.model.js';
import { ApiError } from '../middleware/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { gallerySchema } from '../validation/schemas.js';

export const listAdminGallery = asyncHandler(async (_req: Request, res: Response) => {
  const items = await GalleryItem.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
  res.json({ items });
});

export const createGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const input = gallerySchema.parse(req.body ?? {});
  const item = await GalleryItem.create(input);
  res.status(201).json({ item });
});

export const updateGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const input = gallerySchema.parse(req.body ?? {});
  const item = await GalleryItem.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new ApiError(404, 'Gallery item not found.');
  res.json({ item });
});

export const deleteGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await GalleryItem.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Gallery item not found.');
  res.json({ ok: true });
});
