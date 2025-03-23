import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function addAdmin() {
  try {
    console.log('Creating new admin user...');

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@altacoach.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'admin@altacoach.com',
        name: 'Admin User',
        password: 'admin123', // In a real app, this would be hashed
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('Created admin user:', adminUser);
    console.log('\nAdmin credentials:');
    console.log('Email: admin@altacoach.com');
    console.log('Password: admin123');
    console.log('\nYou can now log in to the admin dashboard with these credentials.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin(); 