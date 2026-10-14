import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import { Search, Filter, RotateCcw, AlertCircle, Package } from 'lucide-react';

export default function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');

  // Load categories and locations on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const catRes = await api.categories.list();
        if (catRes.success) setCategories(catRes.categories);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  // Fetch resources when filters change
  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const res = await api.resources.list({
          q: query,
          category_id: selectedCategory,
          location: selectedLocation,
          sort: sortOption
        });
        if (res.success) {
          setResources(res.resources);
          if (res.locations) setLocations(res.locations);
        }
      } catch (err) {
        console.error('Failed to fetch resources', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFiltered();
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedLocation, sortOption]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSortOption('newest');
    setSearchParams({});
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Available Resources</h2>
        <p className="text-muted small mb-0">
          Browse, search, and reserve equipment across campus departments and academic labs.
        </p>
      </div>

      {/* Simplified Search & Category Filter (No outer box wrapper) */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <div className="position-relative flex-grow-1" style={{ maxWidth: '420px', minWidth: '240px' }}>
          <Search size={16} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
          <input
            id="resource-search-input"
            type="text"
            className="form-control ps-5 py-2 form-control-sm rounded-3 bg-white"
            placeholder="Search by name or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            id="category-filter-select"
            className="form-select form-select-sm py-2 rounded-3 bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {(query || selectedCategory) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-outline-secondary btn-sm p-2 rounded-3 flex-shrink-0"
            title="Reset Filters"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-2 text-muted small">Searching resources...</div>
        </div>
      ) : resources.length === 0 ? (
        query || selectedCategory || selectedLocation ? (
          <div className="text-center py-5 card-modern p-5 bg-white">
            <AlertCircle size={42} className="text-muted mb-2" />
            <h5 className="fw-bold text-dark">No matching resources found</h5>
            <p className="text-muted small">Try relaxing your search terms or clearing category filters.</p>
            <button onClick={handleResetFilters} className="btn btn-sm btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="card-clean p-5 text-center my-3 bg-white">
            <div 
              className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle" 
              style={{ width: '64px', height: '64px' }}
            >
              <Package size={30} />
            </div>
            <h5 className="fw-bold text-dark mb-1">No Resources Listed Yet</h5>
            <p className="text-muted small mb-3" style={{ maxWidth: '440px', margin: '0 auto' }}>
              No pre-defined items are placed in the catalog. Resources uploaded by campus members will appear here for reservation.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/my-resources" className="btn btn-primary btn-sm px-3 fw-semibold">
                + List a Resource
              </Link>
            </div>
          </div>
        )
      ) : (
        <div className="row g-3" id="resource-cards-grid">
          {resources.map((item) => (
            <div key={item.resource_id} className="col-12 col-sm-6 col-md-4 col-xl-3">
              <ResourceCard resource={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
