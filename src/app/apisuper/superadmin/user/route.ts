import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function GET() {
  try {
    // For now, we'll skip auth checks to get the system working
    // Later we can add proper auth checks
    
    // Fetch all users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        businessId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({
      users,
      success: true,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, businessId } = body;

    console.log('Creating user with data:', { name, email, role, businessId });

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Check if businessId is valid if provided
    if (businessId && businessId.trim() !== '') {
      // Check if the business exists
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        return NextResponse.json(
          { success: false, error: 'Invalid business ID provided' },
          { status: 400 }
        );
      }
    }

    // Prepare user data with proper defaults
    const userData = {
      name: name || email.split('@')[0],
      email,
      password, // In a real app, you would hash this password
      role: role || 'USER',
      status: 'ACTIVE',
      // Only include businessId if it's a non-empty string
      ...(businessId && businessId.trim() !== '' ? { businessId } : {})
    };

    console.log('Prepared user data:', userData);

    // Create the new user
    const newUser = await prisma.user.create({
      data: userData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // More detailed error message
    let errorMessage = 'Failed to create user';
    
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('Error details:', error);
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 