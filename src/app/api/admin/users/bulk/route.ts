import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { users, businessId } = await req.json();
    console.log('Received data:', { users, businessId });

    if (!Array.isArray(users) || !businessId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid input data' 
      }, { status: 400 });
    }

    const hashedUsers = await Promise.all(users.map(async (user) => {
      const hashedPassword = await hash('password123', 12);
      return {
        name: user.name || '',
        email: user.email || '',
        password: hashedPassword,
        businessId: businessId,
        status: 'active',
        role: 'USER'
      };
    }));

    // Bulk create users
    await prisma.user.createMany({
      data: hashedUsers,
      skipDuplicates: true,
    });

    // Fetch created users with only the fields that exist in your schema
    const createdUsers = await prisma.user.findMany({
      where: {
        businessId: businessId,
        email: {
          in: users.map(u => u.email)
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessId: true,
        status: true,
        role: true
      }
    });

    console.log('Created users:', createdUsers);

    return NextResponse.json({
      success: true,
      users: createdUsers,
      count: createdUsers.length
    });

  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create users'
    }, { status: 500 });
  }
}