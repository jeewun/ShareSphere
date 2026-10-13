// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Package, CalendarCheck, Bell, 
  UserCheck, ShieldAlert, PlusCircle, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout, isAdmin } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-heading">
          Menu
        </div>

        <nav className="d-flex flex-column">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            id="nav-dashboard"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/resources"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            id="nav-resources"
          >
            <Package size={18} />
            <span>Browse Resources</span>
          </NavLink>

          <NavLink
            to="/bookings"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            id="nav-bookings"
          >
            <CalendarCheck size={18} />
            <span>My Bookings</span>
          </NavLink>

          <NavLink
            to="/my-resources"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            id="nav-my-resources"
          >
            <PlusCircle size={18} />
            <span>My Listed Items</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            id="nav-notifications"
          >
            <Bell size={18} />
            <span>Notifications</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            id="nav-profile"
          >
            <UserCheck size={18} />
            <span>My Profile</span>
          </NavLink>

          {isAdmin && (
            <div className="mt-2 pt-2 border-top border-secondary border-opacity-25">
              <div className="sidebar-heading px-2 mb-1 text-warning" style={{ fontSize: '0.7rem' }}>
                Admin Portal
              </div>
              <NavLink
                to="/admin"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                id="nav-admin"
              >
                <ShieldAlert size={18} className="text-warning" />
                <span className="d-flex align-items-center justify-content-between flex-grow-1">
                  <span>Admin Reports</span>
                  <span className="badge bg-warning text-dark py-0 px-1" style={{ fontSize: '0.65rem' }}>Admin</span>
                </span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Sidebar Footer with Clean Logout */}
      <div className="pt-3 border-top border-secondary border-opacity-25">
        <button
          onClick={logout}
          className="sidebar-nav-item text-danger border-0 bg-transparent w-100 text-start"
          id="sidebar-logout-btn"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
