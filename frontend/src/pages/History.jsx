import React, { useEffect, useState } from 'react';
import { getMyHistory } from '../services/api.js';
import { SkeletonCard } from '../components/Skeleton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';

export default function History() {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMyHistory()
      .then((data) => !cancelled && setRecords(data.records))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="fade-in">
      <h1>Your Check History</h1>
      {error && <p className="field-error">{error}</p>}

      {!records && !error && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {records && records.length === 0 && <p className="empty-state">You haven't analyzed anything yet.</p>}

      {records && records.length > 0 && (
        <div className="history-list">
          {records.map((r) => (
            <div key={r.id} className="card history-item">
              <div className="history-item-top">
                <RiskBadge level={r.riskLevel} />
                <span className="muted">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <div className="chip-row">
                {(r.detectedThreats || []).slice(0, 4).map((t, i) => (
                  <span key={i} className="chip">{t}</span>
                ))}
                {(r.detectedThreats || []).length === 0 && <span className="muted">No threats detected</span>}
              </div>
              <span className="muted score-inline">Score: {r.riskScore}/100 · {r.inputType}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
