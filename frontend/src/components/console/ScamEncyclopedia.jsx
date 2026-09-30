import React from 'react';

const ENTRIES = [
  {
    title: 'Digital Arrest',
    quote: '"You are under digital arrest. Stay on this video call or a warrant will be issued."',
    flags: ['Claims to be CBI / ED / Police over a video call', 'Demands you stay on camera continuously', 'Threatens arrest unless you pay or transfer funds'],
    truth: 'No Indian law enforcement agency arrests anyone over a video call. This is always fraud.',
  },
  {
    title: 'Electricity Disconnection',
    quote: '"Your power will be disconnected tonight at 9:30 PM. Call officer Mr. Sharma immediately."',
    flags: ['Same-day disconnection threat', 'A personal mobile number instead of the utility\'s official helpline', 'Urgency with a countdown'],
    truth: 'Utilities send written notices with billing cycles, never same-night SMS threats with a "call this officer" number.',
  },
  {
    title: 'Courier / Customs Extortion',
    quote: '"Your parcel is seized by customs for containing illegal items. Pay clearance fee to release it."',
    flags: ['Unnamed courier or vague tracking number', 'Demands a small "clearance fee" by UPI', 'Threat of legal action if you don\'t pay'],
    truth: 'Customs duties are never collected by phone or SMS link - they go through the courier\'s official portal.',
  },
  {
    title: 'Work-From-Home / Task Scam',
    quote: '"Earn ₹3,000-8,000 daily. Like 3 videos now and receive ₹150 instantly. Join our Telegram group."',
    flags: ['Payment for tiny tasks like "likes"', 'Recruitment via anonymous Telegram groups', 'Later asks you to "invest" or pay a deposit to unlock bigger tasks'],
    truth: 'The tiny real payout is bait; the actual scam is the "deposit" they ask for once you\'re hooked.',
  },
  {
    title: 'Malicious APK / Remote Access',
    quote: '"Install this app to fix the issue" (a link to a .apk or AnyDesk/TeamViewer)',
    flags: ['A link to a raw .apk file instead of the Play Store', 'A request to install a screen-sharing app', 'Framed as "support" or "verification"'],
    truth: 'Installing these gives a stranger full remote control of your phone and banking apps.',
  },
  {
    title: 'Fake KYC / Bank Update',
    quote: '"Your account will be blocked. Verify your KYC immediately at this link."',
    flags: ['A link with "kyc", "verify", or "update" on a domain that isn\'t your bank\'s', 'Urgency about account suspension', 'Asks for your PIN, OTP, or card details'],
    truth: 'Banks never ask you to "complete KYC" by clicking an SMS link - KYC updates happen at a branch or in the official app.',
  },
];

export default function ScamEncyclopedia() {
  return (
    <div className="encyclopedia-grid">
      {ENTRIES.map((e) => (
        <div key={e.title} className="card glass-card encyclopedia-card">
          <h3 style={{ marginTop: 0 }}>{e.title}</h3>
          <p className="encyclopedia-quote">{e.quote}</p>
          <p className="muted" style={{ fontWeight: 700, marginBottom: '.3rem' }}>Red flags:</p>
          <ul className="reason-list">
            {e.flags.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <p className="encyclopedia-truth">{e.truth}</p>
        </div>
      ))}
    </div>
  );
}
