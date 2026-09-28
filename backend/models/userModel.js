const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const PUBLIC_FIELDS = { id: true, name: true, email: true, username: true, hasOnboarded: true, createdAt: true };

async function createUser({ name, email, username, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { name, email: email.toLowerCase(), username: username.toLowerCase(), passwordHash },
    select: PUBLIC_FIELDS,
  });
}

async function findByEmailOrUsername(identifier) {
  const value = identifier.trim().toLowerCase();
  return prisma.user.findFirst({ where: { OR: [{ email: value }, { username: value }] } });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
}

/** Needs the hash, so it returns the full row. Only used for password checks. */
async function findWithHashById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function verifyPassword(user, password) {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

async function markOnboarded(id) {
  return prisma.user.update({ where: { id }, data: { hasOnboarded: true }, select: PUBLIC_FIELDS });
}

async function setPassword(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({ where: { id }, data: { passwordHash }, select: PUBLIC_FIELDS });
}

async function setResetToken(id, { tokenHash, expiresAt }) {
  return prisma.user.update({ where: { id }, data: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt } });
}

async function resetPasswordWithToken(id, newPasswordHash) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash: newPasswordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });
}

/** Partial update - used by both self-service profile edit and admin edit. */
async function updateUser(id, { name, email, username }) {
  return prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(username !== undefined && { username: username.trim().toLowerCase() }),
    },
    select: PUBLIC_FIELDS,
  });
}

async function listUsers({ search, page = 1, pageSize = 20 }) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: PUBLIC_FIELDS,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

async function countUsers() {
  return prisma.user.count();
}

module.exports = {
  createUser,
  findByEmailOrUsername,
  findById,
  findByEmail,
  findWithHashById,
  verifyPassword,
  markOnboarded,
  setPassword,
  setResetToken,
  resetPasswordWithToken,
  updateUser,
  listUsers,
  deleteUser,
  countUsers,
};
