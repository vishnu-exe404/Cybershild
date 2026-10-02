import React, { useEffect, useState } from 'react';
import { getPublicStats } from '../../services/api.js';

// Real, generic safety guidance (same facts used elsewhere in the app,
// e.g. Golden Hour) - no invented "incidents reported in X city" claims.
const TIPS = [
  'No real police officer, CBI, or ED official will ever conduct an arrest over a video call.',
  'Banks and UPI apps never ask for your OTP, PIN, or password over SMS, call, or email.',
  'Dial 1930 within the first hour of an unauthorized financial transaction to maximize the chance of freezing it.',
  'Customs and courier "clearance fees" are never collected via a link sent by SMS.',
  'Report incidents at cybercrime.gov.in - keep screenshots of the message and transaction.',
];

export default function TickerBar() {
  const [stats, setStats] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 7000);
    return () => clearInterval(id);
  }, []);

  const liveLine = stats ? `${stats.checksToday} real check${stats.checksToday === 1 ? '' : 's'} run on CyberShild in the last 24 hours` : 'Loading live activity...';

  return (
    <div className="ticker-bar">
      <span className="ticker-live-dot"><span className="status-dot" /> LIVE</span>
      <span className="ticker-item">{liveLine}</span>
      <span className="ticker-sep">•</span>
      <span className="ticker-item">TIP: {TIPS[tipIndex]}</span>
      <span className="ticker-sep">•</span>
      <span className="ticker-hotline">HOTLINE: Dial <strong>1930</strong> within 2 hours of unauthorized financial debit to freeze money.</span>
    </div>
  );
}
