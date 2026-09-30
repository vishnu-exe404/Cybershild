import React, { useState } from 'react';
import { analyzePassword } from '../../utils/passwordStrength.js';
import { PasswordInput } from '../FormField.jsx';
import { IconLock } from '../icons.jsx';

const LEVEL_BADGE = { high: 'badge-high', caution: 'badge-caution', safe: 'badge-safe', none: 'badge-caution' };

export default function PasswordVault() {
  const [pwd, setPwd] = useState('');
  const result = analyzePassword(pwd);
  const checkList = [
    ['len', 'At least 12 characters'],
    ['upper', 'Contains uppercase (A-Z)'],
    ['lower', 'Contains lowercase (a-z)'],
    ['num', 'Contains a number (0-9)'],
    ['sym', 'Contains a symbol (!@#$...)'],
  ];

  return (
    <div className="card glass-card">
      <h3 style={{ marginTop: 0 }}>Password Strength Vault</h3>
      <p className="muted">Checked entirely in your browser - never sent anywhere.</p>

      <PasswordInput icon={IconLock} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Type a password to test" autoComplete="off" />

      {pwd && (
        <div className="vault-result fade-in">
          <div className="vault-meter">
            <div className={`vault-meter-fill vault-${result.level}`} style={{ width: `${Math.min(100, result.entropy)}%` }} />
          </div>
          <div className="vault-summary">
            <span className={`badge ${LEVEL_BADGE[result.level]}`}>{result.label}</span>
            <span className="muted">Estimated crack time: <strong>{result.crackTime}</strong></span>
          </div>
          <ul className="vault-checklist">
            {checkList.map(([key, label]) => (
              <li key={key} className={result.checks[key] ? 'vault-check-pass' : 'vault-check-fail'}>
                {result.checks[key] ? '✓' : '✕'} {label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
