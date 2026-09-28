require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function main() {
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn(
      '[seed] ADMIN_USERNAME / ADMIN_PASSWORD not set in .env - skipping admin seed. ' +
        'Set them and re-run "npm run prisma:seed" to create the admin account.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { username },
    update: {}, // never overwrite an existing admin's password via re-seed
    create: { username, passwordHash },
  });

  console.log(`[seed] Admin account ready: ${admin.username}`);
}

main()
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
