import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

// Helper function to verify admin access
async function verifyAdminUser(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('userData');
    
    if (!sessionCookie) {
      return false;
    }
    
    const userData = JSON.parse(decodeURIComponent(sessionCookie.value));
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin user:', error);
    return false;
  }
}

// Function to update the OpenAI API key in the .env file
async function updateOpenAIKeyInEnvFile(apiKey: string): Promise<void> {
  const envFilePath = path.join(process.cwd(), '.env');
  
  try {
    // Check if .env file exists
    let envContent = '';
    try {
      envContent = await fs.readFile(envFilePath, 'utf-8');
    } catch (error) {
      // File doesn't exist, create a new one
      console.log('.env file does not exist, creating a new one');
    }
    
    // Define the key pattern to look for
    const envKeyPattern = /^OPENAI_API_KEY=.*/m;
    const newKeyLine = `OPENAI_API_KEY=${apiKey}`;
    
    // Check if the key already exists
    if (envKeyPattern.test(envContent)) {
      // Replace existing key
      envContent = envContent.replace(envKeyPattern, newKeyLine);
    } else {
      // Add new key at the end of the file
      envContent = envContent.trim() + '\n' + newKeyLine + '\n';
    }
    
    // Write back to the file
    await fs.writeFile(envFilePath, envContent);
  } catch (error) {
    console.error('Error updating .env file:', error);
    throw new Error('Failed to update API key in .env file');
  }
}

// POST /api/admin/settings/openai-key - Update OpenAI API key
export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    if (!(await verifyAdminUser(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { apiKey } = await req.json();
    
    // Validate API key format
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }
    
    // OpenAI API keys typically start with "sk-"
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({ 
        error: 'Invalid API key format. OpenAI keys should start with "sk-"' 
      }, { status: 400 });
    }
    
    // Update the key in the .env file
    await updateOpenAIKeyInEnvFile(apiKey);
    
    // Return success response
    return NextResponse.json({ 
      message: 'API key updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Error updating OpenAI API key:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update API key' 
    }, { status: 500 });
  }
} 