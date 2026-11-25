import type { CartItem, PublicSettings } from '@/types';
import { formatPrice } from './format';

/** Digits only, as wa.me requires. */
export function normaliseNumber(value: string): string {
  return value.replace(/[^\d]/g, '');
}

export function buildWhatsAppLink(settings: PublicSettings, message: string): string | null {
  const number = normaliseNumber(settings.whatsappNumber);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key: string) => values[key] ?? '');
}

export function buildOrderMessage(settings: PublicSettings, items: CartItem[]): string {
  const lines = items.map((item) => {
    const variant = item.variantName ? ` — ${item.variantName}` : '';
    const price = item.unitPrice === null ? 'price on request' : formatPrice(item.unitPrice * item.quantity);
    return `• ${item.name}${variant} × ${item.quantity} (${price})`;
  });

  const priced = items.every((item) => item.unitPrice !== null);
  const total = priced
    ? formatPrice(items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0))
    : 'Price on request';

  return fillTemplate(settings.whatsappTemplate, {
    ITEMS: lines.join('\n'),
    TOTAL: total,
  });
}

export function buildSingleProductMessage(
  settings: PublicSettings,
  input: { productName: string; variantName: string | null; quantity: number; price: number | null }
): string {
  return fillTemplate(settings.whatsappSingleProductTemplate, {
    PRODUCT: input.productName,
    VARIANT_LINE: input.variantName ? `Size / option: ${input.variantName}\n` : '',
    QTY_LINE: `Quantity: ${input.quantity}\n`,
    PRICE: formatPrice(input.price),
  });
}

/**
 * Where an order button should go.
 *
 * With a number configured, WhatsApp. Without one, the brand's Instagram DMs —
 * so the storefront is never a dead end while the number is pending.
 */
export function buildOrderLink(
  settings: PublicSettings,
  message: string
): { href: string; external: true; channel: 'whatsapp' | 'instagram' } | null {
  const whatsapp = buildWhatsAppLink(settings, message);
  if (whatsapp) return { href: whatsapp, external: true, channel: 'whatsapp' };
  if (settings.instagramUrl) {
    return { href: settings.instagramUrl, external: true, channel: 'instagram' };
  }
  return null;
}
