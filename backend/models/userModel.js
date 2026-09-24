const bcrypt = require('bcryptjs');
const db = require('../config/database');

/**
 * This starter ships with a single admin account (no public sign-up),
 * seeded from ADMIN_USERNAME / ADMIN_PASSWORD in .env on first startup.
 * The password is hashed before storage - the plaintext is never kept.
 */
async function ensureAdminSeed() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  const existing = await db.getUserByUsername(username);
  if (existing) return;

  if (!password) {
    console.warn(
      '[auth] No ADMIN_PASSWORD set in .env - skipping admin account seed. Set ADMIN_USERNAME and ADMIN_PASSWORD to enable dashboard login.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insertUser({ username, passwordHash, role: 'admin' });
  console.log(`[auth] Seeded admin account "${username}". Change ADMIN_PASSWORD before deploying publicly.`);
}

async function findByUsername(username) {
  return db.getUserByUsername(username);
}

async function verifyPassword(user, password) {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

module.exports = { ensureAdminSeed, findByUsername, verifyPassword };
