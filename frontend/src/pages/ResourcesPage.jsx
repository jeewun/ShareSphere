// frontend/src/pages/ResourcesPage.jsx
// Implements Module 2: Resource Listing & Discovery (Image 3 Screen 2)
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import { Search, Filter, RotateCcw, AlertCircle } from 'lucide-react';

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
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Available Resources</h2>
          <p className="text-muted small mb-0">
            Browse, search, and reserve equipment across campus departments and academic labs.
          </p>
        </div>
        <div className="text-muted small">
          Showing <span className="fw-bold text-dark">{resources.length}</span> items
        </div>
      </div>

      {/* Filter and Search Controls (Image 3 Screen 2) */}
      <div className="card-clean p-3 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-lg-4">
            <div className="position-relative">
              <Search size={16} className="position-absolute text-muted" style={{ top: '12px', left: '12px' }} />
              <input
                id="resource-search-input"
                type="text"
                className="form-control ps-5 py-2 form-control-sm rounded-3"
                placeholder="Search by name or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-3 col-lg-3">
            <select
              id="category-filter-select"
              className="form-select form-select-sm py-2 rounded-3"
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

          {/* Location Filter */}
          <div className="col-6 col-md-3 col-lg-3">
            <select
              id="location-filter-select"
              className="form-select form-select-sm py-2 rounded-3"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Library">Library</option>
              <option value="Science Building">Science Building</option>
              <option value="Sports Complex">Sports Complex</option>
              <option value="Media Lab">Media Lab</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Lab 1">Lab 1 (Electrical)</option>
            </select>
          </div>

          {/* Sort By & Reset */}
          <div className="col-12 col-md-6 col-lg-2 d-flex gap-2">
            <select
              id="sort-select"
              className="form-select form-select-sm py-2 rounded-3 flex-grow-1"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
            {(query || selectedCategory || selectedLocation || sortOption !== 'newest') && (
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
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-2 text-muted small">Searching resources...</div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-5 card-modern p-5">
          <AlertCircle size={42} className="text-muted mb-2" />
          <h5 className="fw-bold text-dark">No matching resources found</h5>
          <p className="text-muted small">Try relaxing your search terms or clearing category filters.</p>
          <button onClick={handleResetFilters} className="btn btn-sm btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="row g-4" id="resource-cards-grid">
          {resources.map((item) => (
            <div key={item.resource_id} className="col-12 col-sm-6 col-lg-4">
              <ResourceCard resource={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
