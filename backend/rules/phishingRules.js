/**
 * Phishing pattern rules.
 * Each rule: { id, label, weight, test(text) -> bool, reason, recommendation }
 * Keep this list append-only friendly so new patterns can be added easily.
 */

const RULES = [
  {
    id: 'phish_account_suspended',
    label: 'Account Suspension Threat',
    weight: 18,
    test: (t) =>
      /\b(account|kyc|card|sim|bank)\s+(has been|will be|is)?\s*(suspend|block|deactivat|freeze|expir)/i.test(
        t
      ),
    reason: 'The message threatens that your account, card, or SIM will be blocked or suspended.',
    recommendation:
      'Do not act on this message. Contact the organization directly using the number/website on your card or official app.',
  },
  {
    id: 'phish_verify_identity',
    label: 'Fake Identity Verification Request',
    weight: 15,
    test: (t) => /\b(verify|update|confirm)\s+(your\s+)?(kyc|identity|account|details|pan|aadhaar)/i.test(t),
    reason: 'The message asks you to "verify" or "update" personal or bank details, a common phishing tactic.',
    recommendation: 'Never share personal or banking details in response to an unsolicited message.',
  },
  {
    id: 'phish_click_link',
    label: 'Suspicious Call-To-Action',
    weight: 10,
    test: (t) => /\b(click|tap|open)\s+(the\s+)?(link|here|below|now)\b/i.test(t),
    reason: 'The message pressures you to click a link immediately.',
    recommendation: 'Do not click links in unexpected messages. Type the official website address yourself instead.',
  },
  {
    id: 'phish_prize_lottery',
    label: 'Fake Prize / Lottery',
    weight: 20,
    test: (t) => /\b(you\s+(have\s+)?won|lottery|lucky\s+draw|congratulations.*prize|cashback\s+of)\b/i.test(t),
    reason: 'The message claims you have won a prize, lottery, or unexpected reward.',
    recommendation: 'Genuine organizations do not notify random winners by SMS/WhatsApp. Do not respond or pay any "processing fee".',
  },
  {
    id: 'phish_impersonation',
    label: 'Brand / Bank Impersonation',
    weight: 12,
    test: (t) => /\b(sbi|hdfc|icici|axis|paytm|phonepe|gpay|google pay|income tax|irctc|amazon|flipkart)\b/i.test(t) &&
      /\b(link|verify|update|block|suspend|refund|claim)\b/i.test(t),
    reason: 'The message references a well-known brand alongside urgent account/refund action, a common impersonation pattern.',
    recommendation: 'Verify directly through the brand\'s official app or website, not through the link in this message.',
  },
];

function evaluate(text) {
  return RULES.filter((rule) => rule.test(text)).map(({ id, label, weight, reason, recommendation }) => ({
    id,
    category: 'Phishing',
    label,
    weight,
    reason,
    recommendation,
  }));
}

module.exports = { evaluate, RULES };
