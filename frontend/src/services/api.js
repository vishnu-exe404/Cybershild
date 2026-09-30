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
export const loginRequest = (identifier, password, rememberMe = false) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password, rememberMe }) });
export const logoutRequest = () => request('/auth/logout', { method: 'POST' });
export const meRequest = () => request('/auth/me');
export const updateProfileRequest = (payload) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) });
export const changePasswordRequest = (currentPassword, newPassword) =>
  request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
export const completeOnboardingRequest = () => request('/auth/onboarding/complete', { method: 'POST' });
export const forgotPasswordRequest = (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPasswordRequest = (email, token, newPassword) =>
  request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, token, newPassword }) });

// --- User history ---
export const getMyHistory = () => request('/history');
export const deleteHistoryItemRequest = (id) => request(`/history/${id}`, { method: 'DELETE' });
export const clearHistoryRequest = () => request('/history', { method: 'DELETE' });

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
export const createUserRequest = (payload) => request('/admin/users', { method: 'POST', body: JSON.stringify(payload) });
export const updateUserRequest = (id, payload) =>
  request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteUserRequest = (id) => request(`/admin/users/${id}`, { method: 'DELETE' });

// --- Multi-mode analysis (text / url / upi), console suite ---
export const analyzeMode = (text, mode) => request('/analyze', { method: 'POST', body: JSON.stringify({ text, mode }) });

// --- Quiz ---
export const getQuizQuestions = () => request('/quiz/questions');
export const submitQuiz = (answers) => request('/quiz/submit', { method: 'POST', body: JSON.stringify({ answers }) });

// --- Public real-data feed/stats (no auth required) ---
export const getPublicFeed = () => request('/public/feed');
export const getPublicStats = () => request('/public/stats');

export const checkHealth = () => request('/health');
