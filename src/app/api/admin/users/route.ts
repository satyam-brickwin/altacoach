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
    // Remove the default "English" here to ensure the provided language is used
    const { email, name, password, role = "user", language, status = "ACTIVE", businessId } = data;

    if (!email || !name || !password) {
      return Response.json({ success: false, error: "Email, name, and password are required" }, { status: 400 });
    }

    // Ensure role is always lowercase before storing
    const normalizedRole = role.toLowerCase();
    
    // Use the provided language or default to "English" if truly missing
    const userLanguage = language || "English";

    console.log(`Creating user with data:`, { name, email, role: normalizedRole, language: userLanguage, businessId });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with the correct language
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: normalizedRole,
        language: userLanguage, // This will use whatever language was selected or default to English
        status,
        isVerified: false,
      },
    });

    console.log("Created new user with language:", newUser.language);

    // If a business ID is provided, create the association
    if (businessId) {
      console.log(`Creating business association: userId=${newUser.id}, businessId=${businessId}, createdById=${newUser.id}`);
      
      await prisma.$transaction(async (tx) => {
        await tx.businessUser.create({
          data: {
            userId: newUser.id,
            businessId: businessId,
            createdById: newUser.id,
          },
        });
      });
    }

    return Response.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role, // Will now be lowercase
        status: newUser.status,
        language: newUser.language,
        isVerified: newUser.isVerified,
        businessId: businessId,
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