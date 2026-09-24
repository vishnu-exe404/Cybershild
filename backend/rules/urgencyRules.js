/**
 * Urgency / fear-based language rules - scams rely on rushing victims so
 * they don't stop to think or verify.
 */

const RULES = [
  {
    id: 'urgency_time_pressure',
    label: 'Time Pressure',
    weight: 12,
    test: (t) => /\b(immediately|urgent|right now|within\s+\d+\s*(minutes|hours|mins)|last\s+chance|final\s+notice|expire[sd]?\s+(today|soon))\b/i.test(t),
    reason: 'The message creates time pressure, pushing you to act without thinking.',
    recommendation: 'Slow down. Legitimate organizations give you reasonable time and never threaten immediate consequences.',
  },
  {
    id: 'urgency_fear_consequence',
    label: 'Fear of Consequence',
    weight: 14,
    test: (t) => /\b(legal action|penalty|fine|arrest|jail|blocked|deactivated|account closure|suspend)\b/i.test(t),
    reason: 'The message threatens a serious consequence (legal action, fine, arrest, account closure) to scare you into acting.',
    recommendation: 'Do not act out of fear. Verify independently through official channels before doing anything.',
  },
  {
    id: 'urgency_secrecy',
    label: 'Request for Secrecy',
    weight: 15,
    test: (t) => /\b(do not tell|don't tell|keep this (confidential|secret)|do not disclose|between us)\b/i.test(t),
    reason: 'The message asks you to keep it secret from family, bank staff, or authorities, a classic scam-control tactic.',
    recommendation: 'Genuine organizations never ask you to hide a transaction or communication from anyone.',
  },
];

function evaluate(text) {
  return RULES.filter((rule) => rule.test(text)).map(({ id, label, weight, reason, recommendation }) => ({
    id,
    category: 'Urgency / Fear Tactics',
    label,
    weight,
    reason,
    recommendation,
  }));
}

module.exports = { evaluate, RULES };
