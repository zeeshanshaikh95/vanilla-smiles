import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import { AdminLayout } from './AdminLayout';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminChangePasswordPage } from './AdminChangePasswordPage';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminProductsPage } from './AdminProductsPage';
import { AdminProductFormPage } from './AdminProductFormPage';
import { AdminCategoriesPage } from './AdminCategoriesPage';
import { AdminReviewsPage } from './AdminReviewsPage';
import { AdminGalleryPage } from './AdminGalleryPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { Spinner } from './AdminUI';

function AdminGate() {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone">
        <Spinner label="Opening the studio…" />
      </div>
    );
  }

  if (!admin) return <AdminLoginPage />;
  if (admin.mustChangePassword) return <AdminChangePasswordPage forced />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="password" element={<AdminChangePasswordPage forced={false} />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}
