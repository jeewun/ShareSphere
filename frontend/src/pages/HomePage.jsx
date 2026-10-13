// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import { 
  Package, CalendarCheck, Clock, CheckCircle2, ArrowRight,
  Camera, Laptop, Cpu, Trophy, BookOpen, Layers
} from 'lucide-react';

export default function HomePage() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ available: 10, bookings: 5, pending: 2 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resRes, catRes, statRes] = await Promise.all([
          api.resources.list({ sort: 'rating_desc' }),
          api.categories.list(),
          api.resources.getOverviewStats().catch(() => ({ success: false }))
        ]);
        if (resRes.success) setResources(resRes.resources || []);
        if (catRes.success) setCategories(catRes.categories || []);
        if (statRes && statRes.total_resources !== undefined) {
          setStats({
            available: statRes.total_resources,
            bookings: statRes.active_bookings,
            pending: statRes.pending_requests
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCatIcon = (icon) => {
    switch (icon) {
      case 'Camera': return <Camera size={18} className="text-primary" />;
      case 'Laptop': return <Laptop size={18} className="text-primary" />;
      case 'Cpu': return <Cpu size={18} className="text-primary" />;
      case 'Trophy': return <Trophy size={18} className="text-primary" />;
      default: return <Layers size={18} className="text-primary" />;
    }
  };

  return (
    <div>
      {/* Overview Stat Badges */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card-clean">
            <div className="stat-icon-box bg-primary bg-opacity-10 text-primary">
              <Package size={22} />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Available Resources</div>
              <div className="fs-4 fw-bold text-dark">{stats.available || 10} Items</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card-clean">
            <div className="stat-icon-box bg-success bg-opacity-10 text-success">
              <CalendarCheck size={22} />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Active Bookings</div>
              <div className="fs-4 fw-bold text-dark">{stats.bookings || 7} Reservations</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card-clean">
            <div className="stat-icon-box bg-warning bg-opacity-10 text-warning">
              <Clock size={22} />
            </div>
            <div>
              <div className="text-muted small fw-semibold">Pending Requests</div>
              <div className="fs-4 fw-bold text-dark">{stats.pending || 2} In Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="fw-bold text-secondary text-uppercase small mb-0" style={{ letterSpacing: '0.05em' }}>
            Categories
          </h6>
          <Link to="/resources" className="text-primary text-decoration-none small fw-semibold d-flex align-items-center gap-1">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          {categories.map((c) => (
            <Link
              key={c.category_id}
              to={`/resources?category_id=${c.category_id}`}
              className="btn btn-sm btn-white border bg-white d-flex align-items-center gap-2 py-2 px-3 shadow-sm rounded-3 text-decoration-none text-dark hover-shadow"
            >
              {getCatIcon(c.icon)}
              <span className="small fw-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Available Resources Grid (Matches Image 3 Screen 2) */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Available Resources</h3>
          <p className="text-muted small mb-0">
            Browse and reserve equipment across campus departments and academic labs.
          </p>
        </div>
        <Link to="/resources" className="btn btn-sm btn-outline-primary fw-semibold px-3">
          Explore Catalog
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-2 text-muted small">Loading campus equipment...</div>
        </div>
      ) : (
        <div className="row g-4" id="home-resource-grid">
          {resources.slice(0, 6).map((item) => (
            <div key={item.resource_id} className="col-12 col-md-6 col-lg-4">
              <ResourceCard resource={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
