import { NextRequest, NextResponse } from 'next/server';
import { 
  getDocuments, 
  getDocumentById, 
  uploadDocument, 
  deleteDocument, 
  updateDocument 
} from '@/lib/document-repository';

// GET: List all documents with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const status = searchParams.get('status') || undefined;
    const clientId = searchParams.get('clientId') || undefined;
    const uploadedById = searchParams.get('uploadedById') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get documents using our repository function
    const result = await getDocuments({
      status,
      clientId,
      uploadedById,
      tag,
      limit,
      offset
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Upload a new document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get file from form data
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get other form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const uploadedById = formData.get('uploadedById') as string;
    const clientId = (formData.get('clientId') as string) || undefined;
    const tagsString = formData.get('tags') as string || '';
    
    // Validate required fields
    if (!title || !uploadedById) {
      return NextResponse.json(
        { error: 'Title and uploadedById are required' },
        { status: 400 }
      );
    }
    
    // Parse tags
    const tags = tagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Upload document using our repository function
    const document = await uploadDocument(file, {
      title,
      description,
      uploadedById,
      clientId,
      tags
    });
    
    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Delete document using our repository function
    const result = await deleteDocument(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH: Update document metadata
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Update document using our repository function
    const document = await updateDocument(id, updates);
    
    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 