import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../services/api.js';
import { AuthBrand } from '../components/Logo.jsx';
import BlobField from '../components/BlobField.jsx';
import { IconInput } from '../components/FormField.jsx';
import { IconMail, IconShield } from '../components/icons.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPasswordRequest(email.trim());
      setSent(true);
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
        <AuthBrand />

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <h1>Reset your password</h1>
            <p className="sub">Enter your account email and we'll send a reset link.</p>

            <label htmlFor="fg-email">Email</label>
            <IconInput icon={IconMail} id="fg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

            {error && <p className="field-error" role="alert">{error}</p>}

            <button type="submit" className="btn btn-block" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        ) : (
          <>
            <div className="success-ring">✓</div>
            <h1>Check your email</h1>
            <p className="sub">
              If an account exists for <strong>{email}</strong>, a reset link has been sent. It expires in 15 minutes.
            </p>
          </>
        )}

        <Link to="/login" className="back-link">← Back to login</Link>
      </div>
    </section>
  );
}
