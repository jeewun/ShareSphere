// frontend/src/pages/NotificationsPage.jsx
// Implements Screen 8: Notifications and Messages
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, CheckCircle2, XCircle, MessageSquare, 
  Info, CheckCheck, Clock, ArrowRight 
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
          <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
        );
      case 'danger':
        return (
          <div className="bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <XCircle size={18} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <MessageSquare size={18} />
          </div>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="fw-bold text-dark mb-0">Notifications and Messages</h2>
            <div className="text-muted small">Stay updated on approvals, rejections, and pickup notes.</div>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
          id="mark-all-read-btn"
        >
          <CheckCheck size={16} />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List (Image 3 Screen 8) */}
      <div className="card-clean overflow-hidden p-2">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted small">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5">
            <Bell size={40} className="text-muted mb-2 opacity-50" />
            <h5 className="fw-bold text-dark">No notifications right now</h5>
            <p className="text-muted small">You will receive alerts here when reservation requests are approved or updated.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 p-2">
            {notifications.map((item) => (
              <div
                key={item.notification_id}
                onClick={() => handleMarkSingleRead(item.notification_id)}
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 transition cursor-pointer ${
                  item.is_read ? 'bg-white' : 'bg-primary bg-opacity-5 border-primary border-opacity-25'
                }`}
              >
                <div className="d-flex align-items-center gap-3">
                  {getNotificationIcon(item.type)}
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`small fw-bold ${item.is_read ? 'text-dark' : 'text-primary'}`}>
                        {item.title}
                      </span>
                      {!item.is_read && (
                        <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>NEW</span>
                      )}
                    </div>
                    <div className="small text-secondary mb-1">
                      {item.message}
                    </div>
                    <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      <Clock size={12} />
                      <span>{item.created_at || 'Just now'}</span>
                    </div>
                  </div>
                </div>

                {item.link && (
                  <Link
                    to={item.link}
                    className="btn btn-sm btn-outline-secondary py-1 px-2 d-none d-sm-flex align-items-center gap-1 flex-shrink-0"
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
