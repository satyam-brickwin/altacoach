import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define UserRole enum manually based on your Prisma schema
enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS = 'BUSINESS',
  USER = 'USER'
}

// Define roles to exclude from regular user counts
const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export async function GET(request: NextRequest) {
  try {
    console.log('Processing dashboard stats request with filters');

    // --- Read Query Parameters ---
    const { searchParams } = new URL(request.url);
    const businessesParam = searchParams.get('businesses');
    const businessIds = businessesParam ? businessesParam.split(',').filter(id => id.trim() !== '') : null;

    const periodType = searchParams.get('periodType');
    const selectedYear = searchParams.get('year');
    const selectedMonth = searchParams.get('month');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');

    console.log('Filtering by business IDs:', businessIds);
    console.log(`Filtering by period: ${periodType}, Year: ${selectedYear}, Month: ${selectedMonth}, From: ${dateFromParam}, To: ${dateToParam}`);

    // --- Build Base Where Clauses ---
    const baseUserWhere: any = {
      role: {
        notIn: ADMIN_ROLES.map(role => role).concat(ADMIN_ROLES.map(role => role.toLowerCase()))
      }
    };

    const baseActiveUserWhere: any = {
      AND: [
        {
          status: {
            in: ['ACTIVE', 'active', 'Active'],
            mode: 'insensitive'
          }
        },
        {
          role: {
            notIn: ADMIN_ROLES.map(role => role).concat(ADMIN_ROLES.map(role => role.toLowerCase()))
          }
        }
      ]
    };

    // --- Apply Business Filter if Provided ---
    if (businessIds && businessIds.length > 0) {
      const businessFilter = {
        businesses: {
          some: {
            businessId: {
              in: businessIds
            }
          }
        }
      };
      
      // Add business filter using AND clause
      if (!baseUserWhere.AND) baseUserWhere.AND = [];
      baseUserWhere.AND.push(businessFilter);

      // baseActiveUserWhere already has AND
      baseActiveUserWhere.AND.push(businessFilter);
    }

    // --- Construct Date Filter ---
    let dateFilter = {};
    const now = new Date();
    let startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1); // Default start: current month
    let endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Default end: current month

    if (periodType === 'year' && selectedYear) {
      const year = parseInt(selectedYear, 10);
      if (!isNaN(year)) {
        startOfPeriod = new Date(year, 0, 1); // Jan 1st of year
        endOfPeriod = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31st of year
        dateFilter = { gte: startOfPeriod, lte: endOfPeriod };
      }
    } else if (periodType === 'month' && selectedYear && selectedMonth) {
      const year = parseInt(selectedYear, 10);
      const month = parseInt(selectedMonth, 10) - 1; // JS months are 0-indexed
      if (!isNaN(year) && !isNaN(month)) {
        startOfPeriod = new Date(year, month, 1);
        endOfPeriod = new Date(year, month + 1, 0, 23, 59, 59, 999); // End of selected month
        dateFilter = { gte: startOfPeriod, lte: endOfPeriod };
      }
    } else if (periodType === 'range' && dateFromParam && dateToParam) {
      const dateFrom = new Date(dateFromParam);
      const dateTo = new Date(dateToParam);
      // Set time to end of the day for dateTo
      dateTo.setHours(23, 59, 59, 999);
      if (!isNaN(dateFrom.getTime()) && !isNaN(dateTo.getTime())) {
        startOfPeriod = dateFrom;
        endOfPeriod = dateTo;
        dateFilter = { gte: startOfPeriod, lte: endOfPeriod };
      }
    } else {
      // Default to current month (already set)
      dateFilter = { gte: startOfPeriod, lte: endOfPeriod };
    }
    console.log('Applied date filter:', dateFilter);

    // --- Apply Date Filter to Base User Queries ---
    // Add the date filter to the base clauses to filter *all* user counts by date
    const dateFilterClause = { createdAt: dateFilter };

    if (!baseUserWhere.AND) baseUserWhere.AND = [];
    baseUserWhere.AND.push(dateFilterClause);

    // baseActiveUserWhere already has AND
    baseActiveUserWhere.AND.push(dateFilterClause);

    // Where clause for *new* users/businesses within the period (already correct)
    const newUsersWhere = { ...baseUserWhere }; // Already includes role, business, and date filters
    const newBusinessesWhere = { createdAt: dateFilter };

    // Simplified stats collection object
    let stats = {
      users: {
        total: 0, // Will be filtered by business AND date
        activeRegularFiltered: 0, // Will be filtered by business, status, AND date
        admins: 0, // Unfiltered admin count
        superAdmins: 0, // Unfiltered super admin count
        regular: 0, // Will be same as total (filtered by business AND date)
        business: 0, // Will be filtered by business AND date
        newThisPeriod: 0 // Filtered by business AND date (within the period)
      },
      businesses: {
        total: 0, // Unfiltered total businesses
        active: 0, // Unfiltered active businesses
        pending: 0, // Unfiltered pending businesses
        suspended: 0, // Unfiltered suspended businesses
        newThisPeriod: 0 // Businesses created within the date period
      },
      content: {
        total: 0, courses: 0, guides: 0, exercises: 0, faqs: 0 // Unfiltered content stats
      }
    };

    // --- User stats with filtering ---
    try {
      // Get total users count (filtered by business AND date)
      stats.users.total = await prisma.user.count({ where: baseUserWhere });
      console.log(`Filtered total users (Period: ${JSON.stringify(dateFilter)}, Businesses: ${businessIds ? businessIds.join(',') : 'All'}):`, stats.users.total);

      // Get active users (filtered by business, status, AND date)
      stats.users.activeRegularFiltered = await prisma.user.count({ where: baseActiveUserWhere });
      console.log(`Filtered active users (Period: ${JSON.stringify(dateFilter)}, Businesses: ${businessIds ? businessIds.join(',') : 'All'}):`, stats.users.activeRegularFiltered);

      // Regular users count (same as total)
      stats.users.regular = stats.users.total;
      console.log(`Filtered regular users (Period: ${JSON.stringify(dateFilter)}, Businesses: ${businessIds ? businessIds.join(',') : 'All'}):`, stats.users.regular);

      // Get new regular users this period (uses newUsersWhere which is baseUserWhere + createdAt)
      stats.users.newThisPeriod = await prisma.user.count({ where: newUsersWhere });
      console.log(`Filtered new users this period (Period: ${JSON.stringify(dateFilter)}, Businesses: ${businessIds ? businessIds.join(',') : 'All'}):`, stats.users.newThisPeriod);

      // Admin/SuperAdmin counts (unfiltered by date/business)
      stats.users.admins = await prisma.user.count({ where: { role: { in: ['ADMIN', 'admin', 'Admin'] } } });
      stats.users.superAdmins = await prisma.user.count({ where: { role: { in: ['SUPER_ADMIN', 'super_admin', 'Super_Admin', 'superAdmin', 'SuperAdmin'] } } });
      console.log('Admin users (unfiltered):', stats.users.admins);
      console.log('Super admin users (unfiltered):', stats.users.superAdmins);

      // Business role users count (filtered by business AND date)
      const businessUserWhere = { 
        ...baseUserWhere, 
        role: { in: ['BUSINESS', 'business', 'Business'] } 
      }; 
      stats.users.business = await prisma.user.count({ where: businessUserWhere });
      console.log(`Filtered business role users (Period: ${JSON.stringify(dateFilter)}, Businesses: ${businessIds ? businessIds.join(',') : 'All'}):`, stats.users.business);

    } catch (err) {
      console.error('Error getting filtered user stats:', err);
    }

    // --- Business stats ---
    // Business stats remain unfiltered by default, except for 'newThisPeriod'
    try {
      const businessWhereClause: any = {}; // No business ID or date filter by default

      stats.businesses.total = await prisma.business.count({ where: businessWhereClause });
      stats.businesses.active = await prisma.business.count({
        where: { ...businessWhereClause, status: { in: ['ACTIVE', 'active', 'Active'], mode: 'insensitive' } }
      });
      stats.businesses.pending = await prisma.business.count({
        where: { ...businessWhereClause, status: { contains: 'pend', mode: 'insensitive' } }
      });
      stats.businesses.suspended = await prisma.business.count({
        where: { ...businessWhereClause, status: { contains: 'suspend', mode: 'insensitive' } }
      });

      // Get new businesses this period (filtered only by date)
      stats.businesses.newThisPeriod = await prisma.business.count({ where: newBusinessesWhere });
      console.log(`New businesses this period (Period: ${JSON.stringify(dateFilter)}):`, stats.businesses.newThisPeriod);
    } catch (err) {
      console.error('Error getting business stats:', err);
    }

    // --- Document stats (Unfiltered) ---
    try {
      // Adjust to use Document model instead of Content since schema has changed
      stats.content.total = await prisma.document.count();
      stats.content.courses = await prisma.document.count({ 
        where: { contentType: { in: ['COURSE', 'course', 'Course'], mode: 'insensitive' } } 
      });
      stats.content.guides = await prisma.document.count({ 
        where: { contentType: { in: ['GUIDE', 'guide', 'Guide'], mode: 'insensitive' } } 
      });
      stats.content.exercises = await prisma.document.count({ 
        where: { contentType: { in: ['EXERCISE', 'exercise', 'Exercise'], mode: 'insensitive' } } 
      });
      stats.content.faqs = await prisma.document.count({ 
        where: { contentType: { in: ['FAQ', 'faq', 'Faq'], mode: 'insensitive' } } 
      });
    } catch (err) {
      console.error('Error getting document stats:', err);
    }

    // --- Recent business registrations (Unfiltered) ---
    let recentBusinessRegistrations = [];
    try {
      const recentBusinesses = await prisma.business.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          // Efficiently count users per business
          _count: { select: { users: true } }
        }
      });

      recentBusinessRegistrations = recentBusinesses.map(business => ({
        id: business.id || '',
        name: business.name || 'Unknown Business',
        status: (business.status || 'unknown').toLowerCase(),
        joinedDate: business.createdAt instanceof Date ? business.createdAt.toISOString().split('T')[0] : 'Unknown',
        userCount: business._count?.users ?? 0, // Use the count relation
      }));
      console.log('Processed recent business registrations:', recentBusinessRegistrations);
    } catch (err) {
      console.error('Error getting recent business registrations:', err);
    }

    // --- Business/Language Active User Percentage (Apply Business Filter Here) ---
    // This section needs to fetch users based on the *active* user criteria *within the date range*
    // if we want the percentages to also reflect the date filter.
    let businessActiveUserStats: Array<{ id: string, name: string, activeUserCount: number, percent: number }> = [];
    let languageActiveUserStats: Array<{ language: string, activeUserCount: number, percent: number }> = [];

    try {
      // Base query to get businesses, potentially filtered by ID
      const businessQueryBase: any = {
        select: {
          id: true,
          name: true,
          users: { // Select related BusinessUser records
            select: {
              user: { // Select the actual User from BusinessUser
                select: {
                  id: true,
                  status: true,
                  language: true,
                  createdAt: true, // Need createdAt to filter by date
                  role: true // Need role to exclude admins if necessary
                }
              }
            },
            // Filter BusinessUser records for active users *within the date range*
            where: {
              user: {
                status: { in: ['ACTIVE', 'active', 'Active'], mode: 'insensitive' },
                createdAt: dateFilter, // Apply date filter here
                role: { notIn: ADMIN_ROLES.map(role => role).concat(ADMIN_ROLES.map(role => role.toLowerCase())) } // Ensure admins are excluded
              }
            }
          }
        }
      };

      // Apply business ID filter if provided
      if (businessIds && businessIds.length > 0) {
        businessQueryBase.where = {
          id: {
            in: businessIds
          }
        };
      }

      const businessesForPercentage = await prisma.business.findMany(businessQueryBase);

      // Calculate active user counts per business and total *within the filtered set and date range*
      let totalActiveUsersInSet = 0;
      const languageCounts: Record<string, number> = {};

      businessActiveUserStats = businessesForPercentage.map(biz => {
        // Users are pre-filtered by active status and date range in the query above
        const activeUserCount = biz.users.length; // Count the pre-filtered users

        biz.users.forEach(bu => {
          if (bu.user) { // User should exist due to pre-filtering
            // Aggregate language counts
            const lang = bu.user.language || 'Unknown';
            languageCounts[lang] = (languageCounts[lang] || 0) + 1;
          }
        });

        totalActiveUsersInSet += activeUserCount;
        return {
          id: biz.id,
          name: biz.name,
          activeUserCount,
          percent: 0 // will fill below
        };
      });

      // Now fill in the percent for each business based on the total *within the filtered set and date range*
      businessActiveUserStats = businessActiveUserStats.map(biz => ({
        ...biz,
        percent: totalActiveUsersInSet > 0 ? Math.round((biz.activeUserCount / totalActiveUsersInSet) * 100) : 0
      }));

      // Calculate language percentages based on the total *within the filtered set and date range*
      languageActiveUserStats = Object.entries(languageCounts).map(([language, activeUserCount]) => ({
        language,
        activeUserCount,
        percent: totalActiveUsersInSet > 0 ? Math.round((activeUserCount / totalActiveUsersInSet) * 100) : 0
      }));

    } catch (err) {
      console.error('Error calculating filtered business/language active user stats:', err);
    }

    console.log('Stats calculated - returning response');

    return NextResponse.json({
      success: true,
      stats, // Contains user stats filtered by business AND date
      recentBusinessRegistrations, // Unfiltered recent businesses
      businessActiveUserStats, // Active users per business (filtered set AND date)
      languageActiveUserStats // Active users per language (filtered set AND date)
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