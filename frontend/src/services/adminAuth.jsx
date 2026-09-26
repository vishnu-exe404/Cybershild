import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminLoginRequest, adminLogoutRequest, adminMeRequest } from './api.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminMeRequest()
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await adminLoginRequest(username, password);
    setAdmin(data.admin);
    return data.admin;
  }

  async function logout() {
    await adminLogoutRequest().catch(() => {});
    setAdmin(null);
  }

  const value = useMemo(
    () => ({ admin, loading, isAuthenticated: Boolean(admin), login, logout }),
    [admin, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
