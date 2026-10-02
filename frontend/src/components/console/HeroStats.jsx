import React, { useEffect, useState } from 'react';
import { getPublicStats } from '../../services/api.js';
import { IconShield, IconGrid, IconHistory, IconInfo } from '../icons.jsx';

/**
 * Four headline stat cards, styled after the reference SOC dashboard - but
 * every figure here is real:
 *  - Checks today / high-risk today: live counts from the database.
 *  - Last scan speed: the ACTUAL measured latency of your most recent scan
 *    in this session (see services/api.js analyzeMode), not a fixed number.
 *  - Threat level: derived server-side from the real high-risk ratio.
 */
export default function HeroStats({ lastLatencyMs }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function poll() {
      getPublicStats().then((s) => !cancelled && setStats(s)).catch(() => {});
    }
    poll();
    const id = setInterval(poll, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="hero-stats-grid">
      <div className="card glass-card hero-stat-card">
        <div className="hero-stat-top"><span className="muted">CHECKS TODAY</span><IconShield width={16} height={16} /></div>
        <div className="hero-stat-value">{stats ? stats.checksToday.toLocaleString() : '—'}</div>
        <p className="muted hero-stat-caption">Real, last 24 hours</p>
      </div>
      <div className="card glass-card hero-stat-card">
        <div className="hero-stat-top"><span className="muted">HIGH-RISK FLAGGED</span><IconGrid width={16} height={16} /></div>
        <div className="hero-stat-value hero-stat-high">{stats ? stats.highRiskToday.toLocaleString() : '—'}</div>
        <p className="muted hero-stat-caption">Real, last 24 hours</p>
      </div>
      <div className="card glass-card hero-stat-card">
        <div className="hero-stat-top"><span className="muted">LAST SCAN SPEED</span><IconHistory width={16} height={16} /></div>
        <div className="hero-stat-value">{lastLatencyMs != null ? `${lastLatencyMs}ms` : '—'}</div>
        <p className="muted hero-stat-caption">{lastLatencyMs != null ? 'Measured this session' : 'Run a scan to measure'}</p>
      </div>
      <div className="card glass-card hero-stat-card">
        <div className="hero-stat-top"><span className="muted">THREAT LEVEL</span><IconInfo width={16} height={16} /></div>
        <div className="hero-stat-value hero-stat-level">{stats ? `L${stats.threatLevel.level} · ${stats.threatLevel.label}` : '—'}</div>
        <p className="muted hero-stat-caption">Derived from real high-risk ratio</p>
      </div>
    </div>
  );
}
