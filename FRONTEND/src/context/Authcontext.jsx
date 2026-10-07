import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while we're checking for an existing session on first load.
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // The JWT lives in an httpOnly cookie we can't read from JS, so on load we
  // ask the backend's protected /auth route "who am I" to restore the
  // session (e.g. after a page refresh).
  useEffect(() => {
    let cancelled = false;

    authApi
      .getCurrentUser()
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    return res.user;
  }, []);

  // For OTP-based login — accepts user object directly and updates context
  const loginWithUser = useCallback((userData) => {
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    // Registration does not log the user in (no cookie is set by /register),
    // matching the current backend contract. Caller decides what to do next
    // (e.g. redirect to /login).
    return authApi.register(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    setUser,           // ← ADDED for OTP login
    loginWithUser,     // ← ADDED convenience method
    isAuthenticated: Boolean(user),
    isAuthLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export { ApiError };