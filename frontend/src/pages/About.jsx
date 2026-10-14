import React from 'react';
import { useLanguage } from '../services/i18n.jsx';

export default function About() {
  const { t } = useLanguage();

  return (
    <section className="fade-in">
      <div className="card about-card">
        <p className="hero-kicker">{t('slogan')}</p>
        <h1 style={{ marginTop: 0 }}>{t('about.title')}</h1>
        <p>
          CyberShild is a free tool that helps anyone quickly check
          whether a suspicious SMS, email, message, or link shows common scam warning signs —
          including phishing, OTP-sharing requests, urgency and fear tactics, and India-specific
          scams such as digital-arrest impersonation, courier/parcel scams, and malicious app
          install prompts.
        </p>
        <p>
          This is an automated risk assessment based on known patterns. It is <strong>not</strong>{' '}
          a perfect or complete detector, and it cannot replace your own judgement or verification
          through official channels.
        </p>
        <p>
          We never ask for or store the sensitive content of your message. Only aggregated,
          non-identifying statistics (like the risk level and detected threat categories) are kept
          to power the admin analytics dashboard.
        </p>
        <p style={{ marginBottom: 0 }}>
          If you believe you have been targeted or defrauded, report it at{' '}
          <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">
            cybercrime.gov.in
          </a>{' '}
          or call the National Cybercrime Helpline at <strong>1930</strong>.
        </p>
      </div>
    </section>
  );
}
