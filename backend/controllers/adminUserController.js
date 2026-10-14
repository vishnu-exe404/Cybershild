const userModel = require('../models/userModel');
const crypto = require('crypto');
const { validateRegistration, validateProfileFields, validateNewPassword } = require('../utils/validate');

function conflictMessage(err) {
  const target = err.meta?.target;
  if (Array.isArray(target) ? target.includes('email') : String(target || '').includes('email')) {
    return 'That email is already in use.';
  }
  return 'That username is already in use.';
}

async function listUsers(req, res, next) {
  try {
    const { search = '', page = '1', pageSize = '20' } = req.query;
    const result = await userModel.listUsers({
      search: String(search).trim(),
      page: Math.max(1, parseInt(page, 10) || 1),
      pageSize: Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20)),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, username, password } = req.body || {};
    const errors = validateRegistration({ name, email, username, password });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
    }
    const user = await userModel.createUser({ name: name.trim(), email, username, password });
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: conflictMessage(err) });
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { name, email, username } = req.body || {};
    const errors = validateProfileFields({ name, email, username });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: Object.values(errors)[0], fieldErrors: errors });
    }
    const user = await userModel.updateUser(req.params.id, { name, email, username });
    res.json({ user });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found.' });
    if (err.code === 'P2002') return res.status(409).json({ error: conflictMessage(err) });
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found.' });
    next(err);
  }
}

/**
 * Admin password reset for a locked-out / forgetful user.
 * Passwords are stored only as bcrypt hashes, so an admin can never READ a
 * password - instead the admin sets a new one (or lets the server generate a
 * temporary one). A generated password is returned once in this response and
 * is never stored in readable form or logged.
 */
async function resetUserPassword(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let password = req.body && req.body.password;
    let generated = false;
    if (password === undefined || password === null || password === '') {
      // 12 chars from an unambiguous alphabet, cryptographically random.
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      password = Array.from(crypto.randomBytes(12), (b) => alphabet[b % alphabet.length]).join('') + '#7';
      generated = true;
    } else {
      const msg = validateNewPassword(password);
      if (msg) return res.status(400).json({ error: msg });
    }

    await userModel.setPassword(user.id, password);
    res.json({ ok: true, ...(generated ? { temporaryPassword: password } : {}) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, resetUserPassword };
