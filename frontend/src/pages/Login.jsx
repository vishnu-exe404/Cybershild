import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../services/userAuth.jsx';
import { useToast } from '../services/toast.jsx';

export default function Login() {
  const { login } = useUserAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your email/username and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      showToast('Welcome back!', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page fade-in">
      <form className="auth-card glass-card" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <p className="muted">Access your saved check history.</p>

        <label htmlFor="identifier">Email or username</label>
        <input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="field-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
