'use server';

import { prisma } from '@/lib/prisma';

/**
 * Adds test businesses to the database for debugging
 */
export async function addTestBusinesses() {
  try {
    console.log('Starting to add test businesses for debugging...');
    
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
    
    // Create admin user for businesses
    await prisma.user.create({
      data: {
        name: 'Pending Business Admin',
        email: 'pending@example.com',
        password: 'password123',
        role: 'BUSINESS',
        status: 'ACTIVE',
        businessId: pendingBusiness.id
      }
    });
    
    await prisma.user.create({
      data: {
        name: 'Suspended Business Admin',
        email: 'suspended@example.com',
        password: 'password123',
        role: 'BUSINESS',
        status: 'SUSPENDED',
        businessId: suspendedBusiness.id
      }
    });
    
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
    console.log(allBusinesses);
    
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
    
    return {
      success: true,
      counts: {
        active: activeCount,
        pending: pendingCount,
        suspended: suspendedCount
      }
    };
    
  } catch (error) {
    console.error('Error adding test businesses:', error);
    return { success: false, error: String(error) };
  }
} 