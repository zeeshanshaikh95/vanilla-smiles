import { Router } from 'express';
import type { Response } from 'express';
import { loginLimiter, uploadLimiter } from '../middleware/rateLimiters.js';
import {
  requireAuth,
  requirePasswordChanged,
  type AuthRequest,
} from '../middleware/auth.js';
import { handleImageUpload, uploadsUrlFor } from '../middleware/upload.js';
import { ApiError } from '../middleware/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { changePassword, login, me } from '../controllers/adminAuthController.js';
import {
  archiveProduct,
  createProduct,
  deleteProduct,
  getAdminProduct,
  listAdminProducts,
  restoreProduct,
  updateProduct,
} from '../controllers/adminProductController.js';
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
  reorderCategories,
  updateCategory,
} from '../controllers/adminCategoryController.js';
import {
  createReview,
  deleteReview,
  listAdminReviews,
  setReviewStatus,
  updateReview,
} from '../controllers/adminReviewController.js';
import {
  createGalleryItem,
  deleteGalleryItem,
  listAdminGallery,
  updateGalleryItem,
} from '../controllers/adminGalleryController.js';
import { getAnalytics } from '../controllers/adminAnalyticsController.js';
import { getAdminSettings, updateAdminSettings } from '../controllers/adminSettingsController.js';

const router = Router();

// ── Auth (public) ───────────────────────────────────────────────
router.post('/auth/login', loginLimiter, login);
router.get('/auth/me', requireAuth, me);
router.put('/auth/password', requireAuth, changePassword);

// Everything below needs a valid admin JWT and a completed password change.
router.use(requireAuth);
router.use(requirePasswordChanged);

// ── Products ────────────────────────────────────────────────────
router.get('/products', listAdminProducts);
router.get('/products/:id', getAdminProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/archive', archiveProduct);
router.post('/products/:id/restore', restoreProduct);

// ── Categories ──────────────────────────────────────────────────
router.get('/categories', listAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/reorder', reorderCategories);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ── Reviews ─────────────────────────────────────────────────────
router.get('/reviews', listAdminReviews);
router.post('/reviews', createReview);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);
router.post('/reviews/:id/status', setReviewStatus);

// ── Gallery ─────────────────────────────────────────────────────
router.get('/gallery', listAdminGallery);
router.post('/gallery', createGalleryItem);
router.put('/gallery/:id', updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);

// ── Uploads (local disk; served from /uploads) ───────────────────
router.post(
  '/uploads',
  uploadLimiter,
  handleImageUpload,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) throw new ApiError(400, 'No images were uploaded.');

    const urls = files.map((file) => uploadsUrlFor(file.filename));
    res.status(201).json({
      images: urls.map((url) => ({ url, publicId: '' })),
      urls,
      provider: 'local',
      limits: { maxBytes: 8 * 1024 * 1024, maxFiles: 10 },
    });
  })
);

// ── Analytics ───────────────────────────────────────────────────
router.get('/analytics', getAnalytics);

// ── Settings ────────────────────────────────────────────────────
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

export default router;
