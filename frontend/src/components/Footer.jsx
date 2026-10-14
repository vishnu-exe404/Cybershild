import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { useUserAuth } from '../services/userAuth.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  const { t } = useLanguage();
  const { isAuthenticated } = useUserAuth();

  return (
    <footer className="footer">
      <div className="footer-temples" aria-hidden="true" />
      <div className="footer-inner">
        <Logo size={44} showSlogan />
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/home">Home</Link>
          {isAuthenticated && <Link to="/console">Console</Link>}
          {isAuthenticated && <Link to="/history">History</Link>}
          <Link to="/about">About</Link>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">Report Cybercrime</a>
        </nav>
        <p className="footer-tagline">{t('motto')}</p>
      </div>
      <div className="footer-base">
        <p>{t('footer.text')}</p>
        <p className="footer-meta">
          CyberShild · Report cybercrime at{' '}
          <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a>{' '}
          or call the national helpline <strong>1930</strong>. · <Link to="/admin/login" className="admin-footer-link">Admin</Link>
        </p>
      </div>
    </footer>
  );
}
