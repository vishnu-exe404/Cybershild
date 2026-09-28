import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../services/api.js';
import { useAdminAuth } from '../services/adminAuth.jsx';
import { useToast } from '../services/toast.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';
import AdminUsersTable from '../components/AdminUsersTable.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { IconMenu } from '../components/icons.jsx';

export default function Dashboard() {
  const { admin, logout } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats().then(setData).catch((err) => setError(err.message));
  }, []);

  async function handleLogout() {
    await logout();
    showToast('Logged out.', 'info');
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell fade-in">
      <Sidebar section={section} onSectionChange={setSection} onLogout={handleLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button type="button" className="mobile-nav-toggle" style={{ display: 'flex' }} onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <IconMenu />
            </button>
            <div>
              <h1 style={{ margin: 0 }}>{section === 'overview' ? 'Dashboard Overview' : 'User Management'}</h1>
              <p className="muted">Signed in as {admin?.username}</p>
            </div>
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        {section === 'overview' && (
          <>
            {!data && !error && (
              <div className="stat-grid">
                <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            )}
            {data && (
              <div className="stat-grid">
                <div className="card stat-card"><b>{data.totalUsers}</b><span className="muted">Registered Users</span></div>
                <div className="card stat-card"><b>{data.totalChecks}</b><span className="muted">Total Checks</span></div>
                <div className="card stat-card stat-safe"><b>{data.safeCount}</b><span className="muted">Safe</span></div>
                <div className="card stat-card stat-caution"><b>{data.cautionCount}</b><span className="muted">Caution</span></div>
                <div className="card stat-card stat-high"><b>{data.highRiskCount}</b><span className="muted">High Risk</span></div>
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
          </>
        )}

        {section === 'users' && <AdminUsersTable />}
      </div>
    </div>
  );
}
