import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../services/userAuth.jsx';
import { useToast } from '../services/toast.jsx';
import BlobField from '../components/BlobField.jsx';
import { IconInput, PasswordInput } from '../components/FormField.jsx';
import { IconMail, IconLock, IconUser, IconShield } from '../components/icons.jsx';

export default function Register() {
  const { register } = useUserAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form);
      showToast('Account created - welcome!', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
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
        <h1>Create your account</h1>
        <p className="sub">Save your check history and unlock your dashboard.</p>

        <label htmlFor="name">Full name</label>
        <IconInput icon={IconUser} id="name" value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" invalid={Boolean(fieldErrors.name)} />
        {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}

        <label htmlFor="email">Email</label>
        <IconInput icon={IconMail} id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" invalid={Boolean(fieldErrors.email)} />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

        <label htmlFor="username">Username</label>
        <IconInput icon={IconUser} id="username" value={form.username} onChange={(e) => update('username', e.target.value)} autoComplete="username" invalid={Boolean(fieldErrors.username)} />
        {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}

        <label htmlFor="password">Password</label>
        <PasswordInput
          icon={IconLock}
          id="password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          autoComplete="new-password"
          invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        {!fieldErrors.password && <p className="field-hint">At least 8 characters.</p>}

        {error && <p className="field-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
