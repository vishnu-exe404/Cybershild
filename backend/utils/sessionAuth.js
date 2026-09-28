const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';

/**
 * Builds a { sign, verify, cookieName, setCookie, clearCookie } helper for
 * one auth "realm" (user or admin). Each realm has its own secret, cookie
 * name, and expiry - so a leaked user token can never be replayed against
 * admin routes and vice versa.
 */
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

  /**
   * remember=true -> persistent cookie (30 days) so the session survives
   * browser restarts. remember=false -> a real *session cookie* (no
   * maxAge at all), so the browser drops it the moment it's closed -
   * this is what "remember me" unchecked should actually mean.
   */
  function setCookie(res, token, { remember = true } = {}) {
    const options = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    };
    if (remember) options.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
    res.cookie(cookieName, token, options);
  }

  function clearCookie(res) {
    res.clearCookie(cookieName, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
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
