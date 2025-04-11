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
          plan: data.plan?.toUpperCase() || 'BUSINESS',
          status: data.status?.toUpperCase() || 'PENDING',
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
          // Add any other required fields for your User model
        }
      });
      
      // Now create the business connected to this user
      business = await prisma.business.create({
        data: {
          name: data.name,
          plan: data.plan?.toUpperCase() || 'BUSINESS',
          status: data.status?.toUpperCase() || 'PENDING',
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
      orderBy: { joinedDate: 'desc' },
      include: {
        createdBy: true
      }
    });

    return NextResponse.json({ 
      success: true,
      businesses 
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}