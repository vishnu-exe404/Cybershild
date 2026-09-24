/**
 * OTP scam rules - any request to share a one-time password is a strong
 * red flag; legitimate organizations never ask for it.
 */

const RULES = [
  {
    id: 'otp_share_request',
    label: 'OTP Sharing Request',
    weight: 30,
    test: (t) => /\b(share|send|tell|provide|give)\b.{0,15}\botp\b/i.test(t) || /\botp\b.{0,15}\b(share|send|tell|provide)\b/i.test(t),
    reason: 'The message directly asks you to share an OTP (One-Time Password).',
    recommendation: 'NEVER share an OTP with anyone, including people claiming to be bank or company staff. No genuine organization asks for it.',
  },
  {
    id: 'otp_mentioned',
    label: 'OTP Referenced',
    weight: 10,
    test: (t) => /\botp\b/i.test(t),
    reason: 'The message mentions an OTP, which is often used in verification scams.',
    recommendation: 'Be cautious with any message that references an OTP unless you initiated the transaction yourself.',
  },
];

function evaluate(text) {
  const findings = [];
  // Prefer the stronger "share request" rule; only add the generic mention
  // rule if the stronger one did not already fire, to avoid double counting.
  const shareRule = RULES[0];
  const mentionRule = RULES[1];

  if (shareRule.test(text)) {
    findings.push({
      id: shareRule.id,
      category: 'OTP Scam',
      label: shareRule.label,
      weight: shareRule.weight,
      reason: shareRule.reason,
      recommendation: shareRule.recommendation,
    });
  } else if (mentionRule.test(text)) {
    findings.push({
      id: mentionRule.id,
      category: 'OTP Scam',
      label: mentionRule.label,
      weight: mentionRule.weight,
      reason: mentionRule.reason,
      recommendation: mentionRule.recommendation,
    });
  }

  return findings;
}

module.exports = { evaluate, RULES };
