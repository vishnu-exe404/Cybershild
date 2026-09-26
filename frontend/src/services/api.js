const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include', // send/receive the httpOnly session cookie
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.fieldErrors = data.fieldErrors;
    err.status = res.status;
    throw err;
  }
  return data;
}

// --- Risk analysis ---
export const analyzeMessage = (text) => request('/analyze', { method: 'POST', body: JSON.stringify({ text }) });

// --- User auth ---
export const registerRequest = (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
export const loginRequest = (identifier, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
export const logoutRequest = () => request('/auth/logout', { method: 'POST' });
export const meRequest = () => request('/auth/me');
export const completeOnboardingRequest = () => request('/auth/onboarding/complete', { method: 'POST' });

// --- User history ---
export const getMyHistory = () => request('/history');

// --- Admin auth ---
export const adminLoginRequest = (username, password) =>
  request('/admin/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
export const adminLogoutRequest = () => request('/admin/auth/logout', { method: 'POST' });
export const adminMeRequest = () => request('/admin/auth/me');

// --- Admin: user management + stats ---
export const getAdminStats = () => request('/admin/stats');
export const listUsersRequest = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/admin/users${qs ? `?${qs}` : ''}`);
};
export const updateUserRequest = (id, payload) =>
  request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteUserRequest = (id) => request(`/admin/users/${id}`, { method: 'DELETE' });

export const checkHealth = () => request('/health');
