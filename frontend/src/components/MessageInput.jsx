import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

export default function MessageInput({ value, onChange, error }) {
  const { t } = useLanguage();

  return (
    <div className="message-input">
      <label htmlFor="message-textarea" className="message-input-label">
        {t('input.label')}
      </label>
      <textarea
        id="message-textarea"
        className="message-input-textarea"
        placeholder={t('input.placeholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        maxLength={5000}
      />
      <div className="message-input-meta">
        <span>{value.length}/5000</span>
      </div>
      {error && (
        <p role="alert" className="message-input-error">
          {error}
        </p>
      )}
    </div>
  );
}
