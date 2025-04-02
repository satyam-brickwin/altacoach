import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Replace this with your actual database query
    const business = {
      id: params.id,
      name: `Business ${params.id}`,
      status: 'active',
      // ... other business data
    };

    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch business details' },
      { status: 500 }
    );
  }
}