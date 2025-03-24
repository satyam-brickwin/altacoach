import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Processing dashboard stats request');
    
    // Debug function to log raw query results
    const logRawResults = async () => {
      console.log('--- Raw Database Query Results ---');
      
      // Check all user roles in the database
      const allUserRoles = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true
        }
      });
      console.log('All users with roles:', allUserRoles);
      
      // Check all business statuses - get detailed view
      const allBusinesses = await prisma.business.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          plan: true,
          joinedDate: true
        }
      });
      
      // Log all business statuses for debugging
      console.log('All businesses with full details:', allBusinesses);
      
      // Count businesses by status
      const businessStatusCounts: Record<string, number> = {};
      allBusinesses.forEach(business => {
        const status = business.status || 'null';
        businessStatusCounts[status] = (businessStatusCounts[status] || 0) + 1;
      });
      console.log('Business counts by status:', businessStatusCounts);
      
      // Check if any businesses have pending or suspended status with any case variation
      const pendingBusinesses = allBusinesses.filter(b => 
        b.status?.toLowerCase().includes('pend'));
      console.log('Businesses with "pending" in status:', pendingBusinesses);
      
      const suspendedBusinesses = allBusinesses.filter(b => 
        b.status?.toLowerCase().includes('suspend'));
      console.log('Businesses with "suspended" in status:', suspendedBusinesses);
    };
    
    // Run raw query logging
    await logRawResults();
    
    // Get total users count
    const totalUsers = await prisma.user.count();
    console.log('Total users:', totalUsers);
    
    // Get total businesses count
    const totalBusinesses = await prisma.business.count();
    console.log('Total businesses:', totalBusinesses);
    
    // Get active users - try all possible case variations
    const activeUsersCount = await prisma.user.count({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: 'active' },
          { status: 'Active' }
        ]
      }
    });
    console.log('Active users:', activeUsersCount);
    
    // Get active businesses - try all possible case variations
    const activeBusinessesCount = await prisma.business.count({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: 'active' },
          { status: 'Active' }
        ]
      }
    });
    console.log('Active businesses:', activeBusinessesCount);
    
    // Get pending businesses - try all possible case variations
    const pendingBusinessesCount = await prisma.business.count({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'pending' },
          { status: 'Pending' }
        ]
      }
    });
    
    // Also try a separate query with regex matching for SQLite
    // Use a direct database count to get more accurate counts
    let pendingSubstringCount = 0;
    
    try {
      // Manually get businesses with status containing "pend" using JavaScript filter
      const pendingPatternBusinesses = await prisma.business.findMany({
        where: {
          OR: [
            { status: { contains: 'pend' } },
            { status: { contains: 'Pend' } },
            { status: { contains: 'PEND' } }
          ]
        }
      });
      
      pendingSubstringCount = pendingPatternBusinesses.length;
      console.log('Pending businesses found with pattern:', pendingSubstringCount);
    } catch (err) {
      console.error('Error counting pending with pattern:', err);
    }
    
    console.log('Pending businesses (exact match):', pendingBusinessesCount);
    console.log('Pending businesses (substring):', pendingSubstringCount);
    
    // Use the maximum count from either approach
    const finalPendingCount = Math.max(pendingBusinessesCount, pendingSubstringCount);
    
    // Get suspended businesses - try all possible case variations
    const suspendedBusinessesCount = await prisma.business.count({
      where: {
        OR: [
          { status: 'SUSPENDED' },
          { status: 'suspended' },
          { status: 'Suspended' }
        ]
      }
    });
    
    // Also try a separate query with regex matching for SQLite
    let suspendedSubstringCount = 0;
    
    try {
      // Manually get businesses with status containing "suspend" using JavaScript filter
      const suspendedPatternBusinesses = await prisma.business.findMany({
        where: {
          OR: [
            { status: { contains: 'suspend' } },
            { status: { contains: 'Suspend' } },
            { status: { contains: 'SUSPEND' } }
          ]
        }
      });
      
      suspendedSubstringCount = suspendedPatternBusinesses.length;
      console.log('Suspended businesses found with pattern:', suspendedSubstringCount);
    } catch (err) {
      console.error('Error counting suspended with pattern:', err);
    }
    
    console.log('Suspended businesses (exact match):', suspendedBusinessesCount);
    console.log('Suspended businesses (substring):', suspendedSubstringCount);
    
    // Use the maximum count from either approach
    const finalSuspendedCount = Math.max(suspendedBusinessesCount, suspendedSubstringCount);
    
    // Get admin users - try all possible case variations
    const adminUsersCount = await prisma.user.count({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'admin' },
          { role: 'Admin' }
        ]
      }
    });
    console.log('Admin users:', adminUsersCount);
    
    // Get business users - try all possible case variations
    const businessUsersCount = await prisma.user.count({
      where: {
        OR: [
          { role: 'BUSINESS' },
          { role: 'business' },
          { role: 'Business' }
        ]
      }
    });
    console.log('Business users:', businessUsersCount);
    
    // Get start of month for "new this month" calculations
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });
    
    // Get new businesses this month
    const newBusinessesThisMonth = await prisma.business.count({
      where: {
        joinedDate: { gte: startOfMonth }
      }
    });
    
    // Get total content count
    const totalContent = await prisma.content.count();
    
    // Get content by type - try all possible case variations
    const courses = await prisma.content.count({
      where: {
        OR: [
          { type: 'COURSE' },
          { type: 'course' },
          { type: 'Course' }
        ]
      }
    });
    
    const guides = await prisma.content.count({
      where: {
        OR: [
          { type: 'GUIDE' },
          { type: 'guide' },
          { type: 'Guide' }
        ]
      }
    });
    
    const exercises = await prisma.content.count({
      where: {
        OR: [
          { type: 'EXERCISE' },
          { type: 'exercise' },
          { type: 'Exercise' }
        ]
      }
    });
    
    const faqs = await prisma.content.count({
      where: {
        OR: [
          { type: 'FAQ' },
          { type: 'faq' },
          { type: 'Faq' }
        ]
      }
    });
    
    // Log stats for debugging
    console.log('Stats summary:', {
      totalUsers,
      activeUsers: activeUsersCount,
      adminUsers: adminUsersCount,
      businessUsers: businessUsersCount,
      totalBusinesses,
      activeBusinesses: activeBusinessesCount,
      pendingBusinesses: finalPendingCount,
      suspendedBusinesses: finalSuspendedCount
    });
    
    // Get recent business registrations
    const recentBusinesses = await prisma.business.findMany({
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
    
    // Map the recent businesses to include user count
    const recentBusinessRegistrations = recentBusinesses.map(business => ({
      id: business.id,
      name: business.name,
      plan: business.plan,
      status: business.status,
      joinedDate: business.joinedDate.toISOString().split('T')[0],
      userCount: business.users.length
    }));
    
    console.log('Stats calculated - returning response');
    
    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsersCount,
          admins: adminUsersCount,
          business: businessUsersCount,
          newThisMonth: newUsersThisMonth
        },
        businesses: {
          total: totalBusinesses,
          active: activeBusinessesCount,
          pending: finalPendingCount,
          suspended: finalSuspendedCount,
          newThisMonth: newBusinessesThisMonth
        },
        content: {
          total: totalContent,
          courses: courses,
          guides: guides,
          exercises: exercises,
          faqs: faqs
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