import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { removeAuthCookie, getAuthToken, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the auth token
    const token = getAuthToken();
    
    if (token) {
      // Verify token to get user ID
      const payload = await verifyToken(token);
      
      if (payload && payload.id) {
        // Delete the session from the database
        await prisma.session.deleteMany({
          where: {
            userId: payload.id,
            token,
          },
        });
      }
      
      // Remove the auth cookie
      removeAuthCookie();
    }
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 