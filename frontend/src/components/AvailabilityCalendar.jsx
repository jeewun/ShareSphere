// frontend/src/components/AvailabilityCalendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, User } from 'lucide-react';
import PropTypes from 'prop-types';

export default function AvailabilityCalendar({ bookings = [], onSelectDateRange, selectedRange }) {
  // Calendar state: Year and Month
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to October 2026 to match image mockup
    return new Date(2026, 9, 1);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  // Check if a day has a booking
  const getDayStatus = (day) => {
    const dateStr = formatDateStr(year, month, day);

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
    const status = getDayStatus(day);
    if (status === 'reserved') return; // Cannot pick reserved slot

    const dateStr = formatDateStr(year, month, day);

    if (!selectedRange.startDate || (selectedRange.startDate && selectedRange.endDate)) {
      // Start new selection
      onSelectDateRange({ startDate: dateStr, endDate: '' });
    } else {
      // Pick end date
      if (dateStr < selectedRange.startDate) {
        onSelectDateRange({ startDate: dateStr, endDate: selectedRange.startDate });
      } else {
        onSelectDateRange({ startDate: selectedRange.startDate, endDate: dateStr });
      }
    }
  };

  return (
    <div className="card-clean p-4" id="availability-calendar-card">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <CalendarIcon className="text-primary" size={22} />
          <h5 className="fw-bold mb-0">Availability Calendar</h5>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary p-1" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <span className="fw-semibold px-2" style={{ minWidth: '130px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button className="btn btn-sm btn-outline-secondary p-1" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Calendar Grid */}
        <div className="col-lg-8">
          <div className="calendar-grid mb-3">
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
              return (
                <div
                  key={`day-${day}`}
                  className={`calendar-cell ${status}`}
                  onClick={() => handleDayClick(day)}
                  title={`${monthNames[month]} ${day}: ${status}`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="d-flex align-items-center gap-4 pt-2 border-top flex-wrap" style={{ fontSize: '0.82rem' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle border border-secondary" style={{ width: '12px', height: '12px', backgroundColor: '#fff' }}></span>
              <span className="text-muted">Available</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: '#fca5a5' }}></span>
              <span className="text-muted">Reserved</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: '#fde68a' }}></span>
              <span className="text-muted">Pending</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: '#2563eb' }}></span>
              <span className="text-muted">Selected</span>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings Panel (Right Side of Screen 6) */}
        <div className="col-lg-4">
          <div className="bg-light p-3 rounded-3 h-100 border">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <Clock size={16} className="text-primary" />
              <span>Upcoming Bookings</span>
            </h6>

            {bookings.length === 0 ? (
              <div className="text-muted small py-3 text-center">
                No active reservations for this resource. All slots are open.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {bookings.map((b) => (
                  <div key={b.reservation_id} className="p-2 bg-white rounded border shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="small fw-bold text-dark">
                        {b.start_date.substring(5)} → {b.end_date.substring(5)}
                      </span>
                      <span className={b.status === 'approved' ? 'badge-approved' : 'badge-pending'}>
                        {b.status === 'approved' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <div className="small text-muted d-flex align-items-center gap-1">
                      <User size={12} />
                      <span>{b.user_name || 'Campus Student'}</span>
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
