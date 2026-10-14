// frontend/src/components/AvailabilityCalendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, User } from 'lucide-react';
import PropTypes from 'prop-types';

export default function AvailabilityCalendar({ bookings = [], onSelectDateRange, selectedRange }) {
  // Calendar state: Year and Month
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to format date YYYY-MM-DD
  const formatDateStr = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Helper to format date for humans (e.g. Oct 15)
  const formatHumanDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const mIdx = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);
      return `${shortMonthNames[mIdx] || parts[1]} ${dayNum}`;
    }
    return dateStr;
  };

  // Check if a day has a booking
  const getDayStatus = (day) => {
    const dateStr = formatDateStr(year, month, day);

    // Disable past dates
    if (dateStr < todayStr) {
      return 'past-disabled';
    }

    // Check if within selectedRange
    if (selectedRange && selectedRange.startDate && selectedRange.endDate) {
      if (dateStr === selectedRange.startDate || dateStr === selectedRange.endDate) {
        return 'selected';
      }
      if (dateStr > selectedRange.startDate && dateStr < selectedRange.endDate) {
        return 'in-range';
      }
    } else if (selectedRange && selectedRange.startDate === dateStr) {
      return 'selected';
    }

    // Check existing bookings
    for (const b of bookings) {
      if (dateStr >= b.start_date && dateStr <= b.end_date) {
        return b.status === 'approved' ? 'reserved' : 'pending-slot';
      }
    }

    return 'available';
  };

  // Click on a day
  const handleDayClick = (day) => {
    const dateStr = formatDateStr(year, month, day);
    if (dateStr < todayStr) {
      return; // Past dates disabled
    }

    const status = getDayStatus(day);
    if (status === 'reserved' || status === 'past-disabled') return;

    if (!selectedRange.startDate || (selectedRange.startDate && selectedRange.endDate)) {
      onSelectDateRange({ startDate: dateStr, endDate: '' });
    } else {
      if (dateStr < selectedRange.startDate) {
        onSelectDateRange({ startDate: dateStr, endDate: selectedRange.startDate });
      } else {
        onSelectDateRange({ startDate: selectedRange.startDate, endDate: dateStr });
      }
    }
  };

  return (
    <div className="card-clean p-4" id="availability-calendar-card">
      {/* Header: Month & Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-3.5 pb-2.5 border-bottom flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <CalendarIcon className="text-primary" size={18} />
          <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.96rem' }}>
            Availability Calendar
          </h6>
        </div>
        <div className="d-flex align-items-center gap-1.5">
          <button 
            type="button"
            className="btn btn-sm btn-outline-secondary p-0 px-2 rounded-2" 
            onClick={prevMonth} 
            aria-label="Previous month" 
            title="Previous Month"
            style={{ height: '28px', lineHeight: '1' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="fw-semibold px-2 small text-dark" style={{ minWidth: '115px', textAlign: 'center', fontSize: '0.85rem' }}>
            {monthNames[month]} {year}
          </span>
          <button 
            type="button"
            className="btn btn-sm btn-outline-secondary p-0 px-2 rounded-2" 
            onClick={nextMonth} 
            aria-label="Next month" 
            title="Next Month"
            style={{ height: '28px', lineHeight: '1' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Structured Split: Calendar Grid on Left, Order List on Right */}
      <div className="row g-3">
        {/* Left: Monthly Calendar */}
        <div className="col-12 col-md-7">
          <div className="calendar-grid mb-2.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="calendar-header-day">
                {d}
              </div>
            ))}

            {/* Empty slots before first day */}
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`empty-${i}`} className="calendar-cell disabled"></div>
            ))}

            {/* Month days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const status = getDayStatus(day);
              const isPast = status === 'past-disabled';

              return (
                <div
                  key={`day-${day}`}
                  className={`calendar-cell ${status}`}
                  onClick={() => handleDayClick(day)}
                  title={isPast ? `${monthNames[month]} ${day}: Past date (unavailable)` : `${monthNames[month]} ${day}: ${status}`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div 
            className="d-flex align-items-center justify-content-center gap-3 pt-2 border-top flex-wrap" 
            style={{ fontSize: '0.74rem' }}
          >
            <div className="d-flex align-items-center gap-1.5">
              <span className="rounded-circle border" style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderColor: '#94a3b8' }}></span>
              <span className="text-secondary">Available</span>
            </div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#ef4444' }}></span>
              <span className="text-secondary">Reserved</span>
            </div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b' }}></span>
              <span className="text-secondary">Pending</span>
            </div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#2563eb' }}></span>
              <span className="text-secondary">Selected</span>
            </div>
          </div>
        </div>

        {/* Right: Order List / Bookings */}
        <div className="col-12 col-md-5">
          <div className="bg-light p-3 rounded-3 border h-100 d-flex flex-column" style={{ minHeight: '250px' }}>
            <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-1.5">
                <Clock size={15} className="text-primary" />
                <span className="fw-bold text-dark small">Order List</span>
              </div>
              <span className="badge bg-white text-secondary border fw-medium" style={{ fontSize: '0.68rem', padding: '3px 7px' }}>
                {bookings.length} {bookings.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center text-muted small my-auto py-4">
                <CheckCircle2 size={24} className="text-secondary opacity-40 mb-1.5 mx-auto" />
                <div className="fw-semibold text-dark small">No Active Orders</div>
                <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                  All slots are currently open to reserve.
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 overflow-auto pe-1" style={{ maxHeight: '235px' }}>
                {bookings.map((b) => (
                  <div key={b.reservation_id} className="p-2.5 bg-white rounded-3 border shadow-xs">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark small d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                        <CalendarIcon size={12} className="text-secondary" />
                        {formatHumanDate(b.start_date)} → {formatHumanDate(b.end_date)}
                      </span>
                      <span className={b.status === 'approved' ? 'badge-approved' : 'badge-pending'} style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                        {b.status === 'approved' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                      <span className="d-flex align-items-center gap-1 text-truncate">
                        <User size={11} />
                        {b.user_name || 'Campus Student'}
                      </span>
                      {b.purpose && (
                        <span className="text-truncate ms-2 text-secondary" style={{ maxWidth: '100px' }} title={b.purpose}>
                          {b.purpose}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

AvailabilityCalendar.propTypes = {
  bookings: PropTypes.array,
  onSelectDateRange: PropTypes.func.isRequired,
  selectedRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string
  }).isRequired
};
