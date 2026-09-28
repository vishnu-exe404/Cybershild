const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';

/**
 * Cookie SameSite policy.
 *  - 'lax'  (default): frontend and backend share a site (e.g. localhost, or same domain).
 *  - 'none': frontend and backend are on DIFFERENT domains (e.g. Vercel + Render).
 *            Browsers require Secure for this, so it is forced on.
 */
function cookieBase() {
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  return {
    httpOnly: true,
    secure: isProd || sameSite === 'none',
    sameSite,
    path: '/',
  };
}

function createSessionAuth({ cookieName, secretEnvVar, ttlEnvVar, defaultTtl }) {
  function getSecret() {
    const secret = process.env[secretEnvVar];
    if (!secret) {
      const err = new Error(`Server misconfiguration: ${secretEnvVar} is not set.`);
      err.status = 500;
      throw err;
    }
    return secret;
  }

  function sign(payload, expiresIn) {
    return jwt.sign(payload, getSecret(), {
      expiresIn: expiresIn || process.env[ttlEnvVar] || defaultTtl,
    });
  }

  function verify(token) {
    return jwt.verify(token, getSecret());
  }

  /** remember=true -> persistent 30-day cookie; false -> browser-session cookie. */
  function setCookie(res, token, { remember = true } = {}) {
    const options = cookieBase();
    if (remember) options.maxAge = 1000 * 60 * 60 * 24 * 30;
    res.cookie(cookieName, token, options);
  }

  function clearCookie(res) {
    res.clearCookie(cookieName, cookieBase());
  }

  return { cookieName, sign, verify, setCookie, clearCookie };
}

const userAuth = createSessionAuth({
  cookieName: 'csap_session',
  secretEnvVar: 'AUTH_SECRET',
  ttlEnvVar: 'AUTH_SESSION_TTL',
  defaultTtl: '7d',
});

const adminAuth = createSessionAuth({
  cookieName: 'csap_admin_session',
  secretEnvVar: 'ADMIN_AUTH_SECRET',
  ttlEnvVar: 'ADMIN_SESSION_TTL',
  defaultTtl: '8h',
});

module.exports = { userAuth, adminAuth };
