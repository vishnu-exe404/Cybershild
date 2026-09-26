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
  const value = identifier.toLowerCase();
  return prisma.user.findFirst({ where: { OR: [{ email: value }, { username: value }] } });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
}

async function verifyPassword(user, password) {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

async function markOnboarded(id) {
  return prisma.user.update({ where: { id }, data: { hasOnboarded: true }, select: PUBLIC_FIELDS });
}

/** Admin user-management helpers */
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

async function updateUser(id, { name, email, username }) {
  return prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: email.toLowerCase() }),
      ...(username !== undefined && { username: username.toLowerCase() }),
    },
    select: PUBLIC_FIELDS,
  });
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
  verifyPassword,
  markOnboarded,
  listUsers,
  updateUser,
  deleteUser,
  countUsers,
};
