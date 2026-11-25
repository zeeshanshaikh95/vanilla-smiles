import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { AdminUser } from '../models/adminUser.model.js';
import { SiteSettings } from '../models/siteSettings.model.js';

/**
 * Idempotent bootstrap: creates the first admin (bcrypt hash only) and the
 * settings singleton. Never invents catalogue data.
 *
 * Re-running while the bootstrap password is still in use re-arms the forced
 * password change, so an unchanged default can never be used indefinitely.
 */
export async function bootstrap(): Promise<void> {
  const email = config.adminEmail.trim().toLowerCase();
  const existing = await AdminUser.findOne({ email });

  if (!existing) {
    await AdminUser.create({
      email,
      passwordHash: await bcrypt.hash(config.adminPassword, 12),
      mustChangePassword: true,
    });
    console.log(`[seed] admin account created: ${email}`);
  } else {
    const samePassword = await bcrypt.compare(config.adminPassword, existing.passwordHash);
    if (samePassword && !existing.mustChangePassword) {
      existing.mustChangePassword = true;
      await existing.save();
      console.log('[seed] bootstrap password still in use — re-armed forced password change');
    }
  }

  const settings = await SiteSettings.findOne();
  if (!settings) {
    await SiteSettings.create({});
    console.log('[seed] default settings created');
  }
}
