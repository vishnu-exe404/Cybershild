import React, { useState } from 'react';
import LiveFeed from '../components/console/LiveFeed.jsx';
import ScannerSuite from '../components/console/ScannerSuite.jsx';
import PasswordVault from '../components/console/PasswordVault.jsx';
import GoldenHour from '../components/console/GoldenHour.jsx';
import ScamEncyclopedia from '../components/console/ScamEncyclopedia.jsx';
import QuizGame from '../components/console/QuizGame.jsx';

const TABS = [
  { key: 'feed', label: 'Live Feed' },
  { key: 'scanner', label: 'Scanner' },
  { key: 'vault', label: 'Password Vault' },
  { key: 'golden', label: 'Golden Hour' },
  { key: 'encyclopedia', label: 'Scam Archives' },
  { key: 'quiz', label: 'Quiz' },
];

export default function Console() {
  const [tab, setTab] = useState('scanner');
  const [lastResult, setLastResult] = useState(null);
  const [lastInput, setLastInput] = useState('');

  function handleScanResult(result, input) {
    setLastResult(result);
    setLastInput(input);
  }

  return (
    <section className="fade-in console-page">
      <div className="dashboard-header">
        <div>
          <h1 style={{ margin: 0 }}>Console</h1>
          <p className="muted">Your full CyberShild toolkit.</p>
        </div>
      </div>

      <div className="mode-tabs console-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'mode-tab active' : 'mode-tab'} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'feed' && <LiveFeed />}
      {tab === 'scanner' && <ScannerSuite onResult={handleScanResult} />}
      {tab === 'vault' && <PasswordVault />}
      {tab === 'golden' && <GoldenHour lastResult={lastResult} lastInput={lastInput} />}
      {tab === 'encyclopedia' && <ScamEncyclopedia />}
      {tab === 'quiz' && <QuizGame />}
    </section>
  );
}
