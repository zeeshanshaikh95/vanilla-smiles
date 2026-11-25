import { SiteSettings, type ISiteSettings } from '../models/siteSettings.model.js';

let cached: ISiteSettings | null = null;

/** Returns the single settings document, creating it on first use. */
export async function getSettings(): Promise<ISiteSettings> {
  if (cached) return cached;
  const existing = await SiteSettings.findOne();
  if (existing) {
    cached = existing.toObject();
    return cached;
  }
  const created = await SiteSettings.create({});
  cached = created.toObject();
  return cached;
}

export function invalidateSettings(): void {
  cached = null;
}
