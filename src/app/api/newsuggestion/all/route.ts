import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Suggestion, User, Business } from '@prisma/client';

// Define a type for the suggestion with included relations
type SuggestionWithRelations = Suggestion & {
  user?: { id: string; name: string; email: string } | null;
  business?: { id: string; name: string } | null;
  admin?: { id: string; name: string; email: string } | null;
};

export async function GET(request: Request) {
  try {
    // Get all suggestions with pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Optional filters
    const businessId = url.searchParams.get('businessId');
    const userId = url.searchParams.get('userId');
    
    const queryOptions: any = {
      where: {},
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      // Always include relations to get names
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        business: {
          select: {
            id: true,
            name: true,
          }
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    };
    
    // Apply filters if provided
    if (businessId) {
      queryOptions.where.businessId = businessId;
    }
    
    if (userId) {
      queryOptions.where.userId = userId;
    }
    
    // Get the suggestions with proper typing
    const suggestions = await prisma.suggestion.findMany(queryOptions) as SuggestionWithRelations[];
    
    // Get the total count for pagination
    const totalCount = await prisma.suggestion.count({
      where: queryOptions.where
    });
    
    // Transform the data to include the names directly at the top level
    const transformedSuggestions = suggestions.map(suggestion => ({
      id: suggestion.id,
      questionText: suggestion.questionText,
      answerText: suggestion.answerText,
      suggestionText: suggestion.suggestionText,
      userId: suggestion.userId,
      userName: suggestion.user?.name || 'Unknown User',
      businessId: suggestion.businessId,
      businessName: suggestion.business?.name || 'Unknown Business',
      adminId: suggestion.adminId,
      adminName: suggestion.admin?.name || 'Unknown Admin',
      createdAt: suggestion.createdAt,
      // Include any other fields you need
    }));
    
    return NextResponse.json({
      success: true,
      suggestions: transformedSuggestions,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', details: error.message },
      { status: 500 }
    );
  }
}