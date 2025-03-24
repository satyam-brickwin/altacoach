import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processDocument } from '@/lib/document-processor';

// POST: Process a document to extract text
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if document is already being processed
    if (document.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Document is already being processed' },
        { status: 400 }
      );
    }
    
    // Process the document asynchronously
    // In a production environment, this would be handled by a background job
    processDocument(id).catch(error => {
      console.error(`Error in background processing of document ${id}:`, error);
    });
    
    return NextResponse.json({
      success: true,
      message: 'Document processing started',
      documentId: id
    });
  } catch (error) {
    console.error('Error starting document processing:', error);
    return NextResponse.json(
      { error: 'Failed to start document processing' },
      { status: 500 }
    );
  }
} 