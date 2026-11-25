import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminApi, type AdminSessionUser } from '@/api/endpoints';
import { clearToken, getToken, setToken } from '@/api/client';

interface AdminAuthValue {
  admin: AdminSessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminSessionUser>;
  logout: () => void;
  setAdmin: (admin: AdminSessionUser) => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdminState] = useState<AdminSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    adminApi
      .me()
      .then((result) => {
        if (!cancelled) setAdminState(result.admin);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await adminApi.login(email, password);
    setToken(result.token);
    setAdminState(result.admin);
    return result.admin;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setAdminState(null);
  }, []);

  const setAdmin = useCallback((next: AdminSessionUser) => setAdminState(next), []);

  const value = useMemo(
    () => ({ admin, loading, login, logout, setAdmin }),
    [admin, loading, login, logout, setAdmin]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return context;
}
