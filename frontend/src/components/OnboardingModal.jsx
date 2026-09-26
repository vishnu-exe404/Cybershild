import React, { useState } from 'react';
import { useUserAuth } from '../services/userAuth.jsx';

const SLIDES = [
  {
    title: 'Welcome to CyberShild',
    body: 'Paste any suspicious SMS, email, message, or link and get an instant, easy-to-understand risk check.',
  },
  {
    title: 'Understand exactly why',
    body: 'Every result explains what was flagged and why - phishing, OTP requests, digital-arrest scams, and more.',
  },
  {
    title: 'Your history, saved',
    body: "Since you're signed in, your past checks are saved to your account so you can review them anytime.",
  },
];

export default function OnboardingModal() {
  const { completeOnboarding } = useUserAuth();
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const isLast = step === SLIDES.length - 1;

  async function handleContinue() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setFinishing(true);
    try {
      await completeOnboarding();
    } finally {
      setFinishing(false);
    }
  }

  const slide = SLIDES[step];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="modal-card onboarding-card">
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={i === step ? 'dot dot--active' : 'dot'} />
          ))}
        </div>
        <h2>{slide.title}</h2>
        <p className="muted">{slide.body}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={handleContinue} disabled={finishing}>
            {isLast ? (finishing ? 'Finishing...' : 'Get started') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
