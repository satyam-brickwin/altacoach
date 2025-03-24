import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Try to query the database
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful!',
      result
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 