import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const SEED_PASSWORD = 'password123';

async function main() {
  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      name: 'Admin',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Admin',
      email: 'admin@gmail.com',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Admin user seeded: admin@gmail.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
