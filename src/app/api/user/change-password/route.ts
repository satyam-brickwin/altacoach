import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions);
    
    console.log("Session data:", JSON.stringify(session, null, 2));
    
    // Check authentication without relying on session.user structure
    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    console.log("Request received for password change");
    
    // Validate request data
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }
    
    // Get user ID from session - different NextAuth configurations might store it differently
    const userId = session.user?.id || session.userId;
    
    if (!userId) {
      console.log("User ID not found in session");
      return NextResponse.json(
        { message: 'User identification failed' },
        { status: 401 }
      );
    }
    
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });
    
    if (!user) {
      console.log(`User not found for ID: ${userId}`);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    console.log(`Password updated successfully for user: ${userId}`);
    
    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { message: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
