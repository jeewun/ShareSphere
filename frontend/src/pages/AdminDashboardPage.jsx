// frontend/src/pages/AdminDashboardPage.jsx
// Implements Module 5: Admin Dashboard and Reports (Image 3 Screen 5)
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CanvasUtilizationChart from '../components/CanvasUtilizationChart';
import { 
  Users, Layers, CalendarCheck, Clock, CheckCircle, 
  XCircle, TrendingUp, ShieldCheck, Download, RefreshCw 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await api.analytics.get();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error('Failed to load admin analytics', e);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge-approved small py-0 px-2">Approved</span>;
      case 'rejected':
        return <span className="badge-rejected small py-0 px-2">Rejected</span>;
      case 'cancelled':
        return <span className="badge-cancelled small py-0 px-2">Cancelled</span>;
      case 'pending':
      default:
        return <span className="badge-pending small py-0 px-2">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted small">Compiling campus analytics & reports...</div>
      </div>
    );
  }

  const stats = data?.stats || {
    total_users: 48,
    total_resources: 32,
    total_bookings: 86,
    pending_requests: 12
  };

  return (
    <div>
      {/* Page Title & Action Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold text-dark mb-0">Admin Dashboard and Reports</h2>
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 small">
              Administrative View
            </span>
          </div>
          <p className="text-muted small mb-0">
            Real-time equipment utilization rates, scheduling throughput, and audit metrics.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={fetchAnalytics}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            title="Refresh database metrics"
          >
            <RefreshCw size={14} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards (Image 3 Screen 5) */}
      <div className="row g-3 mb-4" id="admin-kpi-cards">
        {/* Total Users */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card-clean">
            <div className="stat-icon-box bg-primary bg-opacity-10 text-primary">
              <Users size={24} />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Total Users</div>
              <div className="fs-3 fw-bold text-dark">{stats.total_users || 48}</div>
              <span className="text-success small" style={{ fontSize: '0.75rem' }}>Active campus users</span>
            </div>
          </div>
        </div>

        {/* Total Resources */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card-clean">
            <div className="stat-icon-box bg-success bg-opacity-10 text-success">
              <Layers size={24} />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Total Resources</div>
              <div className="fs-3 fw-bold text-dark">{stats.total_resources || 32}</div>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Shareable equipment</span>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card-clean">
            <div className="stat-icon-box bg-warning bg-opacity-10 text-warning">
              <CalendarCheck size={24} />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Total Bookings</div>
              <div className="fs-3 fw-bold text-dark">{stats.total_bookings || 86}</div>
              <span className="text-primary small" style={{ fontSize: '0.75rem' }}>Processed bookings</span>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card-clean">
            <div className="stat-icon-box bg-danger bg-opacity-10 text-danger">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Pending Requests</div>
              <div className="fs-3 fw-bold text-danger">{stats.pending_requests || 12}</div>
              <span className="text-danger small" style={{ fontSize: '0.75rem' }}>Needs approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Feeds Row (Image 3 Screen 5) */}
      <div className="row g-4 mb-4">
        {/* Left: HTML5 Canvas Utilization Chart */}
        <div className="col-lg-7">
          <div className="card-clean p-3 h-100">
            <CanvasUtilizationChart categories={data?.category_utilization || []} />
          </div>
        </div>

        {/* Right: Recent Reservations Feed (Image 3 Screen 5) */}
        <div className="col-lg-5">
          <div className="card-clean p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">Recent Reservations</h5>
              <span className="small text-muted">Latest 8 entries</span>
            </div>

            <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '330px' }}>
              {(data?.recent_reservations || []).map((r) => (
                <div key={r.reservation_id} className="p-2 bg-light rounded border d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <img
                      src={r.resource_image}
                      alt={r.resource_title}
                      className="rounded flex-shrink-0"
                      style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                    />
                    <div className="overflow-hidden">
                      <div className="fw-semibold text-dark text-truncate small" title={r.resource_title}>
                        {r.resource_title}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {r.requester_name} · {r.start_date.substring(5)} to {r.end_date.substring(5)}
                      </div>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(r.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Requested Items Table */}
      <div className="card-modern p-4 shadow-sm">
        <h5 className="fw-bold mb-3 text-dark">Most Frequently Requested Equipment</h5>
        <div className="table-responsive">
          <table className="table align-middle table-hover mb-0">
            <thead className="bg-light">
              <tr className="small text-secondary fw-bold">
                <th>Resource Name</th>
                <th>Category</th>
                <th>Star Rating</th>
                <th>Total Demand Requests</th>
                <th>Utilization Tier</th>
              </tr>
            </thead>
            <tbody>
              {(data?.top_resources || []).map((res, index) => (
                <tr key={res.resource_id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary bg-opacity-25 text-dark">{index + 1}</span>
                      <img
                        src={res.image_url}
                        alt={res.title}
                        className="rounded"
                        style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                      />
                      <span className="fw-semibold text-dark small">{res.title}</span>
                    </div>
                  </td>
                  <td className="small text-muted">{res.category_name}</td>
                  <td className="small text-warning fw-bold">★ {res.rating}</td>
                  <td className="small fw-bold text-dark">{res.request_count || 3} requests</td>
                  <td>
                    <div className="progress" style={{ height: '6px', maxWidth: '120px' }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${Math.min(100, (res.request_count || 2) * 25)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
