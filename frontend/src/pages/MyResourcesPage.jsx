// frontend/src/pages/MyResourcesPage.jsx
// Implements Module 2: Add, Edit, Remove Resource Listings with Photos and Location
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Edit2, Trash2, Upload, CheckCircle2, 
  MapPin, AlertCircle, Eye, Image as ImageIcon 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    location: 'Library',
    condition_status: 'Good',
    description: '',
    specifications: '',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    status: 'available'
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadMyResources();
  }, [user]);

  async function loadMyResources() {
    setLoading(true);
    try {
      const [resRes, catRes] = await Promise.all([
        api.resources.list({ owner_id: user?.user_id }),
        api.categories.list()
      ]);
      if (resRes.success) setResources(resRes.resources || []);
      if (catRes.success) {
        setCategories(catRes.categories || []);
        if (catRes.categories.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: catRes.categories[0].category_id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      category_id: categories[0]?.category_id || 1,
      location: 'Library - Tech Wing',
      condition_status: 'Good',
      description: '',
      specifications: '',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      status: 'available'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (res) => {
    setEditingResource(res);
    setFormData({
      title: res.title,
      category_id: res.category_id,
      location: res.location,
      condition_status: res.condition_status,
      description: res.description,
      specifications: res.specifications || '',
      image_url: res.image_url,
      status: res.status
    });
    setShowModal(true);
  };

  // Unit-III PHP File Handling: Upload image
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadRes = await api.upload(file);
      if (uploadRes.success) {
        setFormData(prev => ({ ...prev, image_url: uploadRes.url }));
        setStatusMessage('Image uploaded successfully via PHP backend!');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        const res = await api.resources.update(editingResource.resource_id, formData);
        if (res.success) {
          setStatusMessage('Resource updated successfully!');
          setShowModal(false);
          loadMyResources();
        }
      } else {
        const res = await api.resources.create(formData);
        if (res.success) {
          setStatusMessage('New resource listed on ShareSphere!');
          setShowModal(false);
          loadMyResources();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (resId) => {
    if (!window.confirm('Are you sure you want to delete this resource listing?')) return;
    try {
      const res = await api.resources.delete(resId);
      if (res.success) {
        setStatusMessage('Resource deleted successfully.');
        loadMyResources();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Listed Equipment</h2>
          <p className="text-muted small mb-0">
            Add, update, or remove shareable items you own or oversee for academic use.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn btn-blue d-flex align-items-center gap-2"
          id="add-new-resource-btn"
        >
          <Plus size={18} />
          <span>Add New Resource</span>
        </button>
      </div>

      {statusMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-4 shadow-sm animate-fadeIn">
          <CheckCircle2 size={18} />
          <span className="small">{statusMessage}</span>
        </div>
      )}

      {/* Resource Listings */}
      <div className="card-clean overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted small">Loading your listings...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-5 p-4">
            <ImageIcon size={40} className="text-muted mb-2" />
            <h5 className="fw-bold text-dark">You have not listed any resources yet</h5>
            <p className="text-muted small mb-3">
              Share cameras, lab tools, or books with fellow students and earn verified community badges.
            </p>
            <button onClick={handleOpenAddModal} className="btn btn-sm btn-primary">
              List Your First Resource
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
              <thead className="bg-light">
                <tr className="small text-secondary fw-bold">
                  <th className="ps-4 py-3">Resource</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Location</th>
                  <th className="py-3">Condition</th>
                  <th className="py-3">Status</th>
                  <th className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((res) => (
                  <tr key={res.resource_id}>
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={res.image_url}
                          alt={res.title}
                          className="rounded-2"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-dark small">{res.title}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '240px', fontSize: '0.72rem' }}>
                            {res.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 small text-muted">{res.category_name}</td>
                    <td className="py-3 small text-muted">
                      <span className="d-flex align-items-center gap-1">
                        <MapPin size={12} className="text-primary" /> {res.location}
                      </span>
                    </td>
                    <td className="py-3 small fw-semibold text-dark">{res.condition_status}</td>
                    <td className="py-3">
                      <span className={res.status === 'available' ? 'badge-available' : 'badge-rejected'}>
                        {res.status}
                      </span>
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <div className="d-inline-flex gap-2">
                        <Link
                          to={`/resources/${res.resource_id}`}
                          className="btn btn-sm btn-outline-secondary p-1"
                          title="View public detail page"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(res)}
                          className="btn btn-sm btn-outline-primary p-1"
                          title="Edit resource"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(res.resource_id)}
                          className="btn btn-sm btn-outline-danger p-1"
                          title="Delete resource"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Resource Modal (Unit-II Form Controls & Z-Index) */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1100 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title fw-bold">
                  {editingResource ? 'Edit Resource Listing' : 'List New Campus Resource'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Title */}
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Resource Title / Item Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-3"
                        placeholder="E.g. Canon EOS 200D DSLR Camera"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Category Select (Unit-II Pull-down menus) */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select form-select-sm rounded-3"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.category_id} value={c.category_id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location & Condition */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Pickup Location</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-3"
                        placeholder="E.g. Library / Media Lab - Room 204"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Condition Status</label>
                      <select
                        className="form-select form-select-sm rounded-3"
                        value={formData.condition_status}
                        onChange={(e) => setFormData({ ...formData, condition_status: e.target.value })}
                      >
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>

                    {/* Description (Unit-II Textarea Controls) */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        rows="3"
                        className="form-control form-control-sm rounded-3"
                        placeholder="Detailed overview of the equipment, guidelines for use, and included accessories..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    {/* Specifications */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Specifications (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-3"
                        placeholder="E.g., 24.1MP | 18-55mm IS STM Lens | 2x LP-E17 Batteries"
                        value={formData.specifications}
                        onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                      />
                    </div>

                    {/* Image URL & File Upload */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Photo / Thumbnail URL</label>
                      <div className="input-group input-group-sm mb-2">
                        <input
                          type="text"
                          className="form-control rounded-start-3"
                          placeholder="https://images.unsplash.com/..."
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          required
                        />
                        <label className="btn btn-outline-secondary rounded-end-3 mb-0 d-flex align-items-center gap-1 cursor-pointer">
                          <Upload size={14} />
                          <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleFileUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        You can upload an image file from your device or provide an image URL.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 border-0 rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 fw-semibold"
                  >
                    {editingResource ? 'Save Changes' : 'Create Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
