import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

// GET: Download a document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Find the document
    const document = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Get the file path
    const fullPath = join(process.cwd(), document.filePath);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer);
    
    // Set content type based on file type
    response.headers.set('Content-Type', document.fileType || 'application/octet-stream');
    
    // Set content disposition to force download with original filename
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(document.fileName)}"`
    );
    
    // Set content length
    response.headers.set('Content-Length', document.fileSize.toString());
    
    // Update download count (optional)
    await prisma.document.update({
      where: { id },
      data: {
        metadata: {
          ...document.metadata,
          downloadCount: ((document.metadata as any)?.downloadCount || 0) + 1
        }
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
} 