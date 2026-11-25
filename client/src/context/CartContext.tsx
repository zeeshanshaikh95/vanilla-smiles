import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { trackEvent } from '@/lib/analytics';
import type { CartItem, Product } from '@/types';

const STORAGE_KEY = 'hn.cart.v1';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number | null;
  allPriced: boolean;
  isOpen: boolean;
  addItem: (product: Product, variantName?: string | null) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / private mode */
    }
  }, [items]);

  const addItem = useCallback((product: Product, variantName: string | null = null) => {
    const variant = variantName
      ? product.variants.find((option) => option.name === variantName) ?? null
      : product.variants[0] ?? null;

    const unitPrice = variant?.price ?? product.price;
    const key = `${product._id}|${variant?.name ?? 'default'}`;
    const maxQuantity = 10;

    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(item.quantity + 1, item.maxQuantity) }
            : item
        );
      }
      return [
        ...current,
        {
          key,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? '',
          unitPrice,
          variantName: variant?.name ?? null,
          quantity: 1,
          maxQuantity,
        },
      ];
    });

    trackEvent({ type: 'cart_add', productSlug: product.slug });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(0, Math.min(quantity, item.maxQuantity)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const allPriced = items.every((item) => item.unitPrice !== null);
    const subtotal = allPriced && items.length
      ? items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0)
      : null;

    return {
      items,
      count,
      subtotal,
      allPriced,
      isOpen,
      addItem,
      setQuantity,
      removeItem,
      clear,
      openCart,
      closeCart,
    };
  }, [items, isOpen, addItem, setQuantity, removeItem, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
