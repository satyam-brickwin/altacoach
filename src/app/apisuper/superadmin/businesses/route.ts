import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Add a new business
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received business data:', data);

    // Create the business record with only fields from the schema
    const business = await prisma.business.create({
      data: {
        name: data.name,
        plan: data.plan.toUpperCase(), // Ensure plan is uppercase for consistency
        status: data.status.toUpperCase(), // Ensure status is uppercase for consistency
        // Additional information stored in metadata or other tables if needed
      },
    });

    console.log('Business created successfully:', business);

    // If you need to store the additional information in a different table or model,
    // you can add that logic here

    return NextResponse.json({ 
      success: true, 
      message: 'Business created successfully', 
      business 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create business' },
      { status: 500 }
    );
  }
}

// GET: List all businesses
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { joinedDate: 'desc' },
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