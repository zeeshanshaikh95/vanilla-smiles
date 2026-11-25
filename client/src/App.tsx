import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SettingsProvider } from '@/context/SettingsContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MiniCart } from '@/components/MiniCart';
import { OrderFloat } from '@/components/layout/OrderFloat';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductPage } from '@/pages/ProductPage';
import { AboutPage } from '@/pages/AboutPage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { ContactPage } from '@/pages/ContactPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { usePageView } from '@/hooks/usePageView';

const AdminApp = lazy(() => import('@/admin/AdminApp'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function SiteChrome({ children }: { children: ReactNode }) {
  usePageView();
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <MiniCart />
      <OrderFloat />
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bone">
      <div className="flex flex-col items-center gap-3">
        <span className="font-display text-2xl uppercase tracking-[0.2em] text-teal-900">
          Vanilla Smiles
        </span>
        <span className="h-px w-16 animate-pulse bg-teal-700/40" />
      </div>
    </div>
  );
}

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <SettingsProvider>
        <ToastProvider>
          <CartProvider>
            <ScrollToTop />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<SiteChrome><HomePage /></SiteChrome>} />
                <Route path="/shop" element={<SiteChrome><ShopPage /></SiteChrome>} />
                <Route path="/treatments" element={<SiteChrome><ShopPage /></SiteChrome>} />
                <Route path="/category/:slug" element={<SiteChrome><CategoryPage /></SiteChrome>} />
                <Route path="/product/:slug" element={<SiteChrome><ProductPage /></SiteChrome>} />
                <Route path="/about" element={<SiteChrome><AboutPage /></SiteChrome>} />
                <Route path="/reviews" element={<SiteChrome><ReviewsPage /></SiteChrome>} />
                <Route path="/gallery" element={<SiteChrome><GalleryPage /></SiteChrome>} />
                <Route path="/contact" element={<SiteChrome><ContactPage /></SiteChrome>} />
                <Route path="/book" element={<SiteChrome><ContactPage /></SiteChrome>} />

                <Route path="/admin/*" element={<AdminApp />} />

                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<SiteChrome><NotFoundPage /></SiteChrome>} />
              </Routes>
            </Suspense>
          </CartProvider>
        </ToastProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
