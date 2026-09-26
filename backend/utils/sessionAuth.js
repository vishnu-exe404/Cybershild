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

  function sign(payload) {
    return jwt.sign(payload, getSecret(), {
      expiresIn: process.env[ttlEnvVar] || defaultTtl,
    });
  }

  function verify(token) {
    return jwt.verify(token, getSecret());
  }

  function setCookie(res, token) {
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days ceiling; JWT expiry is the real limit
    });
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
