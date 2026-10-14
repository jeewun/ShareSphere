// frontend/src/pages/RegisterPage.jsx - Compact & Professional Sign Up Page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { 
  User, Mail, Lock, UserPlus, AlertCircle, 
  CheckCircle, Eye, EyeOff 
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'General'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundImage: 'linear-gradient(rgba(18, 18, 20, 0.90), rgba(10, 10, 12, 0.95)), url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div 
        className="card-modern p-4 shadow-lg" 
        style={{ maxWidth: '400px', width: '100%', borderRadius: '16px' }}
      >
        {/* Brand Header */}
        <div className="text-center mb-3">
          <div className="mb-2">
            <BrandLogo variant="light" height={52} to="/" alt="Sphere" />
          </div>
          <h6 className="fw-bold text-dark mb-1">Create Your Account</h6>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
            Start discovering and sharing campus resources
          </p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3 border-danger border-opacity-25">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span style={{ fontSize: '0.82rem' }}>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-3 border-success border-opacity-25">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span style={{ fontSize: '0.82rem' }}>Account created! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="register-form">
          {/* Full Name */}
          <div className="mb-2.5">
            <label className="form-label small fw-semibold text-secondary mb-1">Full Name</label>
            <div className="position-relative">
              <User size={15} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
              <input
                id="register-name-input"
                type="text"
                className="form-control form-control-sm rounded-3 ps-5 py-2"
                placeholder="e.g. Rakesh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-2.5 mt-2">
            <label className="form-label small fw-semibold text-secondary mb-1">Email Address</label>
            <div className="position-relative">
              <Mail size={15} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
              <input
                id="register-email-input"
                type="email"
                className="form-control form-control-sm rounded-3 ps-5 py-2"
                placeholder="name@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password (Single field with eye toggle, clean placeholder) */}
          <div className="mb-3 mt-2">
            <label className="form-label small fw-semibold text-secondary mb-1">Password</label>
            <div className="position-relative">
              <Lock size={15} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-control form-control-sm rounded-3 ps-5 pe-5 py-2"
                placeholder="Enter password (min. 6 chars)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-0 text-muted p-2"
                style={{ textDecoration: 'none' }}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-brand-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow mt-3"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3 small text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-dark fw-bold text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
