import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordRequest } from '../services/api.js';
import { useToast } from '../services/toast.jsx';
import BlobField from '../components/BlobField.jsx';
import { PasswordInput } from '../components/FormField.jsx';
import { IconLock, IconShield } from '../components/icons.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const linkLooksValid = Boolean(email && token);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPasswordRequest(email, token, password);
      showToast('Password updated - log in with your new password.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <BlobField />
      <div className="auth-card glass-card card-in">
        <div className="brand-mini"><IconShield width={16} height={16} /> CyberShild</div>

        {!linkLooksValid ? (
          <>
            <h1>Invalid reset link</h1>
            <p className="sub">This link is missing its email or token. Request a new one.</p>
            <Link to="/forgot-password" className="btn btn-block" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              Request a new link
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1>Set a new password</h1>
            <p className="sub">Resetting the password for {email}.</p>

            <label htmlFor="rp-password">New password</label>
            <PasswordInput icon={IconLock} id="rp-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />

            <label htmlFor="rp-confirm">Confirm password</label>
            <PasswordInput icon={IconLock} id="rp-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />

            {error && <p className="field-error" role="alert">{error}</p>}

            <button type="submit" className="btn btn-block" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        <Link to="/login" className="back-link">← Back to login</Link>
      </div>
    </section>
  );
}
