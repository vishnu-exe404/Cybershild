import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../services/adminAuth.jsx';
import { useToast } from '../services/toast.jsx';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter the admin username and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      showToast('Admin session started.', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page fade-in">
      <form className="auth-card glass-card admin-login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <p className="muted">Restricted area - separate from regular user accounts.</p>

        <label htmlFor="a-username">Admin username</label>
        <input id="a-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />

        <label htmlFor="a-password">Password</label>
        <input
          id="a-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="field-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
}
