// frontend/src/components/AvailabilityCalendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import PropTypes from 'prop-types';

export default function AvailabilityCalendar({ bookings = [], onSelectDateRange, selectedRange, compact = false }) {
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
      // Past dates are strictly disabled
      return;
    }

    const status = getDayStatus(day);
    if (status === 'reserved' || status === 'past-disabled') return; // Cannot pick reserved or past slot

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
    <div className={`card-clean ${compact ? 'p-2.5 px-3' : 'p-4'}`} id="availability-calendar-card">
      {/* Header: Month & Navigation */}
      <div className={`d-flex align-items-center justify-content-between ${compact ? 'mb-2' : 'mb-3'} flex-wrap gap-2`}>
        <div className="d-flex align-items-center gap-1.5">
          <CalendarIcon className="text-primary" size={compact ? 15 : 20} />
          <span className="fw-bold text-dark" style={{ fontSize: compact ? '0.86rem' : '1.05rem' }}>
            Availability Calendar
          </span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <button 
            className="btn btn-sm btn-outline-secondary p-0 px-1 rounded-2" 
            onClick={prevMonth} 
            aria-label="Previous month" 
            title="Previous Month"
            style={{ height: '24px', lineHeight: '1' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="fw-semibold px-1 small text-dark" style={{ minWidth: '95px', textAlign: 'center', fontSize: compact ? '0.78rem' : '0.85rem' }}>
            {monthNames[month]} {year}
          </span>
          <button 
            className="btn btn-sm btn-outline-secondary p-0 px-1 rounded-2" 
            onClick={nextMonth} 
            aria-label="Next month" 
            title="Next Month"
            style={{ height: '24px', lineHeight: '1' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className={compact ? 'calendar-grid-compact' : 'calendar-grid mb-2.5'}>
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

      {/* Calendar Legend: Reserved (Red), Pending (Yellow), Selected (Blue), Available (White) */}
      <div 
        className="d-flex align-items-center justify-content-center gap-3 pt-2 mt-1 border-top flex-wrap" 
        style={{ fontSize: '0.7rem' }}
      >
        <div className="d-flex align-items-center gap-1">
          <span className="rounded-circle border" style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderColor: '#94a3b8' }}></span>
          <span className="text-secondary">Available</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#ef4444' }}></span>
          <span className="text-secondary">Reserved</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b' }}></span>
          <span className="text-secondary">Pending</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#2563eb' }}></span>
          <span className="text-secondary">Selected</span>
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
  }).isRequired,
  compact: PropTypes.bool
};
