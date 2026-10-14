import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import RiskScore from '../components/RiskScore.jsx';
import DetectionResults from '../components/DetectionResults.jsx';
import ActionGuidance from '../components/ActionGuidance.jsx';

export default function Results() {
  const { t } = useLanguage();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    // Direct navigation without an analysis - send back to Home instead of
    // showing a fake/empty result.
    return <Navigate to="/home" replace />;
  }

  const { riskScore, riskLevel, detectedThreats, reasons, recommendations, disclaimer } = result;

  return (
    <section className="results-page fade-in">
      <div className="results-card glass-card card-in">
        <RiskScore score={riskScore} level={riskLevel} />
        <DetectionResults threats={detectedThreats} reasons={reasons} />
        <ActionGuidance recommendations={recommendations} riskLevel={riskLevel} />
        <p className="disclaimer">{disclaimer || t('result.disclaimer')}</p>
        <Link to="/home" className="analyze-another-link">
          ← {t('input.analyze')}
        </Link>
      </div>
    </section>
  );
}
