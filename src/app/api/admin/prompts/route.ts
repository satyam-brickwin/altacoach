import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Define the interface for prompts
interface AIPrompt {
  id: string;
  name: string;
  description?: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Simple UUID generator
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

// Function to get the path to the prompts JSON file
function getPromptsFilePath() {
  return path.join(process.cwd(), 'src', 'data', 'prompts.json');
}

// Function to ensure the prompts file exists
async function ensurePromptsFile() {
  const filePath = getPromptsFilePath();
  try {
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist, create it with an empty array
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify([], null, 2));
  }
}

// Function to read prompts from file
async function readPrompts(): Promise<AIPrompt[]> {
  await ensurePromptsFile();
  const filePath = getPromptsFilePath();
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Function to write prompts to file
async function writePrompts(prompts: AIPrompt[]) {
  const filePath = getPromptsFilePath();
  await fs.writeFile(filePath, JSON.stringify(prompts, null, 2));
}

// GET /api/admin/prompts - Get all prompts
export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdminUser(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompts = await readPrompts();
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

// POST /api/admin/prompts - Create a new prompt
export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdminUser(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }
    
    const prompts = await readPrompts();
    
    // If the new prompt is set to active, deactivate all other prompts
    if (data.isActive) {
      prompts.forEach(prompt => {
        prompt.isActive = false;
      });
    }
    
    // Create new prompt object
    const newPrompt: AIPrompt = {
      id: generateId(),
      name: data.name,
      description: data.description || '',
      content: data.content,
      isActive: data.isActive || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    await writePrompts(prompts);
    
    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
} 