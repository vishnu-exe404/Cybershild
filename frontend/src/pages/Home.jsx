import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { analyzeMessage } from '../services/api.js';
import BlobField from '../components/BlobField.jsx';
import MessageInput from '../components/MessageInput.jsx';
import AnalyzeButton from '../components/AnalyzeButton.jsx';
import TypeText from '../components/TypeText.jsx';

const SAMPLES = [
  {
    label: 'Try a digital-arrest scam',
    text: 'This is an officer from the Cyber Cell. You are under digital arrest for a parcel linked to narcotics. Stay on this video call and share the OTP sent to your phone or a warrant will be issued.',
  },
  {
    label: 'Try a courier scam',
    text: 'Your parcel is held at customs. Pay Rs 249 clearance fee within 2 hours or it will be returned. Click http://bit.ly/xyz123 to pay now.',
  },
  {
    label: 'Try a safe message',
    text: 'Hi, are we still meeting for lunch at 1pm tomorrow near the office? Let me know if that time works for you.',
  },
];

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
      <BlobField />
      <div className="hero fade-in">
        <p className="hero-kicker">&gt; THREAT SCANNER // ONLINE</p>
        <h1 className="glitch" data-text="Know if it's a scam before you act on it.">Know if it's a scam before you act on it.</h1>
        <p className="hero-tagline"><TypeText text={t('tagline')} /></p>
      </div>

      <div className={`analyze-card glass-card card-in ${loading ? 'scanning' : ''}`}>
        <MessageInput value={text} onChange={setText} error={error} />
        <div className="analyze-actions">
          <AnalyzeButton onClick={handleAnalyze} loading={loading} disabled={!text.trim()} />
          {text && (
            <button type="button" className="btn-outline" onClick={() => setText('')}>
              {t('input.clear')}
            </button>
          )}
        </div>
        <div className="sample-chips">
          {SAMPLES.map((s) => (
            <button key={s.label} type="button" className="sample-chip" onClick={() => setText(s.text)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="how-it-works">
        <div className="step card"><span className="step-number">1</span><p>Paste & Submit</p></div>
        <div className="step card"><span className="step-number">2</span><p>Engine Analyzes</p></div>
        <div className="step card"><span className="step-number">3</span><p>Instant Risk Score</p></div>
        <div className="step card"><span className="step-number">4</span><p>Guided Action</p></div>
      </div>
    </section>
  );
}
