// frontend/src/components/ResourceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

export default function ResourceCard({ resource }) {
  const {
    resource_id,
    title,
    category_name,
    location,
    image_url,
    rating,
    reviews_count,
    status,
    owner_name
  } = resource;

  const isAvailable = status === 'available';

  return (
    <article className="resource-card" id={`resource-card-${resource_id}`}>
      {/* Thumbnail */}
      <div className="img-box">
        <img
          src={image_url}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge-category shadow-sm">
            {category_name || 'General'}
          </span>
        </div>
      </div>

      {/* Details Box */}
      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <h5 className="fw-bold mb-1 text-truncate text-dark" title={title} style={{ fontSize: '1.02rem' }}>
            {title}
          </h5>

          {/* Rating */}
          <div className="d-flex align-items-center gap-1 mb-2">
            <div className="d-flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  fill={i < Math.floor(rating || 4.5) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                />
              ))}
            </div>
            <span className="small text-muted fw-semibold" style={{ fontSize: '0.78rem' }}>
              ({reviews_count || 10})
            </span>
          </div>

          {/* Location */}
          <div className="d-flex align-items-center text-muted small mb-2 gap-1" style={{ fontSize: '0.82rem' }}>
            <MapPin size={13} className="text-secondary flex-shrink-0" />
            <span className="text-truncate">{location}</span>
          </div>

          {/* Status & Owner */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className={isAvailable ? 'badge-available' : 'badge-rejected'}>
              {isAvailable ? 'Available' : 'Reserved'}
            </span>
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
              By: <span className="fw-semibold text-dark">{owner_name?.split(' ')[0] || 'Campus'}</span>
            </span>
          </div>
        </div>

        {/* View Details Action */}
        <Link
          to={`/resources/${resource_id}`}
          className="btn btn-blue w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
          id={`view-details-btn-${resource_id}`}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

ResourceCard.propTypes = {
  resource: PropTypes.shape({
    resource_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    category_name: PropTypes.string,
    location: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    reviews_count: PropTypes.number,
    status: PropTypes.string,
    owner_name: PropTypes.string
  }).isRequired
};
