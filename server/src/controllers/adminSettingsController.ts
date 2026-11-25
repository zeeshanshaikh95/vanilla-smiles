import type { Request, Response } from 'express';
import { SiteSettings } from '../models/siteSettings.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSettings, invalidateSettings } from '../services/settingsService.js';
import { settingsSchema } from '../validation/schemas.js';

export const getAdminSettings = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ settings: await getSettings() });
});

export const updateAdminSettings = asyncHandler(async (req: Request, res: Response) => {
  const input = settingsSchema.parse(req.body ?? {});
  const settings = await SiteSettings.findOneAndUpdate({}, input, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  invalidateSettings();
  res.json({ settings });
});
