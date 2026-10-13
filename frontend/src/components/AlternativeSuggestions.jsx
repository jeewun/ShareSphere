// frontend/src/components/AlternativeSuggestions.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';

export default function AlternativeSuggestions({ resource, selectedRange, alternatives = [], onOpenCalendar }) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="card-clean p-4 mb-4 border-warning border-opacity-50" style={{ backgroundColor: '#fffdfa' }} id="alternative-suggestions-card">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Sparkles className="text-warning" size={24} />
        <h5 className="fw-bold mb-0 text-dark">Intelligent Alternative Suggestions</h5>
      </div>

      <div className="p-3 bg-white rounded-3 border border-warning border-opacity-25 mb-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="fw-bold text-dark fs-6 mb-1">
              {resource.title} is currently unavailable for these dates
            </div>
            <div className="text-muted small">
              Requested window: <span className="fw-semibold text-dark">{selectedRange.startDate} to {selectedRange.endDate}</span>.
              Our system found available equipment in <span className="fw-semibold text-primary">{resource.category_name}</span>.
            </div>
          </div>
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 flex-shrink-0"
            >
              <Calendar size={16} />
              <span>View Free Time Slots</span>
            </button>
          )}
        </div>
      </div>

      <div className="fw-semibold text-secondary mb-3 small text-uppercase tracking-wider">
        Here are similar items with open availability:
      </div>

      <div className="row g-3">
        {alternatives.map((alt) => (
          <div key={alt.resource_id} className="col-md-4">
            <div className="card h-100 border rounded-3 p-2 bg-white shadow-sm hover-shadow transition">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={alt.image_url}
                  alt={alt.title}
                  className="rounded-2"
                  style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1 overflow-hidden">
                  <h6 className="fw-bold mb-0 text-truncate small" title={alt.title}>
                    {alt.title}
                  </h6>
                  <div className="text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>
                    {alt.location}
                  </div>
                  <div className="mt-1 d-flex align-items-center justify-content-between">
                    <span className="badge-available py-0 px-2" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle size={10} /> Available
                    </span>
                    <Link
                      to={`/resources/${alt.resource_id}`}
                      className="btn btn-sm btn-outline-primary py-0 px-2 small"
                      style={{ fontSize: '0.75rem' }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-end mt-3">
        <Link
          to={`/resources?category_id=${resource.category_id}`}
          className="text-primary text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
        >
          <span>Search all {resource.category_name} equipment</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

AlternativeSuggestions.propTypes = {
  resource: PropTypes.object.isRequired,
  selectedRange: PropTypes.object.isRequired,
  alternatives: PropTypes.array,
  onOpenCalendar: PropTypes.func
};
