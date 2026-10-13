// frontend/src/services/api.js - HTTP communication layer for PHP REST API
const API_BASE = 'http://127.0.0.1:8080/api';

function getAuthHeader() {
  const token = localStorage.getItem('sharesphere_token');
  return token ? { 'Authorization': token } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Authentication & Profile (Module 1)
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth.php?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth.php?action=me`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    updateProfile: async (profileData) => {
      const res = await fetch(`${API_BASE}/auth.php?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(profileData)
      });
      return handleResponse(res);
    },
    changePassword: async (passData) => {
      const res = await fetch(`${API_BASE}/auth.php?action=change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(passData)
      });
      return handleResponse(res);
    },
    getUsers: async () => {
      const res = await fetch(`${API_BASE}/auth.php?action=users`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Resource Listing & Discovery (Module 2)
  resources: {
    list: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.location) params.append('location', filters.location);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.owner_id) params.append('owner_id', filters.owner_id);

      const res = await fetch(`${API_BASE}/resources.php?${params.toString()}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/resources.php?id=${id}`);
      return handleResponse(res);
    },
    getOverviewStats: async () => {
      const res = await fetch(`${API_BASE}/resources.php?action=overview_stats`);
      return handleResponse(res);
    },
    getAlternatives: async (resourceId, startDate, endDate) => {
      const res = await fetch(`${API_BASE}/resources.php?action=alternatives&resource_id=${resourceId}&start_date=${startDate}&end_date=${endDate}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/resources.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/resources.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/resources.php?id=${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Categories
  categories: {
    list: async () => {
      const res = await fetch(`${API_BASE}/categories.php`);
      return handleResponse(res);
    }
  },

  // Reservations & Conflict Management (Module 3 & 4)
  reservations: {
    checkConflict: async (resourceId, startDate, endDate) => {
      const res = await fetch(`${API_BASE}/reservations.php?action=check_conflict&resource_id=${resourceId}&start_date=${startDate}&end_date=${endDate}`);
      return handleResponse(res);
    },
    getCalendarSlots: async (resourceId) => {
      const res = await fetch(`${API_BASE}/reservations.php?action=calendar&resource_id=${resourceId}`);
      return handleResponse(res);
    },
    create: async (bookingData) => {
      const res = await fetch(`${API_BASE}/reservations.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(bookingData)
      });
      return handleResponse(res);
    },
    list: async (type = 'my_bookings', status = 'all') => {
      const res = await fetch(`${API_BASE}/reservations.php?type=${type}&status=${status}`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    updateStatus: async (reservationId, status, decisionNotes = '') => {
      const res = await fetch(`${API_BASE}/reservations.php?id=${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, decision_notes: decisionNotes })
      });
      return handleResponse(res);
    }
  },

  // Notifications (Module 4)
  notifications: {
    list: async () => {
      const res = await fetch(`${API_BASE}/notifications.php`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    markAllRead: async () => {
      const res = await fetch(`${API_BASE}/notifications.php?action=mark_all_read`, {
        method: 'PUT',
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    },
    markRead: async (id) => {
      const res = await fetch(`${API_BASE}/notifications.php?action=mark_read&id=${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // Analytics & Dashboard (Module 5)
  analytics: {
    get: async () => {
      const res = await fetch(`${API_BASE}/analytics.php`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse(res);
    }
  },

  // File Upload
  upload: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload.php`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  }
};
