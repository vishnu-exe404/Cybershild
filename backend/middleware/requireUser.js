const { userAuth } = require('../utils/sessionAuth');

/** Protects a route for logged-in users. Attaches req.userId on success. */
function requireUser(req, res, next) {
  const token = req.cookies?.[userAuth.cookieName];
  if (!token) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }
  try {
    const payload = userAuth.verify(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

/** Like requireUser, but does not fail when logged out - just leaves req.userId unset. */
function attachUserIfPresent(req, res, next) {
  const token = req.cookies?.[userAuth.cookieName];
  if (token) {
    try {
      req.userId = userAuth.verify(token).sub;
    } catch {
      // Invalid/expired token - proceed as anonymous rather than erroring.
    }
  }
  next();
}

module.exports = { requireUser, attachUserIfPresent };
