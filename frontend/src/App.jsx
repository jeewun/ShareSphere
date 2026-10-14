// frontend/src/App.jsx - Professional Route Management & Session Security
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import HomePage from './pages/HomePage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyResourcesPage from './pages/MyResourcesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppLayout() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Show clean spinner while verifying session
  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary mb-2" role="status"></div>
        <div className="text-muted small fw-semibold">Loading ShareSphere...</div>
      </div>
    );
  }

  // If user is already authenticated and visits /login or /register, redirect to dashboard
  if (user && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  // If user is NOT authenticated and visits any internal page, redirect to /login
  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // Render Authentication Pages
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  // Render Authenticated Main Application
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="app-container">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/my-resources" element={<MyResourcesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
