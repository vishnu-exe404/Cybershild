const { adminAuth } = require('../utils/sessionAuth');

/** Protects a route for logged-in admins only. Attaches req.adminId on success. */
function requireAdmin(req, res, next) {
  const token = req.cookies?.[adminAuth.cookieName];
  if (!token) {
    return res.status(401).json({ error: 'Admin login required.' });
  }
  try {
    const payload = adminAuth.verify(token);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    req.adminId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Your admin session has expired. Please log in again.' });
  }
}

module.exports = { requireAdmin };
