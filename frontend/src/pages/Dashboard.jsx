import React, { useEffect, useState } from 'react';
import { useLanguage } from '../services/i18n.jsx';
import { useAuth } from '../services/auth.jsx';
import { getAnalytics } from '../services/api.js';

export default function Dashboard() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAnalytics(token)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) return <p className="dashboard-status">{t('dashboard.loading')}</p>;
  if (error) return <p className="dashboard-status dashboard-status--error">{error}</p>;
  if (!data || data.totalChecks === 0) {
    return (
      <section className="dashboard-page">
        <h1>{t('dashboard.title')}</h1>
        <p className="dashboard-status">{t('dashboard.empty')}</p>
      </section>
    );
  }

  const maxOverTime = Math.max(...data.checksOverTime.map((d) => d.count), 1);
  const maxThreat = Math.max(...data.topThreats.map((d) => d.count), 1);

  return (
    <section className="dashboard-page">
      <h1>{t('dashboard.title')}</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-value">{data.totalChecks}</p>
          <p className="stat-label">{t('dashboard.totalChecks')}</p>
        </div>
        <div className="stat-card stat-card--safe">
          <p className="stat-value">{data.safeCount}</p>
          <p className="stat-label">{t('dashboard.safe')}</p>
        </div>
        <div className="stat-card stat-card--caution">
          <p className="stat-value">{data.cautionCount}</p>
          <p className="stat-label">{t('dashboard.caution')}</p>
        </div>
        <div className="stat-card stat-card--high">
          <p className="stat-value">{data.highRiskCount}</p>
          <p className="stat-label">{t('dashboard.highRisk')}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>{t('dashboard.topThreats')}</h2>
        <div className="bar-chart">
          {data.topThreats.map((item) => (
            <div className="bar-row" key={item.label}>
              <span className="bar-label">{item.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(item.count / maxThreat) * 100}%` }} />
              </div>
              <span className="bar-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>{t('dashboard.overTime')}</h2>
        <div className="line-chart" role="img" aria-label={t('dashboard.overTime')}>
          {data.checksOverTime.map((item) => (
            <div
              key={item.date}
              className="line-chart-bar"
              title={`${item.date}: ${item.count}`}
              style={{ height: `${(item.count / maxOverTime) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
