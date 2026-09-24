import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { useAuth } from '../services/auth.jsx';
import LanguageSelector from './LanguageSelector.jsx';

export default function Header() {
  const { t } = useLanguage();
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
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
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {t('nav.about')}
          </NavLink>
          {isAuthenticated ? (
            <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>
              {t('nav.logout')} ({username})
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {t('nav.login')}
            </NavLink>
          )}
        </nav>

        <LanguageSelector />
      </div>
    </header>
  );
}
