import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsApi } from '@/api/cmsApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cms_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('cms_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('cms_auth_expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await cmsApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('cms_user', JSON.stringify(res.data));
          }
        } catch {
          // Token invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('cms_access_token');
          localStorage.removeItem('cms_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await cmsApi.login({ email, password });
    if (res.success && res.data) {
      const { accessToken, user: userData } = res.data;
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('cms_access_token', accessToken);
      localStorage.setItem('cms_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cms_access_token');
    localStorage.removeItem('cms_user');
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await cmsApi.changePassword({ currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
