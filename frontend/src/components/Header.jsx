import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { useUserAuth } from '../services/userAuth.jsx';
import { useToast } from '../services/toast.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import StatusPill from './StatusPill.jsx';
import { IconMenu, IconClose } from './icons.jsx';
import Logo from './Logo.jsx';

export default function Header() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useUserAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    showToast('Logged out.', 'info');
    setMobileOpen(false);
    navigate('/login');
  }

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  const navLinks = (
    <>
      <NavLink to="/home" end className={linkClass} onClick={() => setMobileOpen(false)}>{t('nav.home')}</NavLink>
      {isAuthenticated && (
        <>
          <NavLink to="/console" className={linkClass} onClick={() => setMobileOpen(false)}>Console</NavLink>
          <NavLink to="/history" className={linkClass} onClick={() => setMobileOpen(false)}>History</NavLink>
          <NavLink to="/account" className={linkClass} onClick={() => setMobileOpen(false)}>Account</NavLink>
        </>
      )}
      <NavLink to="/about" className={linkClass} onClick={() => setMobileOpen(false)}>{t('nav.about')}</NavLink>
      {isAuthenticated ? (
        <>
          <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
          <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>Log out</button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={linkClass} onClick={() => setMobileOpen(false)}>Log in</NavLink>
          <NavLink to="/register" className="nav-link nav-link--cta" onClick={() => setMobileOpen(false)}>Sign up</NavLink>
        </>
      )}
    </>
  );

  return (
    <header className="header">
      <div className="header-inner">
        <Link to={isAuthenticated ? '/console' : '/login'} className="brand" aria-label="CyberShild home">
          <Logo size={34} />
        </Link>

        <nav className="nav" aria-label="Main navigation">{navLinks}</nav>

        <div className="header-right">
          <StatusPill />
          <LanguageSelector />
          <ThemeToggle />
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <IconMenu />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav-panel">
          <div className="mobile-nav-close">
            <button type="button" className="mobile-nav-toggle" aria-label="Close menu" onClick={() => setMobileOpen(false)} style={{ display: 'flex' }}>
              <IconClose />
            </button>
          </div>
          <nav className="nav" aria-label="Mobile navigation">{navLinks}</nav>
        </div>
      )}
    </header>
  );
}
