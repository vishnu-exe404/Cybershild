import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

const LEVEL_CLASS = {
  SAFE: 'risk-badge risk-badge--safe',
  CAUTION: 'risk-badge risk-badge--caution',
  HIGH_RISK: 'risk-badge risk-badge--high',
};

const LEVEL_ICON = {
  SAFE: '✅',
  CAUTION: '⚠️',
  HIGH_RISK: '🚨',
};

export default function RiskBadge({ level }) {
  const { t } = useLanguage();
  const cls = LEVEL_CLASS[level] || LEVEL_CLASS.CAUTION;

  return (
    <span className={cls}>
      <span aria-hidden="true">{LEVEL_ICON[level] || '⚠️'}</span>
      {t(`result.level.${level}`)}
    </span>
  );
}
