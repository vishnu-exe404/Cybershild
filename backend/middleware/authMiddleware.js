const jwt = require('jsonwebtoken');

/**
 * Protects a route with a Bearer JWT issued by /api/auth/login.
 * Attaches { username, role } to req.user on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Login required.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server is not configured for login.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { username: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

module.exports = requireAuth;
