import React from 'react';
import { useLanguage } from '../services/i18n.jsx';
import RiskBadge from './RiskBadge.jsx';

function colorVar(score) {
  if (score >= 60) return 'var(--high)';
  if (score >= 25) return 'var(--caution)';
  return 'var(--safe)';
}

export default function RiskScore({ score, level }) {
  const { t } = useLanguage();
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = colorVar(score);

  return (
    <div className="risk-score">
      <svg width="140" height="140" viewBox="0 0 120 120" role="img" aria-label={`${t('result.riskScore')}: ${score}`}>
        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" style={{ stroke: 'var(--border)' }} />
        <circle
          className="risk-ring"
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform="rotate(-90 60 60)"
          style={{ stroke: color, '--circ': circumference, '--offset': offset, filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="60" y="58" textAnchor="middle" fontSize="28" fontWeight="700" style={{ fill: 'var(--text)', fontFamily: 'var(--font-display)' }}>
          {score}
        </text>
        <text x="60" y="76" textAnchor="middle" fontSize="11" style={{ fill: 'var(--muted)' }}>
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
