import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
interface AIPrompt {
  id: string;
  language_code: string;
  system_prompt: string;
  created_at: string;
  updated_at: string;
}

// Verify admin role from cookies
async function verifyAdminUser(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('userData');
    if (!sessionCookie) return false;

    const userData = JSON.parse(decodeURIComponent(sessionCookie.value));
    return userData.role === 'SUPER_ADMIN';
  } catch {
    return false;
  }
}

function getPromptsFilePath() {
  return path.join(process.cwd(), 'src', 'data', 'prompts.json');
}

async function ensurePromptsFile() {
  const filePath = getPromptsFilePath();
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify([], null, 2));
  }
}

async function readPrompts(): Promise<AIPrompt[]> {
  await ensurePromptsFile();
  const filePath = getPromptsFilePath();
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function writePrompts(prompts: AIPrompt[]) {
  const filePath = getPromptsFilePath();
  await fs.writeFile(filePath, JSON.stringify(prompts, null, 2));
}


// GET /apisuper/superadmin/prompts
export async function GET(req: NextRequest) {
  try {
    const prompts = await prisma.promptTable.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    console.log('[DEBUG] Fetched Prompts:', prompts); // Log the fetched prompts

    return NextResponse.json(prompts);
  } catch (err) {
    console.error('Failed to fetch prompts:', err);
    return NextResponse.json({ error: 'Failed to load prompts' }, { status: 500 });
  }
}

// PATCH /apisuper/superadmin/prompts/:id
// PATCH /apisuper/superadmin/prompts/:id
export async function PATCH(req: NextRequest) {
  try {
    const { system_prompt, language_code } = await req.json(); // Extract system_prompt and language_code from the request body
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract the id from the URL

    if (!id || !system_prompt || !language_code) {
      return NextResponse.json({ error: 'Missing id, language code, or prompt' }, { status: 400 });
    }

    // Update the prompt using the id
    const updatedPrompt = await prisma.promptTable.update({
      where: { id }, // Use the id to locate the prompt
      data: {
        systemPrompt: system_prompt,
        languageCode: language_code,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPrompt);
  } catch (err) {
    console.error('Failed to update prompt:', err);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}
