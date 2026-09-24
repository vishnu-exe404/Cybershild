/**
 * Lightweight generic keyword detector used for signals that don't warrant
 * their own dedicated rule file (kept separate so it's easy to extend
 * without touching the more structured rule modules).
 */

const GENERIC_SUSPICIOUS_KEYWORDS = [
  { term: 'wallet', weight: 4 },
  { term: 'upi pin', weight: 20 },
  { term: 'debit card pin', weight: 20 },
  { term: 'cvv', weight: 20 },
  { term: 'net banking password', weight: 20 },
  { term: 'crypto investment', weight: 8 },
  { term: 'double your money', weight: 15 },
  { term: 'work from home job', weight: 6 },
  { term: 'part time job', weight: 5 },
];

function analyze(text) {
  const lower = text.toLowerCase();
  const findings = [];

  for (const { term, weight } of GENERIC_SUSPICIOUS_KEYWORDS) {
    if (lower.includes(term)) {
      findings.push({
        id: `keyword_${term.replace(/\s+/g, '_')}`,
        category: 'Sensitive Keyword',
        label: `Mentions "${term}"`,
        weight,
        reason: `The message references "${term}", which is highly sensitive and rarely requested legitimately over SMS/chat.`,
        recommendation: `Never share your ${term} with anyone, including people claiming to be bank or company staff.`,
      });
    }
  }

  return findings;
}

module.exports = { analyze };
