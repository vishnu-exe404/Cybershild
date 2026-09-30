/**
 * UPI VPA / phone-number scam heuristics. Mirrors the shape of the other
 * rules/*.js modules (see phishingRules.js) so it plugs into the same
 * scamPatternDetector aggregation with zero special-casing.
 */

const SUSPICIOUS_VPA_HANDLES = [
  'refund', 'cashback', 'reward', 'winner', 'lottery', 'kbc', 'customs',
  'electricity', 'officer', 'police', 'cbi', 'support', 'helpdesk', 'verify',
];

const KNOWN_BANK_VPA_SUFFIXES = ['@sbi', '@okhdfcbank', '@okicici', '@okaxis', '@ybl', '@paytm', '@upi'];

const RULES = [
  {
    id: 'upi_suspicious_handle_keyword',
    label: 'Suspicious UPI Handle Wording',
    weight: 22,
    test: (t) => /@[a-z]/i.test(t) && SUSPICIOUS_VPA_HANDLES.some((w) => t.toLowerCase().includes(w)),
    reason: 'The UPI ID contains wording (refund/reward/officer/support...) commonly used in scam collection accounts.',
    recommendation: 'Do not pay this UPI ID. Legitimate refunds are never collected by paying an "officer" or "support" handle.',
  },
  {
    id: 'upi_foreign_phone_code',
    label: 'Foreign Country Code Number',
    weight: 15,
    test: (t) => /^\+(?!91[\s-]?\d)\d{1,3}(?:[\s-]?\d{2,5}){2,4}$/.test(t.trim()),
    reason: 'The number uses a foreign country code rather than +91, unusual for a routine Indian transaction or support line.',
    recommendation: 'Be cautious of payment requests or "support" calls from foreign numbers impersonating Indian services.',
  },
  {
    id: 'upi_generic_handle_no_bank',
    label: 'Unrecognized Payment Handle',
    weight: 8,
    test: (t) => /@[a-z][a-z0-9.]*$/i.test(t.trim()) && !KNOWN_BANK_VPA_SUFFIXES.some((s) => t.toLowerCase().includes(s)),
    reason: 'The UPI handle suffix is not one of the common bank/PSP domains, so it cannot be quickly verified as a known provider.',
    recommendation: 'Verify the recipient\'s name shown by your UPI app before paying - never trust the handle text alone.',
  },
];

function evaluate(text) {
  return RULES.filter((rule) => rule.test(text)).map(({ id, label, weight, reason, recommendation }) => ({
    id,
    category: 'UPI / Phone Risk',
    label,
    weight,
    reason,
    recommendation,
  }));
}

module.exports = { evaluate, RULES };
