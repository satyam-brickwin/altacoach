import { supabase, supabaseAdmin } from './supabase';

/**
 * Interface for document metadata
 */
export interface DocumentMetadata {
  id?: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath?: string;
  content?: string;
  status?: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  language?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  uploadedById: string;
  clientId?: string;
  trainingContentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get all documents with optional filtering
 */
export async function getDocuments({
  status,
  clientId,
  uploadedById,
  tag,
  limit = 50,
  offset = 0
}: {
  status?: string;
  clientId?: string;
  uploadedById?: string;
  tag?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    // Build query
    let query = supabase
      .from('documents')
      .select(`
        *,
        uploaded_by:uploaded_by_id(id, name, email),
        client:client_id(id, name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    if (uploadedById) {
      query = query.eq('uploaded_by_id', uploadedById);
    }
    
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    // Execute query
    const { data: documents, error } = await query;
    
    if (error) throw error;
    
    // Get total count
    const { count: total } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    return {
      documents,
      pagination: {
        total,
        limit,
        offset
      }
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(id: string) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        uploaded_by:uploaded_by_id(id, name, email),
        client:client_id(id, name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching document with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Upload a document to Supabase Storage and create a database record
 */
export async function uploadDocument(
  file: File,
  metadata: Omit<DocumentMetadata, 'fileName' | 'fileType' | 'fileSize' | 'filePath'>
) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const safeFileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload file to Supabase Storage
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('documents')
      .upload(safeFileName, file);
    
    if (fileError) {
      throw fileError;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('documents')
      .getPublicUrl(safeFileName);
    
    // Create document record in database
    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        title: metadata.title,
        description: metadata.description || '',
        file_name: originalName,
        file_type: file.type,
        file_size: file.size,
        file_path: fileData.path,
        status: 'PENDING',
        tags: metadata.tags || [],
        uploaded_by_id: metadata.uploadedById,
        client_id: metadata.clientId,
        training_content_id: metadata.trainingContentId,
        metadata: {
          ...metadata.metadata,
          publicUrl
        }
      })
      .select(`
        *,
        uploaded_by:uploaded_by_id(id, name, email)
      `)
      .single();
    
    if (dbError) {
      throw dbError;
    }
    
    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Delete a document from Supabase Storage and the database
 */
export async function deleteDocument(id: string) {
  try {
    // Get the document to find the file path
    const { data: document, error: getError } = await supabaseAdmin
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    
    // Delete the file from storage
    if (document?.file_path) {
      const { error: storageError } = await supabaseAdmin
        .storage
        .from('documents')
        .remove([document.file_path]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }
    
    // Delete the database record
    const { error: dbError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (dbError) throw dbError;
    
    return { success: true, id };
  } catch (error) {
    console.error(`Error deleting document with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(id: string, updates: Partial<DocumentMetadata>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        tags: updates.tags,
        client_id: updates.clientId,
        training_content_id: updates.trainingContentId,
        metadata: updates.metadata,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating document with ID ${id}:`, error);
    throw error;
  }
} 