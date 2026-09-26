const userModel = require('../models/userModel');

async function listUsers(req, res, next) {
  try {
    const { search = '', page = '1', pageSize = '20' } = req.query;
    const result = await userModel.listUsers({
      search: search.trim(),
      page: Math.max(1, parseInt(page, 10) || 1),
      pageSize: Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20)),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body || {};
    const user = await userModel.updateUser(id, { name, email, username });
    res.json({ user });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'That email or username is already in use.' });
    }
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await userModel.deleteUser(id);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User not found.' });
    }
    next(err);
  }
}

module.exports = { listUsers, updateUser, deleteUser };
