const adminModel = require('../models/adminModel');
const { adminAuth } = require('../utils/sessionAuth');

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Enter the admin username and password.' });
    }

    const admin = await adminModel.findByUsername(username);
    const valid = await adminModel.verifyPassword(admin, password);

    if (!admin || !valid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = adminAuth.sign({ sub: admin.id, role: 'admin' });
    adminAuth.setCookie(res, token);

    res.json({ admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  adminAuth.clearCookie(res);
  res.json({ ok: true });
}

async function me(req, res, next) {
  try {
    const admin = await adminModel.findById(req.adminId);
    if (!admin) {
      adminAuth.clearCookie(res);
      return res.status(401).json({ error: 'Admin session no longer valid.' });
    }
    res.json({ admin });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me };
