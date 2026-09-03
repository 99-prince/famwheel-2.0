// ── PRISMA SINGLETON ──────────────────────────────────────────────────────
// Single PrismaClient instance reused across all route files.
// Using global to survive nodemon hot-reloads in dev mode.
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
