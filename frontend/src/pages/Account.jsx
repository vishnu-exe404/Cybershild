import React, { useState } from 'react';
import { useUserAuth } from '../services/userAuth.jsx';
import { useToast } from '../services/toast.jsx';
import { changePasswordRequest } from '../services/api.js';
import { IconInput, PasswordInput } from '../components/FormField.jsx';
import { IconUser, IconMail, IconLock } from '../components/icons.jsx';

export default function Account() {
  const { user, updateProfile } = useUserAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState({ name: user.name, email: user.email, username: user.username });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileError('');
    setProfileErrors({});
    setSavingProfile(true);
    try {
      await updateProfile(profile);
      showToast('Profile updated.', 'success');
    } catch (err) {
      setProfileError(err.message);
      if (err.fieldErrors) setProfileErrors(err.fieldErrors);
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwError('');
    setSavingPw(true);
    try {
      await changePasswordRequest(pw.current, pw.next);
      showToast('Password changed.', 'success');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <section className="fade-in">
      <h1>Your account</h1>
      <p className="muted" style={{ marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
        Member since {new Date(user.createdAt).toLocaleDateString()}
      </p>

      <div className="two-col">
        <form className="card glass-card" onSubmit={saveProfile}>
          <h3 style={{ marginTop: 0 }}>Profile</h3>
          <label htmlFor="ac-name">Full name</label>
          <IconInput icon={IconUser} id="ac-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} invalid={Boolean(profileErrors.name)} />
          {profileErrors.name && <p className="field-error">{profileErrors.name}</p>}

          <label htmlFor="ac-email">Email</label>
          <IconInput icon={IconMail} id="ac-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} invalid={Boolean(profileErrors.email)} />
          {profileErrors.email && <p className="field-error">{profileErrors.email}</p>}

          <label htmlFor="ac-username">Username</label>
          <IconInput icon={IconUser} id="ac-username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} invalid={Boolean(profileErrors.username)} />
          {profileErrors.username && <p className="field-error">{profileErrors.username}</p>}

          {profileError && !Object.keys(profileErrors).length && <p className="field-error" role="alert">{profileError}</p>}
          <button type="submit" className="btn" style={{ marginTop: '1rem' }} disabled={savingProfile}>
            {savingProfile && <span className="spinner" />}
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <form className="card glass-card" onSubmit={savePassword}>
          <h3 style={{ marginTop: 0 }}>Change password</h3>
          <label htmlFor="ac-cur">Current password</label>
          <PasswordInput icon={IconLock} id="ac-cur" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          <label htmlFor="ac-new">New password</label>
          <PasswordInput icon={IconLock} id="ac-new" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          <label htmlFor="ac-conf">Confirm new password</label>
          <PasswordInput icon={IconLock} id="ac-conf" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          {pwError && <p className="field-error" role="alert">{pwError}</p>}
          <button type="submit" className="btn" style={{ marginTop: '1rem' }} disabled={savingPw || !pw.current || !pw.next}>
            {savingPw && <span className="spinner" />}
            {savingPw ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </section>
  );
}
