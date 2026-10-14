import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import { 
  Bell, LogOut, ChevronDown, User, 
  CalendarCheck, PlusCircle 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, unreadNotifications } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="top-header d-flex align-items-center">
      <div className="container-fluid d-flex align-items-center justify-content-between px-3 px-md-4">
        {/* Left: Clean Brand Identity with Sphere Logo */}
        <div className="d-flex align-items-center">
          <BrandLogo variant="light" height={38} to="/" alt="Sphere" id="navbar-brand-logo" />
        </div>

        {/* Right: Notifications & Profile */}
        <div className="d-flex align-items-center gap-3">
          {/* Notifications Icon (Only for authenticated users) */}
          {user && (
            <Link
              to="/notifications"
              id="notifications-link"
              className="btn btn-link text-secondary text-decoration-none position-relative d-inline-flex align-items-center justify-content-center p-0 rounded-circle header-bell-btn"
              style={{ width: '38px', height: '38px' }}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span
                  className="position-absolute rounded-circle bg-danger"
                  style={{
                    top: '7px',
                    right: '7px',
                    width: '9px',
                    height: '9px',
                    border: '2px solid var(--nav-navy)',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.9)'
                  }}
                  title={`${unreadNotifications} new notification`}
                />
              )}
            </Link>
          )}

          {/* User Profile Menu */}
          {user ? (
            <div className="position-relative" ref={menuRef}>
              <div
                className="user-pill d-flex align-items-center gap-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                id="user-profile-menu-btn"
                role="button"
                tabIndex={0}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle border border-2 border-secondary"
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                  >
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : <User size={15} />}
                  </div>
                )}
                <div className="text-start d-none d-sm-block">
                  <div className="small fw-semibold text-dark lh-1">{user.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    Campus Member
                  </div>
                </div>
                <ChevronDown size={14} className="text-secondary" />
              </div>

              {/* Clean Profile Dropdown */}
              {showProfileMenu && (
                <div
                  className="position-absolute end-0 mt-2 p-2 bg-white rounded-3 shadow-lg border animate-fadeIn"
                  style={{ zIndex: 1100, width: '230px' }}
                >
                  <div className="px-3 py-2 border-bottom mb-1">
                    <div className="fw-bold text-dark text-truncate small">{user.name}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                    <div className="mt-1">
                      <span className="badge bg-light text-secondary border fw-medium" style={{ fontSize: '0.68rem' }}>
                        Campus Member
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item py-2 px-3 small text-dark rounded d-flex align-items-center gap-2"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User size={15} className="text-secondary" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/bookings"
                    className="dropdown-item py-2 px-3 small text-dark rounded d-flex align-items-center gap-2"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <CalendarCheck size={15} className="text-secondary" />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    to="/my-resources"
                    className="dropdown-item py-2 px-3 small text-dark rounded d-flex align-items-center gap-2"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <PlusCircle size={15} className="text-secondary" />
                    <span>My Listed Items</span>
                  </Link>

                  <div className="border-top my-1"></div>

                  <button
                    type="button"
                    className="dropdown-item py-2 px-3 small text-danger rounded d-flex align-items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-outline-light px-3 py-1">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-blue px-3 py-1">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
