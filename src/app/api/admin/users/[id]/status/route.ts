import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user ID from the URL params
    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get the new status from the request body
    const data = await request.json();
    const { status } = data;
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status format (make it uppercase for consistency)
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING'];
    const normalizedStatus = status.toUpperCase();
    
    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value. Must be ACTIVE, SUSPENDED, or PENDING' },
        { status: 400 }
      );
    }

    // Update the user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: normalizedStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        language: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}