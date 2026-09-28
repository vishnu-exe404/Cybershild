const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { userAuth } = require('../utils/sessionAuth');
const { validateRegistration } = require('../utils/validate');

const PRISMA_UNIQUE_VIOLATION = 'P2002';
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

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
    userAuth.setCookie(res, token, { remember: true });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password, rememberMe } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Enter your email/username and password.' });
    }

    const user = await userModel.findByEmailOrUsername(identifier);
    const valid = await userModel.verifyPassword(user, password);

    if (!user || !valid) {
      return res.status(401).json({ error: 'Incorrect email/username or password.' });
    }

    // "Remember me" checked -> 30-day token + persistent cookie.
    // Unchecked -> a short-lived token in a true browser-session cookie
    // (no maxAge), so it's gone the moment the browser is closed.
    const remember = Boolean(rememberMe);
    const token = userAuth.sign({ sub: user.id }, remember ? '30d' : '1d');
    userAuth.setCookie(res, token, { remember });

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

// Always the same generic response, whether or not the email exists -
// this is deliberate: telling the caller "no account with that email"
// would let anyone enumerate registered accounts.
const GENERIC_FORGOT_RESPONSE = {
  ok: true,
  message: 'If an account exists for that email, a password reset link has been sent.',
};

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Enter your email address.' });
    }

    const user = await userModel.findByEmail(email);
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await userModel.setResetToken(user.id, {
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(user.email)}&token=${rawToken}`;

      // NOTE: this project has no email provider configured, so the
      // "email" is logged server-side instead of actually being sent.
      // Wire up a real provider (Resend, SendGrid, SES, etc.) here and
      // replace this console.log with an actual send call.
      console.log(`[password reset] Link for ${user.email} (valid 15 min): ${resetLink}`);
    }

    res.json(GENERIC_FORGOT_RESPONSE);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'This reset link is missing required information.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const user = await userModel.findByEmail(email);
    const tokenHash = hashToken(token);
    const valid =
      user &&
      user.resetTokenHash &&
      user.resetTokenHash === tokenHash &&
      user.resetTokenExpiresAt &&
      user.resetTokenExpiresAt.getTime() > Date.now();

    if (!valid) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userModel.resetPasswordWithToken(user.id, passwordHash);

    res.json({ ok: true, message: 'Password updated. You can now log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, completeOnboarding, forgotPassword, resetPassword };
