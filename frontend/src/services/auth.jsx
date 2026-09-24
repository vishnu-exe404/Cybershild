import React, { createContext, useContext, useMemo, useState } from 'react';
import { loginRequest } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('csap_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('csap_username'));

  async function login(user, password) {
    const data = await loginRequest(user, password); // throws on failure
    setToken(data.token);
    setUsername(data.username);
    localStorage.setItem('csap_token', data.token);
    localStorage.setItem('csap_username', data.username);
  }

  function logout() {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('csap_token');
    localStorage.removeItem('csap_username');
  }

  const value = useMemo(
    () => ({ token, username, isAuthenticated: Boolean(token), login, logout }),
    [token, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
