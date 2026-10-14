// frontend/src/pages/NotificationsPage.jsx - Clean White Notifications with Animated Ping
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, CheckCircle2, XCircle, MessageSquare, 
  CheckCheck, Clock, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { refreshNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await api.notifications.list();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await api.notifications.markAllRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        refreshNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
      refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
            <CheckCircle2 size={18} />
          </div>
        );
      case 'danger':
        return (
          <div className="bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
            <XCircle size={18} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
            <MessageSquare size={18} />
          </div>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-0">Notifications and Messages</h2>
          <div className="text-muted small">Stay updated on approvals, rejections, and pickup notes.</div>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3 py-1 rounded-3"
          id="mark-all-read-btn"
        >
          <CheckCheck size={16} />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List Container */}
      <div className="card-clean p-3 shadow-sm bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted small">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5">
            <Bell size={40} className="text-muted mb-2 opacity-50" />
            <h5 className="fw-bold text-dark">No notifications right now</h5>
            <p className="text-muted small">You will receive alerts here when reservation requests are updated.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {notifications.map((item) => (
              <div
                key={item.notification_id}
                onClick={() => handleMarkSingleRead(item.notification_id)}
                className={`notification-card ${!item.is_read ? 'unread' : ''} p-3 d-flex align-items-center justify-content-between gap-3`}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex align-items-start gap-3 flex-grow-1">
                  {getNotificationIcon(item.type)}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-bold text-dark small" style={{ fontSize: '0.92rem' }}>
                        {item.title}
                      </span>
                      {/* Clean Animated Ping Badge for New Unread Notifications */}
                      {!item.is_read && (
                        <span className="notification-ping-pill">
                          <span className="ping-dot-container">
                            <span className="ping-dot-pulse"></span>
                            <span className="ping-dot-core"></span>
                          </span>
                          <span>NEW</span>
                        </span>
                      )}
                    </div>
                    <div className="text-secondary small mt-1" style={{ fontSize: '0.86rem', color: '#334155' }}>
                      {item.message}
                    </div>
                    <div className="text-muted small mt-1 d-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
                      <Clock size={12} />
                      <span>{item.created_at || 'Just now'}</span>
                    </div>
                  </div>
                </div>

                {item.link && (
                  <Link
                    to={
                      item.link.includes('?') 
                        ? item.link 
                        : (item.title?.toLowerCase().includes('request') ? '/bookings?tab=owner_requests' : '/bookings?tab=my_bookings')
                    }
                    className="btn btn-sm btn-outline-primary py-1 px-3 d-none d-sm-flex align-items-center gap-1 flex-shrink-0 rounded-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkSingleRead(item.notification_id);
                    }}
                  >
                    <span>View</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
