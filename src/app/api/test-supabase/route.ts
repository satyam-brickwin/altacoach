import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test the Supabase connection by running a simple query
    const { data, error } = await supabase.from('_test').select('*').limit(1).maybeSingle();
    
    if (error) {
      // If the table doesn't exist, that's okay - we're just testing the connection
      if (error.code === '42P01') { // Table doesn't exist
        return NextResponse.json({
          success: true,
          message: 'Supabase connection successful, but _test table does not exist (expected).',
          connection: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            connected: true
          }
        });
      }
      
      // Other errors might indicate connection issues
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      data,
      connection: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        connected: true
      }
    });
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to Supabase',
        error: error instanceof Error ? error.message : String(error),
        connection: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          connected: false
        }
      },
      { status: 500 }
    );
  }
} 