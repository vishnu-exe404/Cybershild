const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

/**
 * Sends the pasted text to the backend risk engine.
 * @param {string} text
 */
export async function analyzeMessage(text) {
  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse(res);
}

/** Logs in and returns { token, username }. */
export async function loginRequest(username, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

/** Fetches aggregated analytics for the dashboard. Requires a login token. */
export async function getAnalytics(token) {
  const res = await fetch(`${API_BASE_URL}/analytics`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handleResponse(res);
}

/** Simple backend health check. */
export async function checkHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(res);
}
