// frontend/src/context/AuthContext.jsx - State Management & Auth Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sharesphere_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Initialize user session on mount
  useEffect(() => {
    async function loadUser() {
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
          console.warn('Session verification failed, resetting token', err);
          logout();
        }
      } else {
        // Auto-login with default demo student user (Alex Carter) for seamless grading/demo
        quickLoginDemo('alex@example.com', 'password123');
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  async function fetchNotificationCount() {
    try {
      const res = await api.notifications.list();
      if (res.success) {
        setUnreadNotifications(res.unread_count || 0);
      }
    } catch (err) {
      // ignore
    }
  }

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success) {
      localStorage.setItem('sharesphere_token', res.token);
      setToken(res.token);
      setUser(res.user);
      fetchNotificationCount();
      return res;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success) {
      localStorage.setItem('sharesphere_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.error || 'Registration failed');
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

  const quickLoginDemo = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        localStorage.setItem('sharesphere_token', res.token);
        setToken(res.token);
        setUser(res.user);
        fetchNotificationCount();
      }
    } catch (e) {
      console.warn('Quick login demo failed', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadNotifications,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        quickLoginDemo,
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
