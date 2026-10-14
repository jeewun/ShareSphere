import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { 
  Mail, Lock, LogIn, AlertCircle, 
  Eye, EyeOff 
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
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
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
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
          <h6 className="fw-bold text-dark mb-1">Welcome Back!</h6>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small mb-3 border-danger border-opacity-25">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span style={{ fontSize: '0.82rem' }}>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} id="login-form">
          {/* Email Address */}
          <div className="mb-2.5">
            <label className="form-label small fw-semibold text-secondary mb-1">Email Address</label>
            <div className="position-relative">
              <Mail size={15} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
              <input
                id="login-email-input"
                type="email"
                className="form-control form-control-sm rounded-3 ps-5 py-2"
                placeholder="name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2.5 mt-2">
            <label className="form-label small fw-semibold text-secondary mb-1">Password</label>
            <div className="position-relative">
              <Lock size={15} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-control form-control-sm rounded-3 ps-5 pe-5 py-2"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

          {/* Remember Me */}
          <div className="form-check mt-3 mb-3 d-flex align-items-center gap-2">
            <input
              className="form-check-input mt-0"
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label className="form-check-label text-secondary small user-select-none" htmlFor="rememberMe" style={{ cursor: 'pointer' }}>
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-brand-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow mt-3"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center mt-3 small text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-dark fw-bold text-decoration-none">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
