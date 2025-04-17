import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Type to override Prisma types for our models
type PrismaWithModels = PrismaClient & {
  content: any;
};

// Cast prisma to our custom type
const typedPrisma = prisma as unknown as PrismaWithModels;

/**
 * GET /api/admin/content
 * Returns all content items and statistics
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching content from database');
    
    // Fetch content from the database
    try {
      const content = await prisma.document.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      console.log(`Found ${content.length} content items in database`);
      
      // Calculate stats
      const stats = {
        total: await prisma.document.count(),
        courses: await prisma.document.count({ where: { contentType: 'course' } }),
        guides: await prisma.document.count({ where: { contentType: 'guide' } }),
        exercises: await prisma.document.count({ where: { contentType: 'exercise' } }),
        faqs: await prisma.document.count({ where: { contentType: 'faq' } })
      };
      
      return NextResponse.json({ content, stats });
    } catch (dbError) {
      console.error('Database error fetching content:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch content from database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 