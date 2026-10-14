import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

/** CyberShild brand lockup: shield + padlock + lotus mark, wordmark, optional Devanagari slogan. */
export default function Logo({ size = 40, showSlogan = false, showWordmark = true, name = 'CyberShild', className = '' }) {
  const { t } = useLanguage();
  return (
    <span className={`logo-lockup ${className}`}>
      <img src="/logo/cybershild-mark.svg" alt="" width={size} height={Math.round(size * 1.1)} className="logo-mark" aria-hidden="true" />
      {showWordmark && (
        <span className="logo-text">
          <span className="logo-wordmark">{name}</span>
          {showSlogan && <span className="logo-slogan" >{t('slogan')}</span>}
        </span>
      )}
    </span>
  );
}

/** Auth-card header: large logo, wordmark and slogan, centred. */
export function AuthBrand({ label }) {
  const { t } = useLanguage();
  return (
    <div className="auth-brand">
      <img src="/logo/cybershild-mark.svg" alt="" width="64" height="70" className="logo-mark logo-glow" aria-hidden="true" />
      <div className="auth-brand-name">{label || 'CyberShild'}</div>
      <div className="auth-brand-slogan">{t('slogan')}</div>
    </div>
  );
}

/** Gold ornamental divider with a saffron diamond. */
export function OrnamentDivider() {
  return <div className="ornament-divider" aria-hidden="true"><span /></div>;
}
