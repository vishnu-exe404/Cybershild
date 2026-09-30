import React, { useState } from 'react';
import { analyzeMode } from '../../services/api.js';
import RiskScore from '../RiskScore.jsx';
import DetectionResults from '../DetectionResults.jsx';
import ActionGuidance from '../ActionGuidance.jsx';

const MODES = [
  { key: 'text', label: 'Message / SMS', placeholder: 'e.g. "Your electricity will be disconnected tonight at 9:30 PM. Call 9876543210 immediately."' },
  { key: 'url', label: 'Link', placeholder: 'e.g. http://sbi-kyc-verify-update.xyz/login' },
  { key: 'upi', label: 'UPI ID / Phone', placeholder: 'e.g. refund.officer@oksbi or +91 98765 43210' },
];

export default function ScannerSuite({ onResult }) {
  const [mode, setMode] = useState('text');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const active = MODES.find((m) => m.key === mode);

  async function handleAnalyze() {
    if (!value.trim()) {
      setError('Enter something to check.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const r = await analyzeMode(value, mode);
      setResult(r);
      onResult?.(r, value, mode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(key) {
    setMode(key);
    setResult(null);
    setError('');
  }

  return (
    <div className="scanner-suite">
      <div className="mode-tabs" role="tablist">
        {MODES.map((m) => (
          <button key={m.key} type="button" role="tab" aria-selected={mode === m.key} className={mode === m.key ? 'mode-tab active' : 'mode-tab'} onClick={() => switchMode(m.key)}>
            {m.label}
          </button>
        ))}
      </div>

      <div className={`card glass-card analyze-card ${loading ? 'scanning' : ''}`}>
        <label className="message-input-label" htmlFor="suite-input">
          {mode === 'text' ? 'Paste the message' : mode === 'url' ? 'Paste the link' : 'Enter the UPI ID or phone number'}
        </label>
        {mode === 'text' ? (
          <textarea id="suite-input" className="message-input-textarea" rows={6} value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder} />
        ) : (
          <input id="suite-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder} />
        )}
        {error && <p className="message-input-error">{error}</p>}
        <div className="analyze-actions">
          <button type="button" className="btn" onClick={handleAnalyze} disabled={loading || !value.trim()}>
            {loading && <span className="spinner" />}
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
          {value && (
            <button type="button" className="btn-outline" onClick={() => { setValue(''); setResult(null); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="results-card glass-card card-in" style={{ marginTop: '1rem' }}>
          <RiskScore score={result.riskScore} level={result.riskLevel} />
          <DetectionResults threats={result.detectedThreats} reasons={result.reasons} />
          <ActionGuidance recommendations={result.recommendations} riskLevel={result.riskLevel} />
        </div>
      )}
    </div>
  );
}
