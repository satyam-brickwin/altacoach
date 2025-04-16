import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Processing dashboard stats request');
    
    // Debug function to log raw query results
    const logRawResults = async () => {
      try {
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
        
        // Check all business statuses - get detailed view with safer field selection
        const allBusinesses = await prisma.business.findMany({
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
            // Removed startDate as it might not exist in all schemas
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
      } catch (err) {
        console.error('Error in logRawResults:', err);
        // Continue execution even if this debug function fails
      }
    };
    
    // Run raw query logging but don't fail if it errors
    await logRawResults().catch(err => console.error('Failed in debug logging:', err));
    
    // Simplified stats collection with error handling for each section
    let stats = {
      users: {
        total: 0,
        active: 0,
        admins: 0,
        superAdmins: 0,
        regular: 0,
        business: 0,
        newThisMonth: 0
      },
      businesses: {
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        newThisMonth: 0
      },
      content: {
        total: 0,
        courses: 0,
        guides: 0,
        exercises: 0,
        faqs: 0
      }
    };
    
    // User stats with error handling
    try {
      // Get total users count - only count regular users
      // Exclude admin and super admin roles
      stats.users.total = await prisma.user.count({
        where: {
          role: {
            notIn: ['ADMIN', 'admin', 'Admin', 'SUPER_ADMIN', 'super_admin', 'Super_Admin', 'superAdmin', 'SuperAdmin']
          }
        }
      });
      console.log('Total users (excluding admins):', stats.users.total);
      
      // Get active users - only count regular users
      stats.users.active = await prisma.user.count({
        where: {
          AND: [
            {
              OR: [
                { status: 'ACTIVE' },
                { status: 'active' },
                { status: 'Active' }
              ]
            },
            {
              role: {
                notIn: ['ADMIN', 'admin', 'Admin', 'SUPER_ADMIN', 'super_admin', 'Super_Admin', 'superAdmin', 'SuperAdmin']
              }
            }
          ]
        }
      });
      console.log('Active users (excluding admins):', stats.users.active);
      
      // Still track admin counts for reference but don't include in totals
      stats.users.admins = await prisma.user.count({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'admin' },
            { role: 'Admin' }
          ]
        }
      });
      console.log('Admin users (not included in total):', stats.users.admins);
      
      // Get super admin users count
      stats.users.superAdmins = await prisma.user.count({
        where: {
          OR: [
            { role: 'SUPER_ADMIN' },
            { role: 'super_admin' },
            { role: 'Super_Admin' },
            { role: 'superAdmin' },
            { role: 'SuperAdmin' }
          ]
        }
      });
      console.log('Super admin users (not included in total):', stats.users.superAdmins);
      
      // Get regular users by excluding admin roles - should match total now
      stats.users.regular = stats.users.total;
      console.log('Regular users:', stats.users.regular);
      
      // Get business users count
      stats.users.business = await prisma.user.count({
        where: {
          OR: [
            { role: 'BUSINESS' },
            { role: 'business' },
            { role: 'Business' }
          ]
        }
      });
      console.log('Business users:', stats.users.business);
      
      // Get new regular users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      stats.users.newThisMonth = await prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth },
          role: {
            notIn: ['ADMIN', 'admin', 'Admin', 'SUPER_ADMIN', 'super_admin', 'Super_Admin', 'superAdmin', 'SuperAdmin']
          }
        }
      });
      console.log('New regular users this month:', stats.users.newThisMonth);
    } catch (err) {
      console.error('Error getting user stats:', err);
      // Continue with other stats sections
    }
    
    // Business stats with error handling
    try {
      // Get total businesses count
      stats.businesses.total = await prisma.business.count();
      console.log('Total businesses:', stats.businesses.total);
      
      // Get active businesses count
      stats.businesses.active = await prisma.business.count({
        where: {
          OR: [
            { status: 'ACTIVE' },
            { status: 'active' },
            { status: 'Active' }
          ]
        }
      });
      console.log('Active businesses:', stats.businesses.active);
      
      // Get pending businesses count
      let pendingBusinessesCount = await prisma.business.count({
        where: {
          OR: [
            { status: 'PENDING' },
            { status: 'pending' },
            { status: 'Pending' }
          ]
        }
      });
      
      // Also try with contains for more flexible matching
      let pendingSubstringCount = 0;
      try {
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
      } catch (error) {
        console.error('Error with pending pattern matching:', error);
      }
      
      stats.businesses.pending = Math.max(pendingBusinessesCount, pendingSubstringCount);
      console.log('Pending businesses:', stats.businesses.pending);
      
      // Get suspended businesses count
      let suspendedBusinessesCount = await prisma.business.count({
        where: {
          OR: [
            { status: 'SUSPENDED' },
            { status: 'suspended' },
            { status: 'Suspended' }
          ]
        }
      });
      
      // Also try with contains for more flexible matching
      let suspendedSubstringCount = 0;
      try {
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
      } catch (error) {
        console.error('Error with suspended pattern matching:', error);
      }
      
      stats.businesses.suspended = Math.max(suspendedBusinessesCount, suspendedSubstringCount);
      console.log('Suspended businesses:', stats.businesses.suspended);
      
      // Get new businesses this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      stats.businesses.newThisMonth = await prisma.business.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      });
      console.log('New businesses this month:', stats.businesses.newThisMonth);
    } catch (err) {
      console.error('Error getting business stats:', err);
      // Continue with other stats sections
    }
    
    // Content stats with error handling
    try {
      // Get total content count
      stats.content.total = await prisma.content.count();
      console.log('Total content:', stats.content.total);
      
      // Get content by type
      stats.content.courses = await prisma.content.count({
        where: {
          OR: [
            { type: 'COURSE' },
            { type: 'course' },
            { type: 'Course' }
          ]
        }
      });
      console.log('Courses:', stats.content.courses);
      
      stats.content.guides = await prisma.content.count({
        where: {
          OR: [
            { type: 'GUIDE' },
            { type: 'guide' },
            { type: 'Guide' }
          ]
        }
      });
      console.log('Guides:', stats.content.guides);
      
      stats.content.exercises = await prisma.content.count({
        where: {
          OR: [
            { type: 'EXERCISE' },
            { type: 'exercise' },
            { type: 'Exercise' }
          ]
        }
      });
      console.log('Exercises:', stats.content.exercises);
      
      stats.content.faqs = await prisma.content.count({
        where: {
          OR: [
            { type: 'FAQ' },
            { type: 'faq' },
            { type: 'Faq' }
          ]
        }
      });
      console.log('FAQs:', stats.content.faqs);
    } catch (err) {
      console.error('Error getting content stats:', err);
      // Continue with other stats sections
    }
    
    // Recent business registrations with error handling
    let recentBusinessRegistrations = [];
    try {
      // More detailed query to get all necessary business fields
      const recentBusinesses = await prisma.business.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          users: true, // Get full user data for more accurate counting
          // Add any additional relations you might need
        }
      });
      
      // Log the full business data for debugging
      console.log('Recent businesses raw data:', JSON.stringify(recentBusinesses, null, 2));
      
      // Convert createdAt date to ISO string for display
      recentBusinessRegistrations = recentBusinesses.map(business => {
        // Calculate user count properly
        const userCount = Array.isArray(business.users) ? business.users.length : 0;
        
        // Ensure proper string formatting for dates
        let joinedDate = '';
        try {
          joinedDate = business.createdAt instanceof Date 
            ? business.createdAt.toISOString().split('T')[0] 
            : String(business.createdAt).split('T')[0];
        } catch (e) {
          console.error('Error formatting date for business:', business.id, e);
          joinedDate = 'Unknown';
        }
        
        return {
          id: business.id || '',
          name: business.name || 'Unknown Business',
          status: (business.status || 'unknown').toLowerCase(),
          joinedDate: joinedDate,
          userCount: userCount,
          // Include raw timestamps for debugging
          _debug: {
            createdAt: business.createdAt,
            rawUserCount: userCount
          }
        };
      });
      
      // Log the processed registrations for debugging
      console.log('Processed business registrations:', recentBusinessRegistrations);
    } catch (err) {
      console.error('Error getting recent business registrations:', err);
      // Continue without this data but provide error details
      console.error('Full error details:', err instanceof Error ? err.stack : String(err));
    }
    
    console.log('Stats calculated - returning response');
    
    return NextResponse.json({
      success: true,
      stats,
      recentBusinessRegistrations
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
      },
      { status: 500 }
    );
  }
}