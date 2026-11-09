import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AuthContext, type User } from './AuthContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Auth check failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // State is only set after the request resolves; the rule can't see past
  // the await and misreports this fetch-on-mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, [checkAuth]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateAuthUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, updateAuthUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
