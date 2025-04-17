import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Document deleted successfully' });

    // Find the document by ID
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Attempt to delete file from disk
    try {
      const relativePath = document.url.replace(/^\/storage\/content\//, '');
      const fullPath = join(process.cwd(), 'public', 'storage', 'content', relativePath);
      await unlink(fullPath);
      console.log(`File deleted: ${fullPath}`);
    } catch (fileError) {
      console.error('Failed to delete file from disk:', fileError);
      // Continue even if file deletion fails
    }

    // Delete record from the database
    await prisma.document.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}