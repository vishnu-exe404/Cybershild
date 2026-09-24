import React from 'react';
import { useLanguage, LOCALES } from '../services/i18n.jsx';

export default function LanguageSelector() {
  const { lang, setLang, t } = useLanguage();

  return (
    <label className="lang-selector">
      <span className="sr-only">{t('language.label')}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('language.label')}>
        {Object.entries(LOCALES).map(([code, { label }]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
