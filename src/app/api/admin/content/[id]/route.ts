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
    console.log('Attempting to delete document with ID:', id);
    
    if (!id || isNaN(Number(id))) {
      console.log('Invalid ID format:', id);
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
    }

    // Find the document by ID
    console.log('Looking up document with ID:', id);
    const document = await prisma.document.findUnique({
      where: { id: Number(id) }
    });
    console.log('Document found:', document ? 'Yes' : 'No');

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Attempt to delete file from disk
    try {
      const relativePath = document.url.replace(/^\/storage\/content\//, '');
      const fullPath = join(process.cwd(), 'public', 'storage', 'content', relativePath);
      console.log('Attempting to delete file at path:', fullPath);
      await unlink(fullPath);
      console.log(`File deleted: ${fullPath}`);
    } catch (fileError) {
      console.error('Failed to delete file from disk:', fileError);
      // Continue even if file deletion fails
    }

    // Delete record from the database
    console.log('Deleting document from database');
    await prisma.document.delete({
      where: { id: Number(id) }
    });
    console.log('Database record deleted successfully');

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    // Return more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}