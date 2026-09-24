import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

export default function DetectionResults({ threats, reasons }) {
  const { t } = useLanguage();

  if (!threats || threats.length === 0) {
    return <p className="detection-empty">{t('result.noThreats')}</p>;
  }

  return (
    <div className="detection-results">
      <h3>{t('result.threats')}</h3>
      <ul className="threat-list">
        {threats.map((threat, i) => (
          <li key={`${threat}-${i}`} className="threat-item">
            <span className="threat-name">{threat}</span>
          </li>
        ))}
      </ul>

      <h3>{t('result.why')}</h3>
      <ul className="reason-list">
        {reasons.map((reason, i) => (
          <li key={i}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
