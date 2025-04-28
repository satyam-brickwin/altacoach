import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');
    const periodType = url.searchParams.get('periodType');
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    
    // Build date filter
    let dateFilter: any = {};
    if (periodType === 'year' && year) {
      const yearNum = parseInt(year);
      dateFilter = {
        gte: new Date(yearNum, 0, 1),
        lte: new Date(yearNum, 11, 31, 23, 59, 59)
      };
    } else if (periodType === 'month' && year && month) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      dateFilter = {
        gte: new Date(yearNum, monthNum - 1, 1),
        lte: new Date(yearNum, monthNum, 0, 23, 59, 59)
      };
    } else if (periodType === 'range' && dateFrom && dateTo) {
      dateFilter = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      };
    } else {
      // Default to current month
      const now = new Date();
      dateFilter = {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      };
    }

    // Build query filters
    const whereClause: any = {
      createdAt: dateFilter
    };

    // Add business filter if specified
    if (businessId) {
      // We need to join with users to filter by business
      // This requires fetching user IDs first
      const businessUsers = await prisma.business_user.findMany({
        where: { business_id: businessId },
        select: { user_id: true }
      });
      
      const userIds = businessUsers.map((bu: { user_id: any; }) => bu.user_id);
      
      if (userIds.length > 0) {
        whereClause.user_id = { in: userIds };
      }
    }

    // Fetch all device info records with filters
    const devices = await prisma.device_info.findMany({
      where: whereClause
    });

    // Process device data to get statistics
    const stats = {
      total: devices.length,
      mobile: 0,
      desktop: 0,
      tablet: 0,
      other: 0
    };

    // Count device types
    devices.forEach(device => {
      try {
        const deviceData = JSON.parse(device.device);
        const deviceType = (deviceData.deviceType || '').toLowerCase();
        
        if (deviceType.includes('mobile')) {
          stats.mobile++;
        } else if (deviceType.includes('desktop')) {
          stats.desktop++;
        } else if (deviceType.includes('tablet')) {
          stats.tablet++;
        } else {
          stats.other++;
        }
      } catch (error) {
        console.error('Error parsing device data:', error);
        stats.other++;
      }
    });

    // Calculate percentages
    const percentages = {
      mobile: stats.total > 0 ? Math.round((stats.mobile / stats.total) * 100) : 0,
      desktop: stats.total > 0 ? Math.round((stats.desktop / stats.total) * 100) : 0,
      tablet: stats.total > 0 ? Math.round((stats.tablet / stats.total) * 100) : 0,
      other: stats.total > 0 ? Math.round((stats.other / stats.total) * 100) : 0
    };

    // Ensure percentages sum to 100%
    const totalPercentage = percentages.mobile + percentages.desktop + percentages.tablet + percentages.other;
    if (totalPercentage !== 100 && stats.total > 0) {
      // Adjust the largest category to make total 100%
      const largest = Object.entries(percentages).reduce(
        (max, [key, value]) => value > max.value ? { key, value } : max, 
        { key: '', value: 0 }
      );
      
      if (largest.key) {
        percentages[largest.key as keyof typeof percentages] += (100 - totalPercentage);
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      percentages
    });
  } catch (error) {
    console.error('Error fetching device statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device statistics', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}