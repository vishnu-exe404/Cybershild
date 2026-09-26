import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { useUserAuth } from '../services/userAuth.jsx';
import { useToast } from '../services/toast.jsx';
import LanguageSelector from './LanguageSelector.jsx';

export default function Header() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useUserAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    showToast('Logged out.', 'info');
    navigate('/');
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <span className="brand-shield" aria-hidden="true">🛡️</span>
          <span className="brand-name">{t('appName')}</span>
        </Link>

        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.home')}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              History
            </NavLink>
          )}
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.about')}
          </NavLink>

          {isAuthenticated ? (
            <>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Log in
              </NavLink>
              <NavLink to="/register" className="nav-link nav-link--cta">
                Sign up
              </NavLink>
            </>
          )}
        </nav>

        <LanguageSelector />
      </div>
    </header>
  );
}
