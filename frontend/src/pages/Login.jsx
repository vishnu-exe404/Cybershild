import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../services/userAuth.jsx';
import { useToast } from '../services/toast.jsx';
import BlobField from '../components/BlobField.jsx';
import { IconInput, PasswordInput } from '../components/FormField.jsx';
import { IconMail, IconLock, IconShield } from '../components/icons.jsx';

export default function Login() {
  const { login } = useUserAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your email/username and password.');
      setShake(true);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(identifier.trim(), password, rememberMe);
      showToast('Welcome back!', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setShake(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <BlobField />
      <form className={`auth-card glass-card card-in ${shake ? 'shake' : ''}`} onSubmit={handleSubmit} onAnimationEnd={() => setShake(false)}>
        <div className="brand-mini"><IconShield width={16} height={16} /> CyberShild</div>
        <h1>Welcome back</h1>
        <p className="sub">Log in to access your saved check history.</p>

        <label htmlFor="identifier">Email or username</label>
        <IconInput icon={IconMail} id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />

        <label htmlFor="password">Password</label>
        <PasswordInput
          icon={IconLock}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="remember-row">
          <label className="check-label">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Remember me
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className="field-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
