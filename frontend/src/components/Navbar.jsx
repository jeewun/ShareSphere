// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Share2, Bell, Search, LogOut, ChevronDown, User
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, unreadNotifications, quickLoginDemo } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="top-header d-flex align-items-center">
      <div className="container-fluid d-flex align-items-center justify-content-between px-3 px-md-4">
        {/* Left: Brand Identity (Matches Image 3) */}
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <div className="brand-icon">
              <Share2 size={20} />
            </div>
            <div>
              <span className="brand-font fs-4 fw-bold text-white tracking-tight">ShareSphere</span>
              <span className="text-white-50 small ms-2 d-none d-lg-inline" style={{ fontSize: '0.78rem' }}>
                Resource-Sharing, Availability & Reservation Management
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Box */}
        <form onSubmit={handleSearchSubmit} className="d-none d-md-block header-search-box">
          <Search size={15} />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search resources, cameras, laptops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right: Notifications & Profile Pill */}
        <div className="d-flex align-items-center gap-3">
          {/* Notifications Icon with Badge */}
          <Link
            to="/notifications"
            id="notifications-link"
            className="btn btn-link text-white text-decoration-none position-relative p-2"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {unreadNotifications}
              </span>
            )}
          </Link>

          {/* User Profile Menu */}
          {user ? (
            <div className="position-relative">
              <div
                className="user-pill d-flex align-items-center gap-2"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                id="user-profile-menu-btn"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="rounded-circle border border-2 border-primary"
                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                />
                <div className="text-start d-none d-sm-block">
                  <div className="small fw-semibold text-white lh-1">{user.name}</div>
                  <div className="text-white-50 text-capitalize" style={{ fontSize: '0.7rem' }}>
                    {user.role}
                  </div>
                </div>
                <ChevronDown size={14} className="text-white-50" />
              </div>

              {/* Dropdown Menu */}
              {showRoleSwitcher && (
                <div
                  className="position-absolute end-0 mt-2 p-2 bg-white rounded-3 shadow-lg border"
                  style={{ zIndex: 1100, width: '220px' }}
                >
                  <div className="small text-muted fw-bold px-2 py-1 mb-1 border-bottom">
                    Switch User Role:
                  </div>
                  <button
                    type="button"
                    className="dropdown-item py-2 px-2 small rounded d-flex align-items-center justify-content-between"
                    onClick={() => {
                      quickLoginDemo('alex@example.com', 'password123');
                      setShowRoleSwitcher(false);
                    }}
                  >
                    <span>Alex Carter</span>
                    <span className="badge bg-primary">Student</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item py-2 px-2 small rounded d-flex align-items-center justify-content-between"
                    onClick={() => {
                      quickLoginDemo('john@example.com', 'password123');
                      setShowRoleSwitcher(false);
                    }}
                  >
                    <span>John Doe</span>
                    <span className="badge bg-success">Owner/Staff</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item py-2 px-2 small rounded d-flex align-items-center justify-content-between"
                    onClick={() => {
                      quickLoginDemo('admin@sharesphere.edu', 'admin123');
                      setShowRoleSwitcher(false);
                    }}
                  >
                    <span>Campus Admin</span>
                    <span className="badge bg-danger">Admin</span>
                  </button>
                  <div className="border-top my-1"></div>
                  <Link
                    to="/profile"
                    className="dropdown-item py-2 px-2 small text-dark rounded d-flex align-items-center gap-2"
                    onClick={() => setShowRoleSwitcher(false)}
                  >
                    <User size={14} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    type="button"
                    className="dropdown-item py-2 px-2 small text-danger rounded d-flex align-items-center gap-2"
                    onClick={() => {
                      setShowRoleSwitcher(false);
                      logout();
                    }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-sm btn-outline-light">Login</Link>
              <Link to="/register" className="btn btn-sm btn-blue">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
