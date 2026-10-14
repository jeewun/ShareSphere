// frontend/src/pages/ResourceDetailPage.jsx
// Implements Module 3: Reservation and Conflict Prevention
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConflictBadge from '../components/ConflictBadge';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import AlternativeSuggestions from '../components/AlternativeSuggestions';
import { 
  MapPin, Shield, User, ArrowLeft, 
  Clock, CheckCircle, AlertCircle, Info, Sparkles 
} from 'lucide-react';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshNotifications } = useAuth();

  const [resource, setResource] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial reservation selection state: clean & empty (No false conflict on load!)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [purpose, setPurpose] = useState('');

  // Conflict state
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Load resource details
  useEffect(() => {
    async function loadResource() {
      setLoading(true);
      try {
        const res = await api.resources.getById(id);
        if (res.success) {
          setResource(res.resource);
          setExistingBookings(res.existing_bookings || []);
        } else {
          setBookingError('Resource not found');
        }
      } catch (err) {
        setBookingError('Failed to load resource details.');
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [id]);

  // Live Conflict Detection Pre-Flight Check (Runs only when user picks both dates)
  useEffect(() => {
    if (!id || !dateRange.startDate || !dateRange.endDate) {
      setConflictData(null);
      return;
    }

    if (dateRange.startDate > dateRange.endDate) {
      setConflictData({
        has_conflict: true,
        message: 'Start date cannot be after end date.'
      });
      return;
    }

    let isMounted = true;
    setCheckingConflict(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.reservations.checkConflict(id, dateRange.startDate, dateRange.endDate);
        if (isMounted && res.success) {
          setConflictData(res);
        }
      } catch (err) {
        if (isMounted) console.error('Conflict check error', err);
      } finally {
        if (isMounted) setCheckingConflict(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id, dateRange.startDate, dateRange.endDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && resource && Number(user.user_id) === Number(resource.owner_id)) {
      setBookingError('You cannot reserve a resource that you own.');
      return;
    }

    if (conflictData?.has_conflict) {
      setBookingError('Cannot reserve: Please resolve scheduling conflict first.');
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const res = await api.reservations.create({
        resource_id: id,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        purpose: purpose
      });

      if (res.success) {
        setBookingSuccess('Reservation requested successfully! Owner has been notified.');
        refreshNotifications();

        // Refresh existing bookings to show updated state in calendar
        const updated = await api.resources.getById(id);
        if (updated.success) {
          setExistingBookings(updated.existing_bookings || []);
        }
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to submit reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted small">Loading resource details...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-5">
        <h5>Resource Not Found</h5>
        <Link to="/resources" className="btn btn-primary btn-sm mt-3">Back to Catalog</Link>
      </div>
    );
  }

  const isOwner = Boolean(user && resource && Number(user.user_id) === Number(resource.owner_id));
  const isAvailable = resource.status === 'available';

  return (
    <div>
      {/* Breadcrumb / Back button */}
      <div className="mb-3">
        <Link to="/resources" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 hover-text-primary">
          <ArrowLeft size={16} />
          <span>Back to all resources</span>
        </Link>
      </div>

      {/* 2-Column Layout: Left = Resource & Owner Details; Right = Select Period (Top) + Structured Calendar (Bottom) */}
      <div className="row g-4 mb-4">
        {/* Left Column: Resource Details & Owner Info */}
        <div className="col-12 col-lg-5 col-xl-5">
          <div className="card-clean p-4">
            {/* Image (Structured & Well-Proportioned) */}
            <div className="rounded-3 overflow-hidden mb-3.5 bg-light border text-center position-relative" style={{ height: '220px' }}>
              <img
                src={resource.image_url}
                alt={resource.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Category & Status */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="badge-category">
                {resource.category_name || 'General'}
              </span>
              <span className={isAvailable ? 'badge-available' : 'badge-rejected'}>
                {isAvailable ? 'Available' : 'Reserved'}
              </span>
            </div>

            {/* Title */}
            <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '1.3rem' }}>
              {resource.title}
            </h4>

            {/* Description */}
            <p className="text-secondary small mb-3.5" style={{ lineHeight: '1.6', fontSize: '0.86rem' }}>
              {resource.description}
            </p>

            {/* Specs & Attributes */}
            <div className="row g-3 mb-3.5 bg-light p-3 rounded-3 border">
              <div className="col-6">
                <div className="text-muted text-uppercase fw-semibold mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  Condition
                </div>
                <div className="fw-semibold text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.86rem' }}>
                  <Shield size={15} className="text-success flex-shrink-0" />
                  <span>{resource.condition_status || 'Good'}</span>
                </div>
              </div>
              <div className="col-6 border-start ps-3">
                <div className="text-muted text-uppercase fw-semibold mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  Location
                </div>
                <div className="fw-semibold text-dark d-flex align-items-center gap-2 text-truncate" style={{ fontSize: '0.86rem' }}>
                  <MapPin size={15} className="text-secondary flex-shrink-0" />
                  <span className="text-truncate">{resource.location}</span>
                </div>
              </div>
            </div>

            {/* Details about the Owner */}
            <div className="p-3.5 rounded-3 bg-white border">
              <div className="text-muted text-uppercase fw-bold mb-2.5" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                Resource Owner Details
              </div>
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-dark fw-bold flex-shrink-0"
                  style={{ width: '42px', height: '42px', fontSize: '0.9rem' }}
                >
                  {resource.owner_name ? resource.owner_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : <User size={18} />}
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <div className="fw-semibold text-dark d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.88rem' }}>
                    <span className="text-truncate">{resource.owner_name}</span>
                    {isOwner && <span className="badge bg-secondary text-white py-0.5 px-2" style={{ fontSize: '0.65rem' }}>You</span>}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                    {resource.owner_email || 'Campus Member'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Top = Select Reservation Period, Bottom = Calendar & Order List */}
        <div className="col-12 col-lg-7 col-xl-7 d-flex flex-column gap-4">
          {/* Top Box: Select Reservation Period / Manage Listed Item */}
          <div className="card-clean p-4">
            {isOwner ? (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 pb-2.5 border-bottom">
                  <Shield className="text-primary me-1" size={18} />
                  <span className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>Your Listed Resource</span>
                </div>
                
                <div className="p-3 bg-light rounded-3 border mb-3.5">
                  <div className="d-flex align-items-center gap-2 text-dark fw-semibold small mb-1.5">
                    <Info size={16} className="text-primary" />
                    <span>You own this equipment</span>
                  </div>
                  <p className="text-muted small mb-0" style={{ lineHeight: '1.55', fontSize: '0.82rem' }}>
                    Fellow students and campus members can request reservations for this item.
                  </p>
                </div>

                <div className="d-flex gap-2.5">
                  <Link to="/my-resources" className="btn btn-primary btn-sm flex-grow-1 py-2 px-3 fw-semibold" style={{ fontSize: '0.84rem' }}>
                    Manage in My Listed Items
                  </Link>
                  <Link to="/bookings?tab=owner_requests" className="btn btn-outline-secondary btn-sm flex-grow-1 py-2 px-3 fw-semibold" style={{ fontSize: '0.84rem' }}>
                    View Incoming Requests
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3.5 pb-3 border-bottom flex-wrap gap-2">
                  <div className="d-flex align-items-center">
                    <Clock className="text-dark me-2" size={18} />
                    <span className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>Select Reservation Period</span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    Pick dates below or click on calendar
                  </span>
                </div>

                {/* Reservation Form */}
                <form onSubmit={handleBookingSubmit} id="reservation-request-form">
                  <div className="row g-3 mb-3.5">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1.5" style={{ fontSize: '0.8rem' }}>
                        Start Date
                      </label>
                      <input
                        id="reservation-start-date"
                        type="date"
                        className="form-control rounded-3 py-2 px-3"
                        value={dateRange.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1.5" style={{ fontSize: '0.8rem' }}>
                        End Date
                      </label>
                      <input
                        id="reservation-end-date"
                        type="date"
                        className="form-control rounded-3 py-2 px-3"
                        value={dateRange.endDate}
                        min={dateRange.startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Purpose Input */}
                  <div className="mb-3.5">
                    <label className="form-label small fw-semibold text-secondary mb-1.5" style={{ fontSize: '0.8rem' }}>
                      Reservation Purpose / Project Topic
                    </label>
                    <textarea
                      id="reservation-purpose-textarea"
                      rows="2"
                      className="form-control rounded-3 py-2 px-3"
                      placeholder="E.g., IoT seminar, robotics contest, lab experiment..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                      style={{ fontSize: '0.85rem', minHeight: '52px', lineHeight: '1.5', resize: 'vertical' }}
                    ></textarea>
                  </div>

                  {/* Conflict Status Banner */}
                  {dateRange.startDate && dateRange.endDate && (
                    <div className="mb-3.5">
                      <ConflictBadge
                        checking={checkingConflict}
                        conflictData={conflictData}
                        selectedRange={dateRange}
                      />
                    </div>
                  )}

                  {/* Feedback Messages */}
                  {bookingSuccess && (
                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3.5">
                      <CheckCircle size={16} />
                      <span className="small">{bookingSuccess}</span>
                    </div>
                  )}
                  {bookingError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3.5">
                      <AlertCircle size={16} />
                      <span className="small">{bookingError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="request-reservation-btn"
                    className="btn btn-blue w-100 py-2.5 px-4 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-semibold"
                    disabled={submitting || checkingConflict || conflictData?.has_conflict}
                    style={{ fontSize: '0.88rem' }}
                  >
                    {submitting ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <>
                        <CheckCircle size={17} />
                        <span>Request Reservation</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Alternative suggestions if conflict occurs */}
          {conflictData?.has_conflict && conflictData?.alternatives?.length > 0 && (
            <AlternativeSuggestions
              resource={resource}
              selectedRange={dateRange}
              alternatives={conflictData.alternatives}
              onOpenCalendar={() => {}}
            />
          )}

          {/* Bottom Box: Availability Calendar & Order List */}
          <AvailabilityCalendar
            bookings={existingBookings}
            selectedRange={dateRange}
            onSelectDateRange={(newRange) => {
              setDateRange(newRange);
            }}
          />
        </div>
      </div>
    </div>
  );
}
