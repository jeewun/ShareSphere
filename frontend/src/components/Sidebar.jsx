import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Package, CalendarCheck, Bell, 
  PlusCircle 
} from 'lucide-react';

export default function Sidebar() {
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
        </nav>
      </div>
    </aside>
  );
}
