import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// POST: Add a new business
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received business data:', data);
    
    // Get current user from session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Create the business with proper user relation
    let business;
    
    if (userId) {
      // If we have a user ID from the session, connect to that user
      business = await prisma.business.create({
        data: {
          name: data.name,
          status: data.status?.toUpperCase() || 'PENDING',
          color: data.color || null,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : null, // Include endDate
          createdBy: {
            connect: { id: userId }
          }
        },
        include: {
          createdBy: true
        }
      });
    } else {
      // If no user ID is available, find or create a user based on the createdBy name
      const creatorName = data.createdBy || 'Admin';
      
      // Find or create a user with this name
      const user = await prisma.user.findFirst({
        where: {
          name: creatorName
        }
      }) || await prisma.user.create({
        data: {
          name: creatorName,
          email: `${creatorName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          password: await fetch('/api/auth/generate-password').then(res => res.text()),
          role: 'ADMIN',
          status: 'ACTIVE',
        }
      });
      
      // Now create the business connected to this user
      business = await prisma.business.create({
        data: {
          name: data.name,
          status: data.status?.toUpperCase() || 'PENDING',
          color: data.color || null,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : null, // Include endDate
          createdBy: {
            connect: { id: user.id }
          }
        },
        include: {
          createdBy: true
        }
      });
    }

    console.log('Business created successfully:', business);

    return NextResponse.json({ 
      success: true, 
      message: 'Business created successfully', 
      business 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET: List all businesses
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users: true // Include the users relationship
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response to include user count
    const formattedBusinesses = await Promise.all(
      businesses.map(async (business) => {
        // Count users through the BusinessUser junction table
        const userCount = await prisma.businessUser.count({
          where: { businessId: business.id }
        });
        
        return {
          ...business,
          userCount: userCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      businesses: formattedBusinesses
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}