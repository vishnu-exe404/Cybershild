import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { analyzeMessage } from '../services/api.js';
import MessageInput from '../components/MessageInput.jsx';
import AnalyzeButton from '../components/AnalyzeButton.jsx';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!text.trim()) {
      setError(t('input.error.empty'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await analyzeMessage(text);
      navigate('/results', { state: { result, submittedAt: Date.now() } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="home-page">
      <div className="hero">
        <h1>{t('appName')}</h1>
        <p className="hero-tagline">{t('tagline')}</p>
      </div>

      <div className="analyze-card">
        <MessageInput value={text} onChange={setText} error={error} />
        <div className="analyze-actions">
          <AnalyzeButton onClick={handleAnalyze} loading={loading} disabled={!text.trim()} />
          {text && (
            <button type="button" className="clear-button" onClick={() => setText('')}>
              {t('input.clear')}
            </button>
          )}
        </div>
      </div>

      <div className="how-it-works">
        <div className="step">
          <span className="step-number">1</span>
          <p>Paste & Submit</p>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <p>Engine Analyzes</p>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <p>Instant Risk Score</p>
        </div>
        <div className="step">
          <span className="step-number">4</span>
          <p>Guided Action</p>
        </div>
      </div>
    </section>
  );
}
