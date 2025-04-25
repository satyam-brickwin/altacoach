import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodType = searchParams.get('periodType') || '';
    const businessesParam = searchParams.get('businesses') || '';
    
    // Default to current month if no period specified
    const currentDate = new Date();
    let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Parse period filters
    if (periodType === 'year') {
      const year = parseInt(searchParams.get('year') || currentDate.getFullYear().toString());
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 12, 0);
    } else if (periodType === 'month') {
      const year = parseInt(searchParams.get('year') || currentDate.getFullYear().toString());
      const month = parseInt(searchParams.get('month') || (currentDate.getMonth() + 1).toString());
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else if (periodType === 'range') {
      const fromDate = searchParams.get('dateFrom');
      const toDate = searchParams.get('dateTo');
      
      if (fromDate) startDate = new Date(fromDate);
      if (toDate) endDate = new Date(toDate);
    }
    
    console.log('Date range for chat duration:', { startDate, endDate });
    
    // Parse business filters
    const businessIds: string[] = businessesParam ? businessesParam.split(',') : [];
    
    // First, get all users associated with the specified businesses
    const businessUsers = await prisma.businessUser.findMany({
      where: businessIds.length > 0 ? {
        businessId: { in: businessIds }
      } : {},
      select: {
        userId: true,
        businessId: true,
        business: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Create a map of user IDs to business IDs
    const userBusinessMap = new Map<string, { businessId: string, businessName: string }>();
    businessUsers.forEach(bu => {
      userBusinessMap.set(bu.userId, { 
        businessId: bu.businessId, 
        businessName: bu.business.name 
      });
    });
    
    // Get a list of all relevant user IDs
    const userIds = Array.from(userBusinessMap.keys());
    
    // Query all chats for these users within the date range
    const chats = await prisma.chats.findMany({
      where: {
        user_id: { in: userIds.length > 0 ? userIds : undefined },
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        chat_history: true
      }
    });
    
    console.log(`Found ${chats.length} chats for analysis`);
    
    // Initialize data structures for calculations
    const businessChatStats: Record<string, {
      businessId: string,
      businessName: string,
      totalChats: number,
      totalMessages: number, 
      totalDurationMinutes: number,
      averageDurationMinutes: number,
      usersCount: number,
    }> = {};
    
    let totalDurationMinutes = 0;
    let totalChats = 0;
    const businessUserCounts = new Map<string, Set<string>>();
    
    // Process each chat
    for (const chat of chats) {
      if (!chat.user_id) continue;
      
      const businessInfo = userBusinessMap.get(chat.user_id);
      if (!businessInfo) continue; // Skip users not associated with any business or filtered business
      
      const { businessId, businessName } = businessInfo;
      
      // Initialize business stats if not present
      if (!businessChatStats[businessId]) {
        businessChatStats[businessId] = {
          businessId,
          businessName,
          totalChats: 0,
          totalMessages: 0,
          totalDurationMinutes: 0,
          averageDurationMinutes: 0,
          usersCount: 0
        };
        businessUserCounts.set(businessId, new Set());
      }
      
      // Track unique users per business
      businessUserCounts.get(businessId)?.add(chat.user_id);
      
      // Count messages in this chat
      const messageCount = chat.chat_history.length;
      
      // Skip chats with no messages
      if (messageCount === 0) continue;
      
      // Calculate duration based on first and last message
      let chatDurationMinutes = 0;
      if (messageCount > 1) {
        const sortedMessages = [...chat.chat_history].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const firstMessageTime = new Date(sortedMessages[0].created_at).getTime();
        const lastMessageTime = new Date(sortedMessages[sortedMessages.length - 1].created_at).getTime();
        
        // Calculate duration in minutes
        chatDurationMinutes = (lastMessageTime - firstMessageTime) / (1000 * 60);
        
        // Cap very long durations (e.g., more than 2 hours is probably not an active chat)
        if (chatDurationMinutes > 120) chatDurationMinutes = 15; // Default to 15 minutes for inactive periods
        
        // Add estimated time for reading the last message
        chatDurationMinutes += 1;
      } else {
        // If only one message, assume a short duration
        chatDurationMinutes = 2;
      }
      
      // Update business stats
      businessChatStats[businessId].totalChats += 1;
      businessChatStats[businessId].totalMessages += messageCount;
      businessChatStats[businessId].totalDurationMinutes += chatDurationMinutes;
      
      // Update overall totals
      totalDurationMinutes += chatDurationMinutes;
      totalChats += 1;
    }
    
    // Calculate averages and finalize stats
    let overallAverageDurationMinutes = 0;
    
    if (totalChats > 0) {
      overallAverageDurationMinutes = totalDurationMinutes / totalChats;
    }
    
    // Convert business stats object to array and calculate averages
    const businessChatStatsArray = Object.values(businessChatStats).map(stats => {
      // Update user count
      stats.usersCount = businessUserCounts.get(stats.businessId)?.size || 0;
      
      // Calculate average duration
      if (stats.totalChats > 0) {
        stats.averageDurationMinutes = stats.totalDurationMinutes / stats.totalChats;
      }
      
      return stats;
    });
    
    // If no data is found, return some default information
    if (businessChatStatsArray.length === 0 && totalChats === 0) {
      return NextResponse.json({
        success: true,
        totalChats: 0,
        totalDurationMinutes: 0,
        averageDurationMinutes: 0,
        businessChatStats: []
      });
    }
    
    // Sort businesses by total duration (descending)
    businessChatStatsArray.sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
    
    return NextResponse.json({
      success: true,
      totalChats,
      totalDurationMinutes,
      averageDurationMinutes: overallAverageDurationMinutes,
      businessChatStats: businessChatStatsArray
    });
    
  } catch (error) {
    console.error('Error fetching chat duration statistics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve chat duration statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
      totalChats: 0,
      totalDurationMinutes: 0,
      averageDurationMinutes: 0,
      businessChatStats: []
    }, { status: 500 });
  }
}