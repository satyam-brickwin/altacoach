import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Get request data
    const body = await request.json();
    const { currentPassword, newPassword, userId } = body;
    
    // Validate input
    if (!currentPassword || !newPassword || !userId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get session directly from cookies - more reliable in Next.js App Router
    const session = await getServerSession(authOptions);
    
    // Debug session info
    console.log('Session info:', {
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      requestUserId: userId
    });
    
    // Fetch the user directly from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true,
        role: true
      },
    });
    
    if (!user) {
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
    
    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    console.log(`Password updated successfully for user: ${user.email}`);
    
    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { message: 'An error occurred during the password reset process' },
      { status: 500 }
    );
  }
}