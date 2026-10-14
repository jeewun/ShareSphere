import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import { 
  ArrowRight, Camera, Laptop, Cpu, Trophy, BookOpen, Layers, MoreHorizontal,
  ShieldCheck
} from 'lucide-react';

export default function HomePage() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ available: 0, bookings: 0, pending: 0 });
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
            available: Number(statRes.total_resources) || 0,
            bookings: Number(statRes.active_bookings) || 0,
            pending: Number(statRes.pending_requests) || 0
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
      case 'Camera': return <Camera size={18} className="text-dark" />;
      case 'Laptop': return <Laptop size={18} className="text-dark" />;
      case 'Cpu': return <Cpu size={18} className="text-dark" />;
      case 'Trophy': return <Trophy size={18} className="text-dark" />;
      case 'BookOpen': return <BookOpen size={18} className="text-dark" />;
      case 'MoreHorizontal': return <MoreHorizontal size={18} className="text-dark" />;
      default: return <Layers size={18} className="text-dark" />;
    }
  };

  return (
    <div>
      {/* Landing Poster / Hero Template in Sleek Black */}
      <div 
        className="card border-0 mb-4 overflow-hidden shadow-lg position-relative text-white"
        style={{
          background: 'linear-gradient(135deg, #090a0f 0%, #06070a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '22px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Subtle decorative ambient glow circles */}
        <div 
          className="position-absolute rounded-circle"
          style={{
            top: '-80px',
            right: '-60px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, rgba(9, 10, 15, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div className="p-4 p-md-5 position-relative">
          <div className="row align-items-center g-4">
            {/* Left Column: Heading, Subtitle & Action Buttons */}
            <div className="col-12 col-lg-7">
              <div 
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 small fw-semibold"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.07)', 
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#f1f5f9'
                }}
              >
                <ShieldCheck size={14} style={{ color: '#cbd5e1' }} />
                <span>Campus Equipment Exchange</span>
              </div>

              <h2 className="fw-bold text-white mb-2 brand-font" style={{ fontSize: '2.1rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                Smart Resource Sharing & Availability
              </h2>

              <p className="text-light text-opacity-75 mb-4" style={{ maxWidth: '580px', fontSize: '0.94rem', lineHeight: '1.6' }}>
                Reserve verified campus gear from fellow students and faculty with instant availability tracking, 
                secure ephemeral pickup coordination, and zero double-booking conflicts.
              </p>

              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Link to="/resources" className="btn btn-hero-primary fw-semibold px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2">
                  <span>Browse Equipment</span>
                  <ArrowRight size={15} />
                </Link>
                <Link 
                  to="/my-resources" 
                  className="btn btn-hero-secondary px-4 py-2.5 rounded-3"
                >
                  + List an Item
                </Link>
              </div>
            </div>

            {/* Right Column: Sleek Platform Details (No glyphs, clean spacing) */}
            <div className="col-12 col-lg-5">
              <div className="row g-4 ps-lg-4">
                <div className="col-6">
                  <div 
                    className="small text-uppercase fw-semibold mb-1.5" 
                    style={{ fontSize: '0.74rem', color: '#94a3b8', letterSpacing: '0.12em', wordSpacing: '0.18em' }}
                  >
                    Available
                  </div>
                  <div className="fs-2 fw-bold text-white tracking-tight lh-1 mb-1">
                    {stats.available}
                  </div>
                  <div 
                    className="small" 
                    style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.02em', wordSpacing: '0.06em' }}
                  >
                    Equipment items listed
                  </div>
                </div>

                <div className="col-6">
                  <div 
                    className="small text-uppercase fw-semibold mb-1.5" 
                    style={{ fontSize: '0.74rem', color: '#94a3b8', letterSpacing: '0.12em', wordSpacing: '0.18em' }}
                  >
                    Active
                  </div>
                  <div className="fs-2 fw-bold text-white tracking-tight lh-1 mb-1">
                    {stats.bookings}
                  </div>
                  <div 
                    className="small" 
                    style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.02em', wordSpacing: '0.06em' }}
                  >
                    Current reservations
                  </div>
                </div>

                <div className="col-6">
                  <div 
                    className="small text-uppercase fw-semibold mb-1.5" 
                    style={{ fontSize: '0.74rem', color: '#94a3b8', letterSpacing: '0.12em', wordSpacing: '0.18em' }}
                  >
                    In Review
                  </div>
                  <div className="fs-2 fw-bold text-white tracking-tight lh-1 mb-1">
                    {stats.pending}
                  </div>
                  <div 
                    className="small" 
                    style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.02em', wordSpacing: '0.06em' }}
                  >
                    Awaiting handover
                  </div>
                </div>

                <div className="col-6">
                  <div 
                    className="small text-uppercase fw-semibold mb-1.5" 
                    style={{ fontSize: '0.74rem', color: '#94a3b8', letterSpacing: '0.12em', wordSpacing: '0.18em' }}
                  >
                    Trust Rate
                  </div>
                  <div className="fs-2 fw-bold text-white tracking-tight lh-1 mb-1">
                    100%
                  </div>
                  <div 
                    className="small" 
                    style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.02em', wordSpacing: '0.06em' }}
                  >
                    Peer-verified campus
                  </div>
                </div>
              </div>
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
          <Link to="/resources" className="text-dark text-decoration-none small fw-semibold d-flex align-items-center gap-1">
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

      {/* Available Resources Grid */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Available Resources</h3>
          <p className="text-muted small mb-0">
            Browse and reserve equipment uploaded and shared across campus.
          </p>
        </div>
        <Link to="/resources" className="btn btn-sm btn-outline-dark fw-semibold px-3">
          Explore Catalog
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-2 text-muted small">Loading campus equipment...</div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card-clean p-5 text-center my-3 bg-white">
          <div 
            className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle" 
            style={{ width: '64px', height: '64px' }}
          >
            <Package size={30} />
          </div>
          <h5 className="fw-bold text-dark mb-1">No Resources Listed Yet</h5>
          <p className="text-muted small mb-3" style={{ maxWidth: '440px', margin: '0 auto' }}>
            Only resources uploaded by real users will appear in the catalog. Be the first to list and share equipment with your campus community!
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/my-resources" className="btn btn-primary btn-sm px-3 fw-semibold">
              + List a Resource
            </Link>
          </div>
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
