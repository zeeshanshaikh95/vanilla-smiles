/**
 * Writes client/public/demo/catalogue.json from a running API.
 *
 * Used for the GitHub Pages build, which has no server. Run the API locally
 * (npm run dev:server) and then:
 *
 *   npm run demo:catalogue
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = process.env.API_ORIGIN ?? 'http://localhost:4000/api';
const OUT = path.resolve('client/public/demo/catalogue.json');

async function get(pathname) {
  const response = await fetch(`${API}${pathname}`);
  if (!response.ok) throw new Error(`${pathname} → HTTP ${response.status}`);
  return response.json();
}

async function main() {
  const [settings, products, categories, reviews, gallery] = await Promise.all([
    get('/settings'),
    get('/products?sort=featured'),
    get('/categories'),
    get('/reviews'),
    get('/gallery'),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    settings: settings.settings,
    products: products.products,
    categories: categories.categories,
    reviews: reviews.reviews,
    gallery: gallery.items,
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  console.log(
    `[demo] wrote ${OUT} — ${snapshot.products.length} pieces, ` +
      `${snapshot.categories.length} categories, ${snapshot.gallery.length} journal images`
  );
}

main().catch((err) => {
  console.error('[demo] failed:', err.message);
  process.exit(1);
});
