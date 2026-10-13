// frontend/src/pages/ResourceDetailPage.jsx
// Implements Module 3: Reservation and Conflict Prevention (Image 3 Screen 3, 6, 7)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConflictBadge from '../components/ConflictBadge';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import AlternativeSuggestions from '../components/AlternativeSuggestions';
import { 
  MapPin, Star, Shield, User, ArrowLeft, Calendar, 
  Clock, CheckCircle, AlertCircle, Info, Sparkles 
} from 'lucide-react';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshNotifications } = useAuth();

  const [resource, setResource] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reservation selection state (Defaults to Oct 15 - Oct 17 to match mockup)
  const currentYear = new Date().getFullYear();
  const [dateRange, setDateRange] = useState({
    startDate: `${currentYear}-10-15`,
    endDate: `${currentYear}-10-17`
  });
  const [purpose, setPurpose] = useState('Academic project presentation and documentation');

  // Conflict state
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const calendarSectionRef = useRef(null);

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

  // Live Conflict Detection Pre-Flight Check (Module 3 & Standout Feature)
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

  const scrollToCalendar = () => {
    calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div>
      {/* Breadcrumb / Back button */}
      <div className="mb-3">
        <Link to="/resources" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 hover-text-primary">
          <ArrowLeft size={16} />
          <span>Back to all resources</span>
        </Link>
      </div>

      {/* Main Reservation Card (Image 3 Screen 3) */}
      <div className="row g-4 mb-4">
        {/* Left Column: Resource Details & Image */}
        <div className="col-lg-6">
          <div className="card-clean p-4 h-100">
            <div className="rounded-3 overflow-hidden mb-3 bg-light" style={{ maxHeight: '380px' }}>
              <img
                src={resource.image_url}
                alt={resource.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover', maxHeight: '380px' }}
              />
            </div>

            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge-category fs-6 px-3 py-1">
                {resource.category_name}
              </span>
              <div className="d-flex align-items-center gap-1 text-warning">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(resource.rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                  />
                ))}
                <span className="small text-muted fw-bold ms-1">
                  ({resource.reviews_count} reviews)
                </span>
              </div>
            </div>

            <h3 className="fw-bold text-dark mb-2">{resource.title}</h3>

            <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
              {resource.description}
            </p>

            {/* Specs & Attributes */}
            <div className="row g-2 mb-4 bg-light p-3 rounded-3 border">
              <div className="col-sm-4">
                <span className="text-muted small d-block">Condition</span>
                <span className="fw-bold small text-dark d-flex align-items-center gap-1">
                  <Shield size={14} className="text-success" />
                  {resource.condition_status}
                </span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted small d-block">Location</span>
                <span className="fw-bold small text-dark d-flex align-items-center gap-1 text-truncate">
                  <MapPin size={14} className="text-primary" />
                  {resource.location}
                </span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted small d-block">Resource Owner</span>
                <span className="fw-bold small text-dark d-flex align-items-center gap-1">
                  <User size={14} className="text-info" />
                  {resource.owner_name}
                </span>
              </div>
            </div>

            {resource.specifications && (
              <div>
                <h6 className="fw-bold text-secondary small text-uppercase mb-2">Technical Specifications</h6>
                <div className="small text-muted p-2 rounded bg-white border">
                  {resource.specifications}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Date Selection & Conflict Prevention (Image 3 Screen 3) */}
        <div className="col-lg-6">
          <div className="card-clean p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-3">
                <Clock className="text-primary" size={22} />
                <h5 className="fw-bold mb-0">Select Reservation Period</h5>
              </div>

              {/* Form Controls (Unit-II DOM Form Controls, validation) */}
              <form onSubmit={handleBookingSubmit} id="reservation-request-form">
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">Start Date</label>
                    <input
                      id="reservation-start-date"
                      type="date"
                      className="form-control rounded-3"
                      value={dateRange.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">End Date</label>
                    <input
                      id="reservation-end-date"
                      type="date"
                      className="form-control rounded-3"
                      value={dateRange.endDate}
                      min={dateRange.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Purpose Textarea Control (Unit-II Textarea Controls) */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Reservation Purpose / Project Topic
                  </label>
                  <textarea
                    id="reservation-purpose-textarea"
                    rows="2"
                    className="form-control rounded-3"
                    placeholder="E.g., IoT seminar presentation, robotics contest, robotics demo..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Conflict Status Banner (Green if free, Red if conflict) */}
                <div className="mb-4">
                  <ConflictBadge
                    checking={checkingConflict}
                    conflictData={conflictData}
                    selectedRange={dateRange}
                  />
                </div>

                {/* Success / Error Messages */}
                {bookingSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                    <CheckCircle size={18} />
                    <span className="small">{bookingSuccess}</span>
                  </div>
                )}
                {bookingError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                    <AlertCircle size={18} />
                    <span className="small">{bookingError}</span>
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  type="submit"
                  id="request-reservation-btn"
                  className="btn btn-brand-primary w-100 py-2 fs-6 d-flex align-items-center justify-content-center gap-2 shadow"
                  disabled={submitting || checkingConflict || conflictData?.has_conflict}
                >
                  {submitting ? (
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Request Reservation</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Helper Links */}
            <div className="pt-3 border-top mt-4 d-flex align-items-center justify-content-between text-muted small">
              <span className="d-flex align-items-center gap-1">
                <Info size={14} /> Confirmed by faculty/owner
              </span>
              <button
                type="button"
                onClick={scrollToCalendar}
                className="btn btn-link text-primary text-decoration-none p-0 small fw-semibold"
              >
                View monthly calendar slots ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standout Feature 1: Intelligent Alternative Suggestions (Image 3 Screen 7) */}
      {conflictData?.has_conflict && conflictData?.alternatives?.length > 0 && (
        <AlternativeSuggestions
          resource={resource}
          selectedRange={dateRange}
          alternatives={conflictData.alternatives}
          onOpenCalendar={scrollToCalendar}
        />
      )}

      {/* Standout Feature 2: Visual Availability Calendar (Image 3 Screen 6) */}
      <section ref={calendarSectionRef} className="mt-4">
        <AvailabilityCalendar
          bookings={existingBookings}
          selectedRange={dateRange}
          onSelectDateRange={(newRange) => {
            setDateRange(newRange);
          }}
        />
      </section>
    </div>
  );
}
