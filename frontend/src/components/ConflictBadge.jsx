// frontend/src/components/ConflictBadge.jsx
import React from 'react';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

export default function ConflictBadge({ checking, conflictData, selectedRange }) {
  if (!selectedRange.startDate || !selectedRange.endDate) {
    return (
      <div className="alert alert-secondary py-3 text-center rounded-3 border-0 bg-light">
        <Clock size={18} className="me-2 text-muted" />
        <span className="small text-muted">Select your reservation dates to check real-time availability.</span>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="alert alert-secondary py-3 text-center rounded-3 border-0 bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center gap-2">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        <span className="small fw-semibold text-dark">Running backend conflict checks for {selectedRange.startDate} to {selectedRange.endDate}...</span>
      </div>
    );
  }

  if (!conflictData) return null;

  if (conflictData.has_conflict) {
    return (
      <div className="alert alert-danger p-3 rounded-3 border-danger border-opacity-25 shadow-sm" id="conflict-detected-alert">
        <div className="d-flex align-items-start gap-3">
          <div className="bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h6 className="fw-bold text-danger mb-1">Conflicting Reservation Detected</h6>
            <p className="small text-danger mb-1">
              This resource has an existing booking overlapping with your requested dates ({selectedRange.startDate} to {selectedRange.endDate}).
            </p>
            {conflictData.conflicts && conflictData.conflicts.length > 0 && (
              <div className="small bg-white p-2 rounded border border-danger border-opacity-25 text-danger-emphasis">
                <strong>Existing Booking:</strong> {conflictData.conflicts[0].start_date} to {conflictData.conflicts[0].end_date} (Status: {conflictData.conflicts[0].status})
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alert alert-success p-3 rounded-3 border-success border-opacity-25 shadow-sm" id="available-slot-alert">
      <div className="d-flex align-items-center gap-3">
        <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h6 className="fw-bold text-success mb-1">This resource is available!</h6>
          <div className="small text-success-emphasis">
            No scheduling conflicts detected for {selectedRange.startDate} to {selectedRange.endDate}. You can request this reservation.
          </div>
        </div>
      </div>
    </div>
  );
}

ConflictBadge.propTypes = {
  checking: PropTypes.bool,
  conflictData: PropTypes.object,
  selectedRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string
  }).isRequired
};
