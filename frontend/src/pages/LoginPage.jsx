// frontend/src/pages/LoginPage.jsx
// Implements Module 1: User Authentication (Image 3 Screen 1)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Share2, Mail, Lock, LogIn, AlertCircle, 
  CheckCircle, Eye, EyeOff, Shield 
} from 'lucide-react';

export default function LoginPage() {
  const { login, quickLoginDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    quickLoginDemo(demoEmail, demoPass);
    navigate('/');
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
      <div className="card-modern p-4 p-sm-5 shadow-lg" style={{ maxWidth: '440px', width: '100%', borderRadius: '20px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="brand-badge mb-2 d-inline-flex p-3 rounded-circle shadow">
            <Share2 size={28} className="text-white" />
          </div>
          <h3 className="fw-bold text-dark mb-1 brand-font">ShareSphere</h3>
          <h5 className="fw-bold text-primary mb-1">Welcome Back!</h5>
          <p className="text-muted small">Login to your account to continue</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Controls (Unit-II DOM Form Controls) */}
        <form onSubmit={handleSubmit} id="login-form">
          {/* Email Text Control */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email address</label>
            <div className="position-relative">
              <Mail size={16} className="position-absolute text-muted" style={{ top: '11px', left: '12px' }} />
              <input
                id="login-email-input"
                type="email"
                className="form-control form-control-sm rounded-3 ps-5 py-2"
                placeholder="name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Control with Show/Hide toggle */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="position-relative">
              <Lock size={16} className="position-absolute text-muted" style={{ top: '11px', left: '12px' }} />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-control form-control-sm rounded-3 ps-5 pe-5 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-0 text-muted p-2"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Unit-II Checkboxes: Remember me */}
          <div className="d-flex align-items-center justify-content-between mb-4 small">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label text-secondary" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is password123 for all users, admin123 for admin.'); }} className="text-primary text-decoration-none small">
              Forgot password?
            </a>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-brand-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <>
                <LogIn size={18} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3 small text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Register
          </Link>
        </div>

        {/* Quick Demo Logins for Examiner / User Presentation */}
        <div className="mt-4 pt-3 border-top text-center">
          <div className="small fw-semibold text-secondary mb-2" style={{ fontSize: '0.75rem' }}>
            DEMO QUICK LOGIN (1-CLICK):
          </div>
          <div className="d-flex gap-1 justify-content-center flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickLogin('alex@example.com', 'password123')}
              className="btn btn-sm btn-outline-primary py-1 px-2"
              style={{ fontSize: '0.75rem' }}
            >
              Student (Alex)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('john@example.com', 'password123')}
              className="btn btn-sm btn-outline-success py-1 px-2"
              style={{ fontSize: '0.75rem' }}
            >
              Faculty (John)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@sharesphere.edu', 'admin123')}
              className="btn btn-sm btn-outline-danger py-1 px-2"
              style={{ fontSize: '0.75rem' }}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
