import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { hashPassword } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    // Get all admin users from database
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin'] // Fetch both admin and super_admin roles
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        isVerified: true // Make sure to include this field
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return Response.json({
      success: true,
      users: admins
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return Response.json(
      { success: false, error: "Failed to fetch admin users" },
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
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
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
    
    let hashedPassword: string | undefined;
    let resetToken: string | undefined;
    let resetTokenExpiry: Date | undefined;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else if (role === 'ADMIN') {
      resetToken = crypto.randomBytes(32).toString('hex');
      resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    }

    resetToken = crypto.randomBytes(32).toString('hex');
    resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    
    // Create user and possibly associate with a business
    let newUser;
    
    if (businessId && businessId.trim() !== '') {
      // Get the admin user (or use session user in a real app)
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'No admin user found to associate with this operation' },
          { status: 500 }
        );
      }
      
      // Create user and associate with business in a transaction
      newUser = await prisma.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
          data: {
            name: name || email.split('@')[0],
            email,
            password: hashedPassword || '',
            role: role || 'USER',
            status: 'ACTIVE',
            resetToken,
            resetTokenExpiry,
          }
        });
        
        // Create business association
        await tx.businessUser.create({
          data: {
            userId: user.id,
            businessId: businessId,
            createdById: adminUser.id
          }
        });
        
        return user;
      });
    } else {
      // Create user without business association
      newUser = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          password: hashedPassword || '',
          role: role || 'USER',
          status: 'ACTIVE',
          resetToken,
          resetTokenExpiry,
        }
      });
    }

    // Send password reset email if a token was generated
    if (resetToken) {
      await sendPasswordResetEmail(email, resetToken);
    }

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