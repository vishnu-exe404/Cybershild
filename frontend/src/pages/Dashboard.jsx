import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../services/api.js';
import { useAdminAuth } from '../services/adminAuth.jsx';
import { useToast } from '../services/toast.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';
import AdminUsersTable from '../components/AdminUsersTable.jsx';

export default function Dashboard() {
  const { admin, logout } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  async function handleLogout() {
    await logout();
    showToast('Logged out.', 'info');
    navigate('/admin/login');
  }

  return (
    <section className="fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">Signed in as {admin?.username}</p>
        </div>
        <button className="btn-outline" onClick={handleLogout}>Log out</button>
      </div>

      {error && <p className="field-error">{error}</p>}

      {!data && !error && (
        <div className="stat-grid">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {data && (
        <div className="stat-grid">
          <div className="stat-card glass-card"><b>{data.totalUsers}</b><span className="muted">Registered Users</span></div>
          <div className="stat-card glass-card"><b>{data.totalChecks}</b><span className="muted">Total Checks</span></div>
          <div className="stat-card glass-card stat-safe"><b>{data.safeCount}</b><span className="muted">Safe</span></div>
          <div className="stat-card glass-card stat-caution"><b>{data.cautionCount}</b><span className="muted">Caution</span></div>
          <div className="stat-card glass-card stat-high"><b>{data.highRiskCount}</b><span className="muted">High Risk</span></div>
        </div>
      )}

      {data && data.topThreats.length > 0 && (
        <div className="card">
          <h3>Most Frequently Detected Threats</h3>
          <div className="bar-chart">
            {data.topThreats.map((t) => (
              <div className="bar-row" key={t.label}>
                <span className="bar-label">{t.label}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(t.count / data.topThreats[0].count) * 100}%` }} /></div>
                <span className="bar-count">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdminUsersTable />
    </section>
  );
}
