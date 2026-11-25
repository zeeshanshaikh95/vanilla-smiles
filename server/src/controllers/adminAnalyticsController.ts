import type { Request, Response } from 'express';
import { AnalyticsEvent } from '../models/analyticsEvent.model.js';
import { Product } from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const requested = Number(req.query.range ?? 30);
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const match = { createdAt: { $gte: since } };

  const [byType, topProducts, topPaths, topReferrers, productCount] = await Promise.all([
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { ...match, productSlug: { $ne: '' } } },
      { $group: { _id: '$productSlug', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { ...match, path: { $ne: '' } } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { ...match, referrer: { $ne: '' } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Product.countDocuments({ archived: false }),
  ]);

  const counts = new Map(byType.map((row) => [row._id, row.count]));
  const slugs = topProducts.map((row) => row._id);
  const names = await Product.find({ slug: { $in: slugs } })
    .select('slug name')
    .lean();
  const nameMap = new Map(names.map((row) => [row.slug, row.name]));

  res.json({
    range: { days, since: since.toISOString() },
    totals: {
      events: byType.reduce((sum, row) => sum + row.count, 0),
      pageViews: counts.get('page_view') ?? 0,
      productViews: counts.get('product_view') ?? 0,
      whatsappClicks: counts.get('whatsapp_click') ?? 0,
      cartAdds: counts.get('cart_add') ?? 0,
      orderWhatsappClicks: counts.get('order_whatsapp_click') ?? 0,
    },
    topProducts: topProducts.map((row) => ({
      slug: row._id,
      name: nameMap.get(row._id) ?? null,
      exists: nameMap.has(row._id),
      count: row.count,
    })),
    topPaths,
    topReferrers,
    productCount,
  });
});
