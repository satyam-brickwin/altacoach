import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePasswords, createToken, setAuthCookie } from '@/lib/auth';

// Mock user database for demonstration
// let MOCK_USERS = [
//   {
//     id: '1',
//     name: 'Test User',
//     email: 'test@example.com',
//     // In a real app, this would be a hashed password
//     password: 'password123',
//     company: 'AltaCoach',
//     preferredLanguage: 'en',
//   },
//   {
//     id: '2',
//     name: 'Admin User',
//     email: 'admin@altacoach.com',
//     password: 'admin123',
//     company: 'AltaCoach',
//     preferredLanguage: 'en',
//     isAdmin: true,
//   },
// ];

// This function allows us to access the mock users from other routes
// export function getMockUsers() {
//   return MOCK_USERS;
// }

// This function allows us to update the mock users from other routes
// export function addMockUser(user: any) {
//   MOCK_USERS.push(user);
//   return user;
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validate request body
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email (case insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    // Check if user exists and password matches
    if (!user || !user.password) {
      console.log(`Login failed for ${email}: User not found or has no password`);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed for ${email}: Invalid password`);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken(user);

    // Set auth cookie
    setAuthCookie(token);

    // Create session record
    // await prisma.session.create({
    //   data: {
    //     userId: user.id,
    //     token,
    //     expires: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000),
    //   },
    // });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        ...userWithoutPassword,
        isAdmin: user.role === 'ADMIN',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 