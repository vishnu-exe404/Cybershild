import React, { useState } from 'react';
import TickerBar from '../components/console/TickerBar.jsx';
import HeroStats from '../components/console/HeroStats.jsx';
import SocBadge from '../components/console/SocBadge.jsx';
import LiveFeed from '../components/console/LiveFeed.jsx';
import ScannerSuite from '../components/console/ScannerSuite.jsx';
import PasswordVault from '../components/console/PasswordVault.jsx';
import GoldenHour from '../components/console/GoldenHour.jsx';
import ScamEncyclopedia from '../components/console/ScamEncyclopedia.jsx';
import QuizGame from '../components/console/QuizGame.jsx';
import StatusPill from '../components/StatusPill.jsx';

const TABS = [
  { key: 'feed', label: 'Live SOC & Radar' },
  { key: 'scanner', label: 'Scam & SMS Scanner' },
  { key: 'urlhunter', label: 'URL Hunter' },
  { key: 'vault', label: 'Password Vault' },
  { key: 'golden', label: 'Incident SOS' },
  { key: 'quiz', label: 'Quiz Challenge' },
  { key: 'encyclopedia', label: 'Scam Archives' },
];

export default function Console() {
  const [tab, setTab] = useState('feed');
  const [lastResult, setLastResult] = useState(null);
  const [lastInput, setLastInput] = useState('');
  const [lastLatencyMs, setLastLatencyMs] = useState(null);

  function handleScanResult(result, input) {
    setLastResult(result);
    setLastInput(input);
    setLastLatencyMs(result._clientLatencyMs);
  }

  return (
    <section className="fade-in console-page">
      <TickerBar />

      <div className="dashboard-header">
        <div>
          <h1 style={{ margin: 0 }}>Console</h1>
          <p className="muted">Your full CyberShild toolkit - real-time defense model.</p>
        </div>
        <div className="console-header-right">
          <StatusPill />
          <SocBadge />
        </div>
      </div>

      <HeroStats lastLatencyMs={lastLatencyMs} />

      <div className="mode-tabs console-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'mode-tab active' : 'mode-tab'} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'feed' && <LiveFeed />}
      {tab === 'scanner' && <ScannerSuite allowedModes={['text', 'upi']} initialMode="text" onResult={handleScanResult} />}
      {tab === 'urlhunter' && <ScannerSuite allowedModes={['url']} initialMode="url" onResult={handleScanResult} />}
      {tab === 'vault' && <PasswordVault />}
      {tab === 'golden' && <GoldenHour lastResult={lastResult} lastInput={lastInput} />}
      {tab === 'quiz' && <QuizGame />}
      {tab === 'encyclopedia' && <ScamEncyclopedia />}
    </section>
  );
}
