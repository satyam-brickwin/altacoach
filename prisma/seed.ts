import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting seed script...');

    // Create an admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('Created admin user:', admin);

    // Create businesses with different statuses
    const business1 = await prisma.business.create({
      data: {
        name: 'Acme Corporation',
        plan: 'ENTERPRISE',
        status: 'ACTIVE'
      }
    });

    const business2 = await prisma.business.create({
      data: {
        name: 'Globex Corporation',
        plan: 'PROFESSIONAL',
        status: 'ACTIVE'
      }
    });

    const business3 = await prisma.business.create({
      data: {
        name: 'Wayne Enterprises',
        plan: 'BASIC',
        status: 'ACTIVE'
      }
    });
    
    // Add a PENDING business
    const pendingBusiness = await prisma.business.create({
      data: {
        name: 'Stark Industries',
        plan: 'PROFESSIONAL',
        status: 'PENDING'
      }
    });
    
    // Add a SUSPENDED business
    const suspendedBusiness = await prisma.business.create({
      data: {
        name: 'Umbrella Corporation',
        plan: 'ENTERPRISE',
        status: 'SUSPENDED'
      }
    });

    console.log('Created businesses:', { 
      business1, 
      business2, 
      business3,
      pendingBusiness,
      suspendedBusiness
    });

    // Create business users
    const businessUser1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@acme.com',
        password: await bcrypt.hash('password123', 10),
        role: 'BUSINESS',
        status: 'ACTIVE',
        businessId: business1.id
      }
    });

    const businessUser2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@globex.com',
        password: await bcrypt.hash('password123', 10),
        role: 'BUSINESS',
        status: 'ACTIVE',
        businessId: business2.id
      }
    });

    const businessUser3 = await prisma.user.create({
      data: {
        name: 'Bruce Wayne',
        email: 'bruce@wayne.com',
        password: await bcrypt.hash('password123', 10),
        role: 'BUSINESS',
        status: 'ACTIVE',
        businessId: business3.id
      }
    });
    
    // Create a user for the pending business
    const pendingBusinessUser = await prisma.user.create({
      data: {
        name: 'Tony Stark',
        email: 'tony@stark.com',
        password: await bcrypt.hash('password123', 10),
        role: 'BUSINESS',
        status: 'ACTIVE',
        businessId: pendingBusiness.id
      }
    });
    
    // Create a user for the suspended business
    const suspendedBusinessUser = await prisma.user.create({
      data: {
        name: 'Albert Wesker',
        email: 'wesker@umbrella.com',
        password: await bcrypt.hash('password123', 10),
        role: 'BUSINESS',
        status: 'SUSPENDED',
        businessId: suspendedBusiness.id
      }
    });

    console.log('Created business users:', { 
      businessUser1, 
      businessUser2, 
      businessUser3,
      pendingBusinessUser,
      suspendedBusinessUser
    });

    // Create content
    const content1 = await prisma.content.create({
      data: {
        title: 'Introduction to Alta Coach',
        description: 'Learn the basics of using Alta Coach',
        type: 'COURSE',
        filePath: '/content/intro.pdf',
        businessId: business1.id
      }
    });

    const content2 = await prisma.content.create({
      data: {
        title: 'Advanced Techniques',
        description: 'Master advanced coaching techniques',
        type: 'GUIDE',
        filePath: '/content/advanced.pdf',
        businessId: business1.id
      }
    });

    const content3 = await prisma.content.create({
      data: {
        title: 'Practice Exercise 1',
        description: 'Breathing exercises for beginners',
        type: 'EXERCISE',
        filePath: '/content/exercise1.pdf',
        businessId: business2.id
      }
    });

    const content4 = await prisma.content.create({
      data: {
        title: 'Common Questions',
        description: 'Frequently asked questions',
        type: 'FAQ',
        filePath: '/content/faq.pdf',
        businessId: business3.id
      }
    });

    console.log('Created content:', { content1, content2, content3, content4 });

    // Query all businesses to verify
    const allBusinesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        plan: true,
      }
    });
    
    console.log('All businesses in database:');
    allBusinesses.forEach(business => {
      console.log(`- ${business.name} (${business.status})`);
    });
    
    // Count businesses by status
    const pendingCount = await prisma.business.count({
      where: { status: 'PENDING' }
    });
    
    const suspendedCount = await prisma.business.count({
      where: { status: 'SUSPENDED' }
    });
    
    const activeCount = await prisma.business.count({
      where: { status: 'ACTIVE' }
    });
    
    console.log(`\nBusiness counts by status:`);
    console.log(`- Active: ${activeCount}`);
    console.log(`- Pending: ${pendingCount}`);
    console.log(`- Suspended: ${suspendedCount}`);

    console.log('Seed completed successfully');
  } catch (e) {
    console.error('Error during seeding:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 