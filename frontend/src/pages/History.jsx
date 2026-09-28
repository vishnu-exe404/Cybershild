import React, { useEffect, useState } from 'react';
import { getMyHistory, deleteHistoryItemRequest, clearHistoryRequest } from '../services/api.js';
import { useToast } from '../services/toast.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import RiskBadge from '../components/RiskBadge.jsx';

export default function History() {
  const { showToast } = useToast();
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyHistory()
      .then((data) => !cancelled && setRecords(data.records))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  async function removeOne(id) {
    try {
      await deleteHistoryItemRequest(id);
      setRecords((rs) => rs.filter((r) => r.id !== id));
      showToast('Removed from history.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function clearAll() {
    try {
      await clearHistoryRequest();
      setRecords([]);
      showToast('History cleared.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirmClear(false);
    }
  }

  return (
    <section className="fade-in">
      <div className="dashboard-header">
        <div>
          <h1 style={{ margin: 0 }}>Your Check History</h1>
          <p className="muted">Every message you've checked while signed in.</p>
        </div>
        {records && records.length > 0 && (
          <button type="button" className="btn-outline btn-danger-outline" onClick={() => setConfirmClear(true)}>
            Clear all
          </button>
        )}
      </div>

      {error && <p className="field-error">{error}</p>}
      {!records && !error && (<><SkeletonCard /><SkeletonCard /></>)}
      {records && records.length === 0 && <p className="empty-state">You haven't analyzed anything yet.</p>}

      {records && records.length > 0 && (
        <div className="history-list">
          {records.map((r) => (
            <div key={r.id} className="card history-item fade-in">
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
              <div className="history-item-top" style={{ marginBottom: 0 }}>
                <span className="muted score-inline">Score: {r.riskScore}/100 · {r.inputType}</span>
                <button type="button" className="btn-outline btn-sm btn-danger-outline" style={{ marginRight: 0 }} onClick={() => removeOne(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear all history?"
        message="This permanently removes every saved check from your account."
        confirmLabel="Clear all"
        danger
        onConfirm={clearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </section>
  );
}
