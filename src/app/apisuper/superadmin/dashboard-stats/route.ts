import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching dashboard statistics...');
    
    // Get total users count
    const totalUsers = await prisma.user.count();
    console.log('Total users:', totalUsers);
    
    // Get total businesses count
    const totalBusinesses = await prisma.business.count();
    console.log('Total businesses:', totalBusinesses);
    
    // Get active users (status = 'ACTIVE')
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });
    console.log('Active users:', activeUsers);
    
    // Get admin users (role = 'ADMIN')
    const adminUsers = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    console.log('Admin users:', adminUsers);
    
    // Get business users (role = 'BUSINESS')
    const businessUsers = await prisma.user.count({
      where: { role: 'BUSINESS' }
    });
    console.log('Business users:', businessUsers);
    
    // Get active businesses (status = 'ACTIVE')
    const activeBusinesses = await prisma.business.count({
      where: { status: 'ACTIVE' }
    });
    console.log('Active businesses:', activeBusinesses);
    
    // Get pending businesses (status = 'PENDING')
    const pendingBusinesses = await prisma.business.count({
      where: { status: 'PENDING' }
    });
    console.log('Pending businesses:', pendingBusinesses);
    
    // Get suspended businesses (status = 'SUSPENDED')
    const suspendedBusinesses = await prisma.business.count({
      where: { status: 'SUSPENDED' }
    });
    console.log('Suspended businesses:', suspendedBusinesses);
    
    // Log all business statuses for debugging
    const allBusinesses = await prisma.business.findMany({
      select: { id: true, name: true, status: true }
    });
    console.log('All businesses with statuses:', JSON.stringify(allBusinesses, null, 2));
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });
    console.log('New users this month:', newUsersThisMonth);
    
    // Get new businesses this month
    const newBusinessesThisMonth = await prisma.business.count({
      where: {
        joinedDate: { gte: startOfMonth }
      }
    });
    console.log('New businesses this month:', newBusinessesThisMonth);
    
    // Get total content count
    const totalContent = await prisma.content.count();
    console.log('Total content:', totalContent);
    
    // Get recent business registrations
    const recentBusinessRegistrations = await prisma.business.findMany({
      take: 5,
      orderBy: { joinedDate: 'desc' },
      select: {
        id: true,
        name: true,
        joinedDate: true,
        status: true
      }
    });
    console.log('Recent business registrations:', recentBusinessRegistrations);
    
    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          admins: adminUsers,
          business: businessUsers
        },
        businesses: {
          total: totalBusinesses,
          active: activeBusinesses,
          pending: pendingBusinesses,
          suspended: suspendedBusinesses,
          newThisMonth: newBusinessesThisMonth
        },
        content: {
          total: totalContent
        }
      },
      recentBusinessRegistrations
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 