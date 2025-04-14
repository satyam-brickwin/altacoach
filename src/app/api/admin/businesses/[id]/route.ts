import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// PUT: Update a business
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    const data = await request.json();
    
    // Get current user from session
    const session = await getServerSession(authOptions);
    
    // Check if business exists
    const existingBusiness = await prisma.business.findUnique({
      where: { id: businessId }
    });
    
    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }
    
    // Update the business
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: data.name,
        status: data.status?.toUpperCase() || existingBusiness.status,
        color: data.color || null,
        startDate: data.startDate ? new Date(data.startDate) : existingBusiness.startDate,
        endDate: data.endDate ? new Date(data.endDate) : existingBusiness.endDate,
        // Note: We don't update createdById as that should remain the original creator
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Business updated successfully', 
      business: updatedBusiness
    });
    
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET: Get a single business
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users: {
          select: {
            userId: true
          }
        }
      }
    });
    
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }
    
    // Format the response to match what the UI expects
    const formattedBusiness = {
      ...business,
      userCount: business.users.length
    };
    
    return NextResponse.json({
      success: true,
      business: formattedBusiness
    });
    
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a business
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    
    // Check if business exists
    const existingBusiness = await prisma.business.findUnique({
      where: { id: businessId }
    });
    
    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }
    
    // Delete associated BusinessUser entries first to avoid foreign key constraints
    await prisma.businessUser.deleteMany({
      where: { businessId }
    });
    
    // Delete associated BusinessDocument entries
    await prisma.businessDocument.deleteMany({
      where: { businessId }
    });
    
    // Delete the business
    await prisma.business.delete({
      where: { id: businessId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}