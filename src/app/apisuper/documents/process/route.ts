import { NextRequest, NextResponse } from 'next/server';
import { processDocumentAPI } from '@/lib/document-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId } = body;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const result = await processDocumentAPI(documentId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 