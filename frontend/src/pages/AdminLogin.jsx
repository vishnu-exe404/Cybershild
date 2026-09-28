import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../services/adminAuth.jsx';
import { useToast } from '../services/toast.jsx';
import BlobField from '../components/BlobField.jsx';
import { IconInput, PasswordInput } from '../components/FormField.jsx';
import { IconUser, IconLock, IconShield } from '../components/icons.jsx';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter the admin username and password.');
      setShake(true);
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
      setShake(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <BlobField />
      <form className={`auth-card glass-card card-in admin-login-card ${shake ? 'shake' : ''}`} onSubmit={handleSubmit} onAnimationEnd={() => setShake(false)}>
        <div className="brand-mini"><IconShield width={16} height={16} /> CyberShild Admin</div>
        <h1>Admin login</h1>
        <p className="sub">Restricted area - separate from regular user accounts.</p>

        <label htmlFor="a-username">Admin username</label>
        <IconInput icon={IconUser} id="a-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />

        <label htmlFor="a-password">Password</label>
        <PasswordInput icon={IconLock} id="a-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

        {error && <p className="field-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
}
