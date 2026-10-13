// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import HomePage from './pages/HomePage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyResourcesPage from './pages/MyResourcesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { useAuth } from './context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminGuard({ children }) {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="card-clean p-5 text-center my-5 mx-auto" style={{ maxWidth: '600px' }}>
        <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle d-inline-flex mb-3">
          <ShieldAlert size={42} />
        </div>
        <h3 className="fw-bold text-dark mb-2">Access Denied</h3>
        <p className="text-muted small mb-3">
          Administrator privileges are required to view the Analytics Dashboard and Utilization Reports.
        </p>
        <div className="p-3 bg-light rounded-3 text-secondary small mb-4 border">
          Current User: <strong>{user?.name || 'Anonymous'}</strong> · Role: <span className="badge bg-secondary text-capitalize">{user?.role || 'Guest'}</span>
        </div>
        <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

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
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboardPage />
                </AdminGuard>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
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
