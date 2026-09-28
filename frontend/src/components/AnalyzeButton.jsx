import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

export default function AnalyzeButton({ onClick, loading, disabled }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="btn analyze-button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="spinner" />}
      {loading ? t('input.analyzing') : t('input.analyze')}
    </button>
  );
}
