import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { useUserAuth } from '../services/userAuth.jsx';

/**
 * First page: a single animated CyberShild logo. After ~2.5s (or on click/skip)
 * it opens the Login page, or the Console dashboard if the user is already signed in.
 */
export default function Splash() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, loading } = useUserAuth();
  const target = isAuthenticated ? '/console' : '/login';

  useEffect(() => {
    if (loading) return undefined;
    const id = setTimeout(() => navigate(target, { replace: true }), 2500);
    return () => clearTimeout(id);
  }, [loading, target, navigate]);

  return (
    <section className="splash" onClick={() => !loading && navigate(target, { replace: true })}>
      <span className="splash-mandala" aria-hidden="true" />
      <div className="splash-center">
        <img src="/logo/cybershild-mark.svg" alt="CyberShild" className="splash-logo logo-glow" width="170" height="187" />
        <h1 className="splash-name">CyberShild</h1>
        <p className="splash-motto">{t('motto')}</p>
        <p className="splash-slogan">{t('slogan')}</p>
        <div className="splash-bar" aria-hidden="true"><span /></div>
        <button type="button" className="btn-ghost splash-skip" onClick={(e) => { e.stopPropagation(); navigate(target, { replace: true }); }}>
          Continue
        </button>
      </div>
      <div className="splash-temples" aria-hidden="true" />
    </section>
  );
}
