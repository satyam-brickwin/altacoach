import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to add test businesses with various statuses...');
    
    // Add a pending business
    const pendingBusiness = await prisma.business.create({
      data: {
        name: 'Test Pending Business',
        plan: 'BASIC',
        status: 'PENDING',
        joinedDate: new Date(),
      }
    });
    console.log('Created pending business:', pendingBusiness);
    
    // Add a suspended business
    const suspendedBusiness = await prisma.business.create({
      data: {
        name: 'Test Suspended Business',
        plan: 'BASIC',
        status: 'SUSPENDED',
        joinedDate: new Date(),
      }
    });
    console.log('Created suspended business:', suspendedBusiness);
    
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
    
  } catch (error) {
    console.error('Error adding test businesses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 