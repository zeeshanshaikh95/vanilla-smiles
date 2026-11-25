import type { Request, Response } from 'express';
import { Review } from '../models/review.model.js';
import { ApiError } from '../middleware/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { reviewSchema, statusSchema } from '../validation/schemas.js';

export const listAdminReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await Review.find().sort({ status: 1, displayOrder: 1, createdAt: -1 }).lean();
  res.json({ reviews });
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const input = reviewSchema.parse(req.body ?? {});
  const review = await Review.create(input);
  res.status(201).json({ review });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const input = reviewSchema.parse(req.body ?? {});
  const review = await Review.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true,
  });
  if (!review) throw new ApiError(404, 'Review not found.');
  res.json({ review });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  res.json({ ok: true });
});

export const setReviewStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = statusSchema.parse(req.body ?? {});
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) throw new ApiError(404, 'Review not found.');
  res.json({ review });
});
