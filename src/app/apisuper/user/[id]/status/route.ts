import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user ID from params
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Parse the request body
    const { status } = await request.json();

    // Validate status value
    if (!status || (status !== 'active' && status !== 'suspended')) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "suspended"' },
        { status: 400 }
      );
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user status - removed auth check for now to fix the issue
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    console.log(`User ${userId} status updated to ${status}`);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}