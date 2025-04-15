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

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return Response.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Ensure role is always lowercase before storing
    const normalizedRole = role.toLowerCase();
    
    // Use the provided language or default to "English" if truly missing
    const userLanguage = language || "English";

    console.log(`Creating user with data:`, { 
      name, 
      email, 
      role: normalizedRole, 
      language: userLanguage, 
      businessId,
      generateResetToken
    });

    // Create user data object with isVerified explicitly set to false
    let userData: any = {
      email,
      name,
      role: normalizedRole,
      language: userLanguage,
      status,
      isVerified: false,
      // Store an empty string as password initially
      // This clearly indicates the password is pending verification
      password: ''
    };

    // Generate reset token if requested
    if (generateResetToken) {
      // Generate a reset token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
      
      userData.resetToken = resetToken;
      userData.resetTokenExpiry = resetTokenExpiry;
      
      // Send the password reset email
      try {
        // Import the email sending function
        const { sendPasswordResetEmail } = await import('@/lib/email/sendPasswordResetEmail');
        await sendPasswordResetEmail(email, resetToken);
        console.log(`Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        // Continue with user creation even if email fails
      }
    }

    // If your database schema requires a non-empty password, you'll need to handle that
    // by modifying the schema or providing a temporary password here

    // Create the user with the correct language and verification status
    const newUser = await prisma.user.create({
      data: userData
    });

    console.log("Created new user with language:", newUser.language, "isVerified:", newUser.isVerified);

    // If a business ID is provided, create the association
    if (businessId) {
      console.log(`Creating business association: userId=${newUser.id}, businessId=${businessId}`);
      
      try {
        await prisma.businessUser.create({
          data: {
            userId: newUser.id,
            businessId: businessId,
            // Use the user's ID as createdById if needed
            createdById: newUser.id,
          },
        });
        console.log("Business association created successfully");
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
    
    // Check if this is a Prisma error about password requirement
    if (error.message && error.message.includes('password')) {
      // If your schema requires a password, handle that case
      return Response.json(
        { 
          success: false, 
          error: "Your database schema requires a password. Please modify your schema to allow null passwords or update the code to provide a temporary password." 
        },
        { status: 500 }
      );
    }
    
    return Response.json(
      { success: false, error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}