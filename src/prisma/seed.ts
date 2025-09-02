import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminEmail = 'admin@thynetwork.com';
  const adminPin = 'adminPass';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPin, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'Admin',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });