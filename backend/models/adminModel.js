const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function findByUsername(username) {
  return prisma.admin.findUnique({ where: { username: username.toLowerCase() } });
}

async function findById(id) {
  return prisma.admin.findUnique({ where: { id }, select: { id: true, username: true, createdAt: true } });
}

async function verifyPassword(admin, password) {
  if (!admin) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

module.exports = { findByUsername, findById, verifyPassword };
