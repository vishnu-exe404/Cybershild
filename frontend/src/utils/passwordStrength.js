/**
 * Client-side password strength estimator (pure computation, no network
 * call needed - and a password should never be sent anywhere to be
 * "checked" by a server). Ported/adapted from the reference project's
 * entropy-based approach.
 */
export function analyzePassword(pwd) {
  if (!pwd) return { length: 0, entropy: 0, crackTime: '—', label: 'None', level: 'none', checks: {} };

  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;

  const length = pwd.length;
  const entropy = Math.round(length * Math.log2(pool || 1));
  const isCommon = /^(password|123456|qwerty|admin|india|welcome|password123|letmein|iloveyou)$/i.test(pwd);

  let crackTime = 'Instant';
  let label = 'Very Weak';
  let level = 'high'; // reuses risk badge colors: high (red) -> caution (amber) -> safe (green)

  if (isCommon || entropy < 28) {
    crackTime = '< 1 second';
    label = 'Critically Weak';
    level = 'high';
  } else if (entropy < 40) {
    crackTime = 'A few seconds';
    label = 'Weak';
    level = 'high';
  } else if (entropy < 58) {
    crackTime = 'A few weeks';
    label = 'Moderate';
    level = 'caution';
  } else if (entropy < 75) {
    crackTime = 'Centuries';
    label = 'Strong';
    level = 'safe';
  } else {
    crackTime = 'Effectively uncrackable';
    label = 'Very Strong';
    level = 'safe';
  }

  return {
    length,
    entropy,
    crackTime,
    label,
    level,
    checks: {
      len: length >= 12,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      num: /[0-9]/.test(pwd),
      sym: /[^a-zA-Z0-9]/.test(pwd),
    },
  };
}
