const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { userAuth } = require('../utils/sessionAuth');
const { validateRegistration, validateProfileFields, validateNewPassword } = require('../utils/validate');

const PRISMA_UNIQUE_VIOLATION = 'P2002';
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function uniqueField(err) {
  const target = err.meta?.target;
  const text = Array.isArray(target) ? target.join(',') : String(target || '');
  return text.includes('email') ? 'email' : 'username';
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
        const field = uniqueField(err);
        return res.status(409).json({
          error: field === 'email' ? 'An account with this email already exists.' : 'This username is already taken.',
          fieldErrors: { [field]: 'Already in use.' },
        });
      }
      throw err;
    }

    userAuth.setCookie(res, userAuth.sign({ sub: user.id }), { remember: true });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password, rememberMe } = req.body || {};
    if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier.trim() || !password) {
      return res.status(400).json({ error: 'Enter your email/username and password.' });
    }

    const user = await userModel.findByEmailOrUsername(identifier);
    const valid = await userModel.verifyPassword(user, password);
    if (!user || !valid) {
      return res.status(401).json({ error: 'Incorrect email/username or password.' });
    }

    // "Remember me": 30-day token + persistent cookie. Otherwise a 1-day token in a
    // true browser-session cookie (dropped when the browser closes).
    const remember = Boolean(rememberMe);
    userAuth.setCookie(res, userAuth.sign({ sub: user.id }, remember ? '30d' : '1d'), { remember });

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

/** Self-service profile edit (name / email / username). */
async function updateProfile(req, res, next) {
  try {
    const { name, email, username } = req.body || {};
    const errors = validateProfileFields({ name, email, username });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: Object.values(errors)[0], fieldErrors: errors });
    }
    const user = await userModel.updateUser(req.userId, { name, email, username });
    res.json({ user });
  } catch (err) {
    if (err.code === PRISMA_UNIQUE_VIOLATION) {
      const field = uniqueField(err);
      return res.status(409).json({
        error: field === 'email' ? 'That email is already in use.' : 'That username is already taken.',
        fieldErrors: { [field]: 'Already in use.' },
      });
    }
    if (err.code === 'P2025') {
      userAuth.clearCookie(res);
      return res.status(401).json({ error: 'Session no longer valid.' });
    }
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || !currentPassword) {
      return res.status(400).json({ error: 'Enter your current password.' });
    }
    const problem = validateNewPassword(newPassword);
    if (problem) return res.status(400).json({ error: problem });

    const user = await userModel.findWithHashById(req.userId);
    if (!user) {
      userAuth.clearCookie(res);
      return res.status(401).json({ error: 'Session no longer valid.' });
    }
    if (!(await userModel.verifyPassword(user, currentPassword))) {
      return res.status(401).json({ error: 'Your current password is incorrect.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'Choose a new password different from the current one.' });
    }

    await userModel.setPassword(user.id, newPassword);
    res.json({ ok: true, message: 'Password updated.' });
  } catch (err) {
    next(err);
  }
}

// Same generic response whether or not the email exists, so the endpoint can't be
// used to discover which emails are registered.
const GENERIC_FORGOT_RESPONSE = {
  ok: true,
  message: 'If an account exists for that email, a password reset link has been sent.',
};

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Enter your email address.' });
    }

    const user = await userModel.findByEmail(email);
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await userModel.setResetToken(user.id, {
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      });

      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(user.email)}&token=${rawToken}`;

      // No email provider is configured, so the link is logged server-side instead of
      // emailed. Replace this console.log with a real send (Resend, SendGrid, SES...).
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
    if (typeof email !== 'string' || typeof token !== 'string' || !email || !token) {
      return res.status(400).json({ error: 'This reset link is missing required information.' });
    }
    const problem = validateNewPassword(newPassword);
    if (problem) return res.status(400).json({ error: problem });

    const user = await userModel.findByEmail(email);
    const valid =
      user &&
      user.resetTokenHash &&
      user.resetTokenHash === hashToken(token) &&
      user.resetTokenExpiresAt &&
      new Date(user.resetTokenExpiresAt).getTime() > Date.now();

    if (!valid) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' });
    }

    await userModel.resetPasswordWithToken(user.id, await bcrypt.hash(newPassword, 12));
    res.json({ ok: true, message: 'Password updated. You can now log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  completeOnboarding,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
