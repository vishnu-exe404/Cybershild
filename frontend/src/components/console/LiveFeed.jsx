import React, { useEffect, useState } from 'react';
import { getPublicFeed, getPublicStats } from '../../services/api.js';
import RadarCanvas from './RadarCanvas.jsx';
import { SkeletonLine } from '../Skeleton.jsx';

const LEVEL_CLASS = { SAFE: 'badge-safe', CAUTION: 'badge-caution', HIGH_RISK: 'badge-high' };

function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

/** Real activity feed, sourced from the actual database - not a simulation. */
export default function LiveFeed() {
  const [feed, setFeed] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function poll() {
      Promise.all([getPublicFeed(), getPublicStats()])
        .then(([f, s]) => {
          if (!cancelled) {
            setFeed(f.items);
            setStats(s);
          }
        })
        .catch(() => {});
    }
    poll();
    const id = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="feed-layout">
      <div className="card glass-card feed-radar-card">
        <RadarCanvas />
        <p className="muted feed-radar-caption">Ambient visual - not live telemetry</p>
      </div>

      <div className="card glass-card feed-stats-card">
        <h3 style={{ marginTop: 0 }}>Platform activity</h3>
        {!stats ? (
          <SkeletonLine width="80%" />
        ) : (
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card"><b>{stats.totalChecks}</b><span className="muted">Total Checks</span></div>
            <div className="stat-card stat-safe"><b>{stats.safeCount}</b><span className="muted">Safe</span></div>
            <div className="stat-card stat-caution"><b>{stats.cautionCount}</b><span className="muted">Caution</span></div>
            <div className="stat-card stat-high"><b>{stats.highRiskCount}</b><span className="muted">High Risk</span></div>
          </div>
        )}
      </div>

      <div className="card glass-card feed-list-card">
        <h3 style={{ marginTop: 0 }}>Recent checks</h3>
        <p className="muted" style={{ marginTop: '-.5rem' }}>Real, anonymized results from everyone using CyberShild - no identities, no message content.</p>
        {!feed && <SkeletonLine width="100%" />}
        {feed && feed.length === 0 && <p className="empty-state">No checks yet.</p>}
        {feed && feed.length > 0 && (
          <ul className="feed-list">
            {feed.map((item, i) => (
              <li key={i} className="feed-item">
                <span className={`badge ${LEVEL_CLASS[item.riskLevel] || 'badge-caution'}`}>{item.riskLevel.replace('_', ' ')}</span>
                <span className="feed-item-cat">{item.topCategory || 'No specific threat'}</span>
                <span className="muted feed-item-time">{timeAgo(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
