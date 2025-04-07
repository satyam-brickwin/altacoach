import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Type to override Prisma types for our models
type PrismaWithModels = PrismaClient & {
  content: any;
};

// Cast prisma to our custom type
const typedPrisma = prisma as unknown as PrismaWithModels;

// GET a single content item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;
    
    const content = await typedPrisma.content.findUnique({
      where: {
        id: contentId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/admin/content/[id]
 * Deletes a content item by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }
    
    // For now, just return success as we haven't implemented the Content model yet
    // In a real implementation, we would:
    // 1. Find the content record
    // 2. Delete the file from storage
    // 3. Delete the content record from the database
    
    // Mock content lookup
    const mockContent = [
      {
        id: '1',
        filePath: '/storage/content/sales-training.pdf',
      },
      {
        id: '2',
        filePath: '/storage/content/customer-service-guide.pdf',
      },
      {
        id: '3',
        filePath: '/storage/content/product-knowledge.pdf',
      },
      {
        id: '4',
        filePath: '/storage/content/customer-faq.pdf',
      },
      {
        id: '5',
        filePath: '/storage/content/business-development.pdf',
      }
    ];
    
    const contentToDelete = mockContent.find(item => item.id === id);
    
    if (!contentToDelete) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Simulate successful deletion
    return NextResponse.json({ 
      success: true,
      message: 'Content deleted successfully'
    });
    
    /* 
    // For future implementation with actual database
    // Find the content record
    const content = await prisma.content.findUnique({
      where: { id }
    });
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Delete the file from storage
    try {
      const filePath = content.filePath.replace(/^\/storage\/content\//, '');
      const fullPath = join(process.cwd(), 'public', 'storage', 'content', filePath);
      await unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with deletion even if file removal fails
    }
    
    // Delete the content record
    await prisma.content.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Content deleted successfully'
    });
    */
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 