import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <p>{t('footer.text')}</p>
      <p className="footer-meta">
        Cyber Security Awareness Platform · Report cybercrime at{' '}
        <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">
          cybercrime.gov.in
        </a>{' '}
        or call the national helpline <strong>1930</strong>.
      </p>
    </footer>
  );
}
