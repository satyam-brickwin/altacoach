import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get URL and search params
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const excludeAdmins = searchParams.get('excludeAdmins') === 'true';
    
    // Build the query filter
    const userFilter: any = {};
    
    if (excludeAdmins) {
      userFilter.role = { not: 'ADMIN' };  // Exclude admin users
    }
    
    // Different query based on whether businessId is provided
    let users;
    
    if (businessId) {
      // When businessId is provided, filter users through the BusinessUser relation
      users = await prisma.user.findMany({
        where: {
          ...userFilter,
          businesses: {
            some: {
              businessId: businessId
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          language: true, // Add this line to include language in the results
          createdAt: true,
          lastLogin: true,
          businesses: {
            where: { businessId: businessId },
            select: {
              business: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Transform result to match expected format
      users = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        language: user.language, // Add this line
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        businessId: businessId,
        businessName: user.businesses[0]?.business.name
      }));
    } else {
      // When no businessId provided, get all users
      users = await prisma.user.findMany({
        where: userFilter,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          language: true, // Add this line to include language in the results
          createdAt: true,
          lastLogin: true,
          businesses: {
            select: {
              business: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Transform result to match expected format
      users = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        language: user.language, // Add this line to include language in the results
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        businessId: user.businesses[0]?.business.id || null,
        businessName: user.businesses[0]?.business.name || null
      }));
    }
    
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
    const data = await request.json();
    const { 
      email, 
      name, 
      password, 
      role = "user", 
      language, 
      status = "ACTIVE", 
      businessId,
      generateResetToken,
      passwordPending
    } = data;

    // Check for required fields
    if (!email || !name) {
      return Response.json({ success: false, error: "Email and name are required" }, { status: 400 });
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return Response.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Normalize role
    const normalizedRole = role.toLowerCase();
    const userLanguage = language || "English";

    // Create user data object
    let userData: any = {
      email,
      name,
      role: normalizedRole,
      language: userLanguage,
      status,
      isVerified: false,
    };

    // Important: Handle the password field based on whether verification is required
    if (passwordPending) {
      // Use a special placeholder that can't be used to log in
      // This meets database schema requirements without allowing access
      userData.password = "VERIFICATION_PENDING"; // Non-hashed placeholder
    } else if (password) {
      // If password is provided and not pending verification, hash it normally
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    } else {
      // Generate a temporary password that won't be used
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedTemp = await bcrypt.hash(tempPassword, 10);
      userData.password = hashedTemp;
    }

    // Generate reset token for password creation via email
    if (generateResetToken) {
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
      
      userData.resetToken = resetToken;
      userData.resetTokenExpiry = resetTokenExpiry;
      
      try {
        const { sendPasswordResetEmail } = await import('@/lib/email/sendPasswordResetEmail');
        // Modify your email template to explain this is for account creation
        await sendPasswordResetEmail(email, resetToken);
        console.log(`Password creation email sent to ${email}`);
      } catch (emailError) {
        console.error("Error sending password creation email:", emailError);
      }
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: userData
    });

    // Handle business association
    if (businessId) {
      console.log(`Creating business association: userId=${newUser.id}, businessId=${businessId}`);
      
      try {
        await prisma.businessUser.create({
          data: {
            userId: newUser.id,
            businessId: businessId,
            createdById: newUser.id,
          },
        });
      } catch (bizError) {
        console.error("Error creating business association:", bizError);
      }
    }

    return Response.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
        language: newUser.language,
        isVerified: newUser.isVerified,
        businessId: businessId,
        passwordPending: true
      },
    });
    
  } catch (error: any) {
    console.error("Error creating user:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}