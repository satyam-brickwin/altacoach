import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path as per your project

export async function GET() {
  const model = await prisma.models.findFirst();
  return NextResponse.json({ model: model?.model_name || 'mistral' });
}

export async function POST(req: Request) {
  const { model_name } = await req.json();

  // Update the first entry (only one expected)
  const existing = await prisma.models.findFirst();
  if (existing) {
    await prisma.models.update({
      where: { id: existing.id },
      data: { model_name }
    });
  } else {
    await prisma.models.create({ data: { model_name } });
  }

  return NextResponse.json({ success: true });
}
