// frontend/src/pages/RegisterPage.jsx
// Implements Module 1: User Registration (Image 3 Screen 1)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Share2, User, Mail, Lock, UserPlus, AlertCircle, Building } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student',
    department: 'Information Technology'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundImage: 'linear-gradient(rgba(12, 30, 51, 0.85), rgba(8, 20, 34, 0.9)), url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="card-modern p-4 p-sm-5 shadow-lg" style={{ maxWidth: '460px', width: '100%', borderRadius: '20px' }}>
        <div className="text-center mb-4">
          <div className="brand-badge mb-2 d-inline-flex p-3 rounded-circle shadow">
            <Share2 size={28} className="text-white" />
          </div>
          <h3 className="fw-bold text-dark mb-1 brand-font">ShareSphere</h3>
          <h5 className="fw-bold text-primary mb-1">Create Your Account</h5>
          <p className="text-muted small">Join ShareSphere and start sharing resources</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="register-form">
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name</label>
            <div className="position-relative">
              <User size={16} className="position-absolute text-muted" style={{ top: '11px', left: '12px' }} />
              <input
                id="register-name-input"
                type="text"
                className="form-control form-control-sm rounded-3 ps-5 py-2"
                placeholder="Alex Carter"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email address</label>
            <div className="position-relative">
              <Mail size={16} className="position-absolute text-muted" style={{ top: '11px', left: '12px' }} />
              <input
                id="register-email-input"
                type="email"
                className="form-control form-control-sm rounded-3 ps-5 py-2"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="position-relative">
                <Lock size={15} className="position-absolute text-muted" style={{ top: '11px', left: '10px' }} />
                <input
                  id="register-password-input"
                  type="password"
                  className="form-control form-control-sm rounded-3 ps-4 py-2"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary">Confirm</label>
              <input
                id="register-confirm-password-input"
                type="password"
                className="form-control form-control-sm rounded-3 py-2"
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Select Role (Unit-II Pull-Down Menus) */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Select Role</label>
            <select
              id="register-role-select"
              className="form-select form-select-sm rounded-3 py-2"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty Member</option>
              <option value="lab_assistant">Lab Assistant / Staff</option>
            </select>
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Campus Department</label>
            <div className="position-relative">
              <Building size={16} className="position-absolute text-muted" style={{ top: '11px', left: '12px' }} />
              <input
                type="text"
                className="form-control form-control-sm rounded-3 ps-5 py-2"
                placeholder="Information Technology"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-brand-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3 small text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
