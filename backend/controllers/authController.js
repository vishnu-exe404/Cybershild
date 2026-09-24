const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      const err = new Error('Please enter a username and password.');
      err.status = 400;
      throw err;
    }

    const user = await userModel.findByUsername(username);
    const valid = await userModel.verifyPassword(user, password);

    if (!user || !valid) {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }

    if (!process.env.JWT_SECRET) {
      const err = new Error('Server is not configured for login. Set JWT_SECRET in the backend .env file.');
      err.status = 500;
      throw err;
    }

    const token = jwt.sign({ sub: user.username, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });

    res.json({ token, username: user.username });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
