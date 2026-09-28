import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  completeOnboardingRequest,
} from './api.js';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the initial /me check resolves

  useEffect(() => {
    meRequest()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function register(payload) {
    const data = await registerRequest(payload); // throws on failure
    setUser(data.user);
    return data.user;
  }

  async function login(identifier, password, rememberMe = false) {
    const data = await loginRequest(identifier, password, rememberMe);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await logoutRequest().catch(() => {});
    setUser(null);
  }

  async function completeOnboarding() {
    const data = await completeOnboardingRequest();
    setUser(data.user);
  }

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), register, login, logout, completeOnboarding }),
    [user, loading]
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within a UserAuthProvider');
  return ctx;
}
