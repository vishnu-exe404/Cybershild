import React from 'react';
import { useLanguage } from '../services/i18n.jsx';
import RiskBadge from './RiskBadge.jsx';

function colorForScore(score) {
  if (score >= 60) return '#dc2626';
  if (score >= 25) return '#d97706';
  return '#16a34a';
}

export default function RiskScore({ score, level }) {
  const { t } = useLanguage();
  const color = colorForScore(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="risk-score">
      <svg width="140" height="140" viewBox="0 0 120 120" role="img" aria-label={`${t('result.riskScore')}: ${score}`}>
        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="56" textAnchor="middle" fontSize="28" fontWeight="700" fill="#111827">
          {score}
        </text>
        <text x="60" y="76" textAnchor="middle" fontSize="11" fill="#6b7280">
          / 100
        </text>
      </svg>
      <div className="risk-score-meta">
        <p className="risk-score-label">{t('result.riskLevel')}</p>
        <RiskBadge level={level} />
      </div>
    </div>
  );
}
