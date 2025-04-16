import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    console.log('Processing dashboard stats request');

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (connErr) {
      console.error('Database connection error:', connErr);
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          message: connErr instanceof Error ? connErr.message : 'Unknown connection error',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }
    
    // Wrap all database operations with proper error handling
    const fetchStats = async () => {
      const result = {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        businessUsers: 0,
        totalBusinesses: 0,
        activeBusinesses: 0,
        pendingBusinesses: 0,
        suspendedBusinesses: 0,
        newUsersThisMonth: 0,
        newBusinessesThisMonth: 0,
        totalContent: 0,
        contentCounts: {
          course: 0,
          guide: 0,
          exercise: 0,
          faq: 0
        },
        recentBusinessRegistrations: []
      };

      try {
        // Get total users count
        result.totalUsers = await prisma.user.count();
        console.log('Total users:', result.totalUsers);
      } catch (err) {
        console.error('Error counting users:', err);
      }
      
      try {
        // Get total businesses count
        result.totalBusinesses = await prisma.business.count();
        console.log('Total businesses:', result.totalBusinesses);
      } catch (err) {
        console.error('Error counting businesses:', err);
      }
      
      try {
        // Get active users with case-insensitive query
        result.activeUsers = await prisma.user.count({
          where: {
            OR: [
              { status: 'ACTIVE' },
              { status: 'active' },
              { status: 'Active' }
            ]
          }
        });
        console.log('Active users:', result.activeUsers);
      } catch (err) {
        console.error('Error counting active users:', err);
      }
      
      try {
        // Get active businesses with case-insensitive query
        result.activeBusinesses = await prisma.business.count({
          where: {
            OR: [
              { status: 'ACTIVE' },
              { status: 'active' },
              { status: 'Active' }
            ]
          }
        });
        console.log('Active businesses:', result.activeBusinesses);
      } catch (err) {
        console.error('Error counting active businesses:', err);
      }
      
      try {
        // Get pending businesses with simpler query
        const pendingBusinesses = await prisma.business.findMany({
          where: {
            OR: [
              { status: 'PENDING' },
              { status: 'pending' },
              { status: 'Pending' }
            ]
          }
        });
        result.pendingBusinesses = pendingBusinesses.length;
        console.log('Pending businesses:', result.pendingBusinesses);
      } catch (err) {
        console.error('Error finding pending businesses:', err);
      }
      
      try {
        // Get suspended businesses with simpler query
        const suspendedBusinesses = await prisma.business.findMany({
          where: {
            OR: [
              { status: 'SUSPENDED' },
              { status: 'suspended' },
              { status: 'Suspended' }
            ]
          }
        });
        result.suspendedBusinesses = suspendedBusinesses.length;
        console.log('Suspended businesses:', result.suspendedBusinesses);
      } catch (err) {
        console.error('Error finding suspended businesses:', err);
      }
      
      try {
        // Get admin users 
        result.adminUsers = await prisma.user.count({
          where: {
            OR: [
              { role: 'ADMIN' },
              { role: 'admin' },
              { role: 'Admin' }
            ]
          }
        });
        console.log('Admin users:', result.adminUsers);
      } catch (err) {
        console.error('Error counting admin users:', err);
      }
      
      try {
        // Get business users
        result.businessUsers = await prisma.user.count({
          where: {
            OR: [
              { role: 'BUSINESS' },
              { role: 'business' },
              { role: 'Business' }
            ]
          }
        });
        console.log('Business users:', result.businessUsers);
      } catch (err) {
        console.error('Error counting business users:', err);
      }
      
      try {
        // Get start of month for "new this month" calculations
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        result.newUsersThisMonth = await prisma.user.count({
          where: {
            createdAt: { gte: startOfMonth }
          }
        });
        console.log('New users this month:', result.newUsersThisMonth);
      } catch (err) {
        console.error('Error counting new users this month:', err);
      }
      
      try {
        // Get start of month for "new this month" calculations
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        result.newBusinessesThisMonth = await prisma.business.count({
          where: {
            joinedDate: { gte: startOfMonth }
          }
        });
        console.log('New businesses this month:', result.newBusinessesThisMonth);
      } catch (err) {
        console.error('Error counting new businesses this month:', err);
      }
      
      try {
        // Get total content count
        result.totalContent = await prisma.content.count();
        console.log('Total content:', result.totalContent);
      } catch (err) {
        console.error('Error counting content:', err);
      }
      
      // Get content by type
      const contentTypes = ['COURSE', 'GUIDE', 'EXERCISE', 'FAQ'];
      
      for (const type of contentTypes) {
        try {
          const lowerType = type.toLowerCase();
          const count = await prisma.content.count({
            where: {
              OR: [
                { type: type },
                { type: lowerType },
                { type: type.charAt(0).toUpperCase() + lowerType.slice(1) }
              ]
            }
          });
          result.contentCounts[lowerType] = count;
          console.log(`${type} content:`, count);
        } catch (err) {
          console.error(`Error counting ${type} content:`, err);
        }
      }
      
      try {
        // Get recent business registrations with error handling
        const recentBusinessesQuery = await prisma.business.findMany({
          take: 5,
          orderBy: {
            joinedDate: 'desc'
          },
          include: {
            users: {
              select: {
                id: true
              }
            }
          }
        });
        
        // Safely format joined date and handle optional fields
        result.recentBusinessRegistrations = recentBusinessesQuery.map(business => {
          let formattedDate = '';
          try {
            formattedDate = business.joinedDate ? 
              new Date(business.joinedDate).toISOString().split('T')[0] : 
              'Unknown';
          } catch (err) {
            console.error('Error formatting date for business', business.id, err);
            formattedDate = 'Invalid Date';
          }
          
          return {
            id: business.id || '',
            name: business.name || 'Unnamed Business',
            plan: business.plan || 'No Plan',
            status: business.status || 'Unknown',
            joinedDate: formattedDate,
            userCount: business.users?.length || 0
          };
        });
        console.log('Recent business registrations fetched:', result.recentBusinessRegistrations.length);
      } catch (err) {
        console.error('Error finding recent businesses:', err);
      }
      
      return result;
    };
    
    // Fetch all stats with error handling
    const stats = await fetchStats();
    
    // Log stats for debugging
    console.log('Stats summary calculated successfully');
    
    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: stats.totalUsers,
          active: stats.activeUsers,
          admins: stats.adminUsers,
          business: stats.businessUsers,
          newThisMonth: stats.newUsersThisMonth
        },
        businesses: {
          total: stats.totalBusinesses,
          active: stats.activeBusinesses,
          pending: stats.pendingBusinesses,
          suspended: stats.suspendedBusinesses,
          newThisMonth: stats.newBusinessesThisMonth
        },
        content: {
          total: stats.totalContent,
          courses: stats.contentCounts.course,
          guides: stats.contentCounts.guide,
          exercises: stats.contentCounts.exercise,
          faqs: stats.contentCounts.faq
        }
      },
      recentBusinessRegistrations: stats.recentBusinessRegistrations
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}