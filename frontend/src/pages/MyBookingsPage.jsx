// frontend/src/pages/MyBookingsPage.jsx
// Implements Module 4: Request and Booking Management (Image 3 Screen 4)
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle, 
  Eye, Ban, Check, X, ShieldAlert, ArrowRight, MessageSquare 
} from 'lucide-react';
import HandoverModal from '../components/HandoverModal';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab === 'owner_requests' ? 'owner_requests' : 'my_bookings');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [handoverResId, setHandoverResId] = useState(null);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab === 'owner_requests' || currentTab === 'my_bookings') {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, statusFilter]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await api.reservations.list(activeTab, statusFilter);
      if (res.success) {
        setReservations(res.reservations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (reservationId, newStatus, reason = '') => {
    try {
      const res = await api.reservations.updateStatus(reservationId, newStatus, reason);
      if (res.success) {
        setActionMessage(`Reservation has been ${newStatus}.`);
        fetchBookings();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge-approved"><CheckCircle2 size={12} /> Approved</span>;
      case 'rejected':
        return <span className="badge-rejected"><XCircle size={12} /> Rejected</span>;
      case 'cancelled':
        return <span className="badge-cancelled">Cancelled</span>;
      case 'pending':
      default:
        return <span className="badge-pending"><Clock size={12} /> Pending</span>;
    }
  };

  const filterTabs = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            {activeTab === 'my_bookings' ? 'My Bookings' : 'Incoming Booking Requests'}
          </h2>
          <p className="text-muted small mb-0">
            Track reservation approvals, active checkout periods, and booking history.
          </p>
        </div>

        {/* Tab Switcher: Modern Segmented Pill Control */}
        <div className="mode-switch-box d-inline-flex p-1 bg-white border rounded-pill shadow-sm align-items-center gap-1">
          <button
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold border-0 ${
              activeTab === 'my_bookings'
                ? 'btn-primary shadow-sm'
                : 'text-secondary bg-transparent'
            }`}
            onClick={() => handleTabChange('my_bookings')}
            id="tab-my-bookings"
            style={{ fontSize: '0.84rem' }}
          >
            My Reservations
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold border-0 ${
              activeTab === 'owner_requests'
                ? 'btn-primary shadow-sm'
                : 'text-secondary bg-transparent'
            }`}
            onClick={() => handleTabChange('owner_requests')}
            id="tab-owner-requests"
            style={{ fontSize: '0.84rem' }}
          >
            Manage Requests (Owner)
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-4 animate-fadeIn shadow-sm">
          <CheckCircle2 size={18} />
          <span className="small">{actionMessage}</span>
        </div>
      )}

      {/* Filter Pills (Image 3 Screen 4: All, Pending, Approved, Rejected, Cancelled) */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            id={`filter-pill-${tab}`}
            className={`btn btn-sm text-capitalize px-3 rounded-pill fw-semibold ${statusFilter === tab ? 'btn-primary' : 'btn-light border text-secondary'}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Table / Card List */}
      <div className="card-clean overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted small">Loading reservations...</div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-5 p-4">
            <CalendarCheck size={40} className="text-muted mb-2" />
            <h5 className="fw-bold text-dark">No reservations found</h5>
            <p className="text-muted small">No records match the current status filter "{statusFilter}".</p>
            <Link to="/resources" className="btn btn-sm btn-primary mt-2">
              Browse Available Equipment
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover" id="bookings-management-table">
              <thead className="bg-light border-bottom">
                <tr className="text-secondary small fw-bold">
                  <th className="ps-4 py-3">Resource</th>
                  <th className="py-3">Date Range</th>
                  <th className="py-3">{activeTab === 'my_bookings' ? 'Owner' : 'Requester'}</th>
                  <th className="py-3">Status</th>
                  <th className="pe-4 py-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((resv) => (
                  <tr key={resv.reservation_id}>
                    {/* Resource Column */}
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={resv.resource_image}
                          alt={resv.resource_title}
                          className="rounded-2 shadow-sm"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-dark small">{resv.resource_title}</div>
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            ({resv.category_name})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date Range */}
                    <td className="py-3">
                      <div className="small fw-semibold text-dark">
                        {resv.start_date} → {resv.end_date}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        Purpose: {resv.purpose || 'Academic project'}
                      </div>
                    </td>

                    {/* Owner / Requester */}
                    <td className="py-3 small text-muted">
                      {activeTab === 'my_bookings' ? (
                        <span>{resv.owner_name}</span>
                      ) : (
                        <div>
                          <div className="fw-semibold text-dark">{resv.requester_name}</div>
                          <span className="small text-muted">{resv.requester_email}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3">
                      {getStatusBadge(resv.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="pe-4 py-3 text-end">
                      <div className="d-inline-flex gap-2 align-items-center">
                        <Link
                          to={`/resources/${resv.resource_id}`}
                          className="btn btn-sm btn-outline-secondary py-1 px-2 small d-inline-flex align-items-center gap-1"
                          title="View resource page"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </Link>
                        {/* Approved Handover Coordination Space Button */}
                        {resv.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => setHandoverResId(resv.reservation_id)}
                            className="btn btn-sm btn-primary py-1 px-2 small d-inline-flex align-items-center gap-1 shadow-sm fw-semibold"
                            title="Open handover & pickup coordination space"
                            id={`handover-btn-${resv.reservation_id}`}
                          >
                            <MessageSquare size={14} />
                            <span>Coordinate Handover</span>
                          </button>
                        )}

                        {resv.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => setHandoverResId(resv.reservation_id)}
                            className="btn btn-sm btn-outline-secondary py-1 px-2 small d-inline-flex align-items-center gap-1"
                            title="View completed handover space"
                            id={`handover-archived-btn-${resv.reservation_id}`}
                          >
                            <MessageSquare size={14} />
                            <span>Handover Info</span>
                          </button>
                        )}

                        {/* If in My Bookings tab and status is pending: user can cancel */}
                        {activeTab === 'my_bookings' && resv.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(resv.reservation_id, 'cancelled', 'User cancelled reservation')}
                            className="btn btn-sm btn-outline-danger py-1 px-2 small d-inline-flex align-items-center gap-1"
                            title="Cancel booking"
                          >
                            <Ban size={14} />
                            <span>Cancel</span>
                          </button>
                        )}

                        {/* If in Owner Requests tab and status is pending: approve or reject */}
                        {activeTab === 'owner_requests' && resv.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(resv.reservation_id, 'approved', 'Approved by owner')}
                              className="btn btn-sm btn-success py-1 px-2 small d-inline-flex align-items-center gap-1"
                              title="Approve booking request"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(resv.reservation_id, 'rejected', 'Equipment needed for scheduled maintenance')}
                              className="btn btn-sm btn-outline-danger py-1 px-2 small d-inline-flex align-items-center gap-1"
                              title="Reject request"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Handover & Pickup Coordination Space Modal */}
      {handoverResId && (
        <HandoverModal
          reservationId={handoverResId}
          onClose={() => setHandoverResId(null)}
          onHandoverUpdated={fetchBookings}
        />
      )}
    </div>
  );
}
