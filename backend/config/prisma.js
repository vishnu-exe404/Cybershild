const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient instance (important with --watch / hot reload
// so we don't exhaust the database's connection pool).
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__csapPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__csapPrisma = prisma;
}

module.exports = prisma;
