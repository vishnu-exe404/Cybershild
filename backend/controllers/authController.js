const userModel = require('../models/userModel');
const { userAuth } = require('../utils/sessionAuth');
const { validateRegistration } = require('../utils/validate');

const PRISMA_UNIQUE_VIOLATION = 'P2002';

async function register(req, res, next) {
  try {
    const { name, email, username, password } = req.body || {};
    const errors = validateRegistration({ name, email, username, password });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Please fix the highlighted fields.', fieldErrors: errors });
    }

    let user;
    try {
      user = await userModel.createUser({ name: name.trim(), email, username, password });
    } catch (err) {
      if (err.code === PRISMA_UNIQUE_VIOLATION) {
        const field = err.meta?.target?.includes('email') ? 'email' : 'username';
        return res.status(409).json({
          error: field === 'email' ? 'An account with this email already exists.' : 'This username is already taken.',
          fieldErrors: { [field]: 'Already in use.' },
        });
      }
      throw err;
    }

    const token = userAuth.sign({ sub: user.id });
    userAuth.setCookie(res, token);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Enter your email/username and password.' });
    }

    const user = await userModel.findByEmailOrUsername(identifier);
    const valid = await userModel.verifyPassword(user, password);

    if (!user || !valid) {
      return res.status(401).json({ error: 'Incorrect email/username or password.' });
    }

    const token = userAuth.sign({ sub: user.id });
    userAuth.setCookie(res, token);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        hasOnboarded: user.hasOnboarded,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  userAuth.clearCookie(res);
  res.json({ ok: true });
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      userAuth.clearCookie(res);
      return res.status(401).json({ error: 'Session no longer valid.' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function completeOnboarding(req, res, next) {
  try {
    const user = await userModel.markOnboarded(req.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, completeOnboarding };
