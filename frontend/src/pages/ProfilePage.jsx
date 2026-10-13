// frontend/src/pages/ProfilePage.jsx
// Implements Module 1: User Profiles & Password Management (Image 3 Screen 1)
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, Mail, Building, Phone, KeyRound, 
  CheckCircle, AlertCircle, Edit3, Shield 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Alex Carter',
    department: user?.department || 'Information Technology',
    phone: user?.phone || '+91 98765 43210',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.auth.updateProfile(profileData);
      if (res.success) {
        updateUser(res.user);
        setIsEditing(false);
        setProfileMsg('Profile updated successfully!');
        setTimeout(() => setProfileMsg(null), 3500);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordErr('New passwords do not match');
      return;
    }

    try {
      const res = await api.auth.changePassword(passwordData);
      if (res.success) {
        setPasswordMsg('Password changed successfully!');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => setPasswordMsg(null), 3500);
      }
    } catch (err) {
      setPasswordErr(err.message || 'Failed to change password');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">My Profile</h2>
        <p className="text-muted small mb-0">
          Manage your campus student/staff credentials, department affiliation, and security settings.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Avatar & Overview (Image 3 Screen 1) */}
        <div className="col-lg-4">
          <div className="card-clean p-4 text-center">
            <div className="position-relative d-inline-block mb-3">
              <img
                src={profileData.avatar}
                alt={user?.name || 'User'}
                className="rounded-circle border border-4 border-light shadow"
                style={{ width: '130px', height: '130px', objectFit: 'cover' }}
              />
              <span className="position-absolute bottom-0 end-0 badge bg-primary rounded-circle p-2 border border-2 border-white shadow">
                <Shield size={14} />
              </span>
            </div>

            <h4 className="fw-bold text-dark mb-1">{user?.name || 'Alex Carter'}</h4>
            <div className="text-muted small mb-2">{user?.email || 'alex@example.com'}</div>

            <div className="d-inline-flex gap-2 mb-3">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 text-capitalize">
                {user?.role || 'Student'}
              </span>
              <span className="badge bg-secondary bg-opacity-10 text-secondary border px-3 py-1">
                Member Since Aug 2025
              </span>
            </div>

            <div className="pt-3 border-top mt-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setIsEditing(!isEditing)}
                id="edit-profile-toggle-btn"
              >
                <Edit3 size={15} />
                <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Info & Change Password Forms */}
        <div className="col-lg-8">
          {/* Profile Information Card */}
          <div className="card-clean p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Profile Information</h5>

            {profileMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3 small">
                <CheckCircle size={16} />
                <span>{profileMsg}</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Department</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Avatar Photo URL</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 text-end">
                  <button type="submit" className="btn btn-primary btn-sm px-4">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="text-muted small">Full Name</div>
                  <div className="fw-semibold text-dark">{user?.name}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Email Address</div>
                  <div className="fw-semibold text-dark">{user?.email}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Academic Role</div>
                  <div className="fw-semibold text-dark text-capitalize">{user?.role}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Department</div>
                  <div className="fw-semibold text-dark">{user?.department}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Contact Phone</div>
                  <div className="fw-semibold text-dark">{user?.phone || '+91 98765 43210'}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Campus System ID</div>
                  <div className="fw-semibold text-dark">SHP-REC-{user?.user_id || 101}</div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="card-clean p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <KeyRound size={18} className="text-primary" />
              <span>Change Password</span>
            </h5>

            {passwordMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3 small">
                <CheckCircle size={16} />
                <span>{passwordMsg}</span>
              </div>
            )}
            {passwordErr && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3 small">
                <AlertCircle size={16} />
                <span>{passwordErr}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              {/* Unit-II fieldset & legend elements */}
              <fieldset className="border p-3 rounded-3 mb-3">
                <legend className="float-none w-auto px-2 small fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>
                  Security Credentials
                </legend>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Current Password</label>
                    <input
                      id="current-password-input"
                      type="password"
                      className="form-control form-control-sm rounded-3"
                      placeholder="••••••••"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">New Password</label>
                    <input
                      id="new-password-input"
                      type="password"
                      className="form-control form-control-sm rounded-3"
                      placeholder="••••••••"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                    <input
                      id="confirm-password-input"
                      type="password"
                      className="form-control form-control-sm rounded-3"
                      placeholder="••••••••"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <div className="text-end">
                <button
                  type="submit"
                  id="update-password-btn"
                  className="btn btn-brand-primary btn-sm px-4 fw-semibold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
