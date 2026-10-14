import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../services/i18n.jsx';
import { analyzeMessage } from '../services/api.js';
import { OrnamentDivider } from '../components/Logo.jsx';
import MessageInput from '../components/MessageInput.jsx';
import AnalyzeButton from '../components/AnalyzeButton.jsx';

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

  function scrollToChecker() {
    const el = document.getElementById('checker');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="home-page">
      <div className="landing-hero">
        <div className="landing-hero-temples" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="landing-hero-copy fade-in">
            <p className="hero-kicker">{t('slogan')}</p>
            <h1>Your Security <span className="gold-text">Our Priority</span></h1>
            <p className="hero-motto">{t('motto')}</p>
            <p className="hero-tagline">
              CyberShild checks suspicious SMS, emails, messages and links for phishing, OTP theft,
              digital-arrest, courier and malicious-app scams — and tells you what to do next.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn btn-saffron" onClick={scrollToChecker}>Get Started</button>
              <Link to="/about" className="btn-ghost">Learn More</Link>
            </div>
          </div>
          <div className="landing-hero-art" aria-hidden="true">
            <span className="hero-mandala" />
            <img src="/logo/cybershild-mark.svg" alt="" className="hero-shield logo-glow" width="300" height="330" />
          </div>
        </div>
      </div>

      <div className="home-container">
        <div className="feature-grid">
          <article className="feature-card card-in">
            <span className="feature-icon" aria-hidden="true">🛡️</span>
            <h3>Scam Message Scanning</h3>
            <p>Paste any SMS, email or chat message and get an instant risk score with the reasons behind it.</p>
          </article>
          <article className="feature-card card-in">
            <span className="feature-icon" aria-hidden="true">📱</span>
            <h3>Malicious App Detection</h3>
            <p>Flags messages pushing .apk installs, remote-access apps and fake refund apps outside the Play Store.</p>
          </article>
          <article className="feature-card card-in">
            <span className="feature-icon" aria-hidden="true">🔗</span>
            <h3>Link &amp; URL Analysis</h3>
            <p>Spots look-alike banking domains, shortened links and other phishing tricks before you click.</p>
          </article>
          <article className="feature-card card-in">
            <span className="feature-icon" aria-hidden="true">🔒</span>
            <h3>Privacy First</h3>
            <p>Your message content is not stored — only anonymous risk statistics are kept.</p>
          </article>
        </div>

        <OrnamentDivider />

        <div id="checker" className="checker-heading">
          <h2>Check a message now</h2>
          <p className="muted">Paste the suspicious text or link below.</p>
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
          {loading && (
            <div className="scan-loader" role="status" aria-live="polite">
              <span className="scan-loader-lotus" aria-hidden="true" />
              <span>Scanning for scam patterns…</span>
            </div>
          )}
          <div className="sample-chips">
            {SAMPLES.map((s) => (
              <button key={s.label} type="button" className="sample-chip" onClick={() => setText(s.text)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="how-it-works">
          <div className="step card"><span className="step-number">1</span><p>Paste &amp; Submit</p></div>
          <div className="step card"><span className="step-number">2</span><p>Engine Analyzes</p></div>
          <div className="step card"><span className="step-number">3</span><p>Instant Risk Score</p></div>
          <div className="step card"><span className="step-number">4</span><p>Guided Action</p></div>
        </div>
      </div>
    </section>
  );
}
