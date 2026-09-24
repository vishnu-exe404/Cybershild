import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

export default function ActionGuidance({ recommendations, riskLevel }) {
  const { t } = useLanguage();

  return (
    <div className="action-guidance">
      <h3>{t('result.whatToDo')}</h3>
      <ul className="recommendation-list">
        {recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>

      <div className="action-chips" role="group" aria-label={t('result.whatToDo')}>
        <span className="action-chip">🚫 {t('action.doNotClick')}</span>
        <span className="action-chip">🔒 {t('action.doNotShareOtp')}</span>
        <span className="action-chip">🔎 {t('action.verify')}</span>
        {riskLevel !== 'SAFE' && <span className="action-chip">🚷 {t('action.block')}</span>}
      </div>

      <div className="helpline-box">
        <h4>{t('action.helpline')}</h4>
        <ul>
          <li>
            National Cyber Crime Reporting Portal:{' '}
            <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">
              cybercrime.gov.in
            </a>
          </li>
          <li>National Cybercrime Helpline: <strong>1930</strong></li>
        </ul>
      </div>
    </div>
  );
}
