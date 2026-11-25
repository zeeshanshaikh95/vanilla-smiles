/**
 * Seeds the database.
 *
 *   npm run seed          → bootstrap admin + settings, then add the starter
 *                           catalogue only when no treatments exist yet
 *   npm run seed:reset    → wipe catalogue records and re-create them
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Category } from '../models/category.model.js';
import { GalleryItem } from '../models/galleryItem.model.js';
import { Product } from '../models/product.model.js';
import { Review } from '../models/review.model.js';
import { bootstrap } from './bootstrap.js';

import { categories, gallery, treatments } from './catalogue.js';

const reset = process.argv.includes('--reset');

async function main(): Promise<void> {
  await connectDatabase();
  await bootstrap();

  const existing = await Product.countDocuments();
  if (existing > 0 && !reset) {
    console.log(`[seed] ${existing} treatments already present — catalogue seed skipped`);
  } else {
    if (reset) {
      await Promise.all([
        Product.deleteMany({}),
        Category.deleteMany({}),
        Review.deleteMany({}),
        GalleryItem.deleteMany({}),
      ]);
      console.log('[seed] catalogue cleared');
    }

    const categoryIds = new Map<string, mongoose.Types.ObjectId>();
    for (const category of categories) {
      const created = await Category.create(category);
      categoryIds.set(category.slug, created._id as mongoose.Types.ObjectId);
    }
    console.log(`[seed] ${categories.length} departments created`);

    for (const treatment of treatments) {
      const { categorySlug, ...rest } = treatment;
      await Product.create({
        ...rest,
        category: categoryIds.get(categorySlug) ?? null,
      });
    }
    console.log(`[seed] ${treatments.length} treatments created`);

    await GalleryItem.create(gallery);
    console.log(`[seed] ${gallery.length} gallery images created`);

    console.log('[seed] reviews are left empty — publish real patient words in Admin → Reviews');
  }

  await disconnectDatabase();
  console.log('[seed] done');
}

main().catch(async (err) => {
  console.error('[seed] failed', err);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
