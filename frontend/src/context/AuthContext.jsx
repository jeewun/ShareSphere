// frontend/src/context/AuthContext.jsx - Professional Authentication State Management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sharesphere_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Initialize and verify user session on mount
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            fetchNotificationCount();
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  async function fetchNotificationCount() {
    if (!token) return;
    try {
      const res = await api.notifications.list();
      if (res.success) {
        setUnreadNotifications(res.unread_count || 0);
      }
    } catch {
      // ignore
    }
  }

  // Auto-poll notifications every 8 seconds & on tab focus when logged in
  useEffect(() => {
    if (!token || !user) return;

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 8000);

    const handleFocus = () => {
      fetchNotificationCount();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [token, user]);

  // Real Email & Password Login
  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('sharesphere_token', res.token);
      setToken(res.token);
      setUser(res.user);
      fetchNotificationCount();
      return res;
    }
    throw new Error(res.error || res.message || 'Invalid credentials');
  };

  // Real User Registration
  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('sharesphere_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.error || res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('sharesphere_token');
    setToken(null);
    setUser(null);
    setUnreadNotifications(0);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadNotifications,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshNotifications: fetchNotificationCount
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
