import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

// GET /api/admin/prompts/[id] - Get a specific prompt by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await verifyAdminUser(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const prompts = await readPrompts();
    const prompt = prompts.find(p => p.id === id);
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

// PATCH /api/admin/prompts/[id] - Update a prompt (partial update)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await verifyAdminUser(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const data = await req.json();
    
    // Get all prompts
    const prompts = await readPrompts();
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    // If setting this prompt to active, deactivate all others
    if (data.isActive) {
      prompts.forEach(prompt => {
        prompt.isActive = false;
      });
    }
    
    // Update the prompt with new data, preserving existing fields
    const updatedPrompt = {
      ...prompts[promptIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Replace the old prompt with the updated one
    prompts[promptIndex] = updatedPrompt;
    
    // Save the updated prompts array
    await writePrompts(prompts);
    
    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

// DELETE /api/admin/prompts/[id] - Delete a prompt
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await verifyAdminUser(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Get all prompts
    const prompts = await readPrompts();
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    // Remove the prompt from the array
    prompts.splice(promptIndex, 1);
    
    // Save the updated prompts array
    await writePrompts(prompts);
    
    return NextResponse.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
} 