import { supabaseAdmin } from './supabase';
import { createEmbedding } from './rag';

/**
 * Process a document to extract its text content and create embeddings
 */
export async function processDocument(documentId: string): Promise<any> {
  try {
    // Get the document from the database
    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      console.error(`Document with ID ${documentId} not found:`, error);
      return null;
    }

    // Update status to PROCESSING
    await supabaseAdmin
      .from('documents')
      .update({ status: 'PROCESSING' })
      .eq('id', documentId);

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('documents')
      .download(document.file_path);
    
    if (fileError) {
      throw fileError;
    }

    // Extract text based on file type
    let extractedText = '';
    let detectedLanguage = 'en'; // Default language
    
    try {
      // For simplicity, we're just handling text files here
      // In a real implementation, you'd use libraries to extract text from different file types
      if (document.file_type === 'text/plain') {
        extractedText = await fileData.text();
      } else if (document.file_type === 'application/pdf') {
        // For PDF files, you would use a library like pdf-parse
        extractedText = 'PDF text extraction would be implemented here';
      } else if (document.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For DOCX files, you would use a library like mammoth
        extractedText = 'DOCX text extraction would be implemented here';
      } else if (document.file_type.includes('spreadsheet') || document.file_type.includes('excel')) {
        // For Excel files, you would use a library like xlsx
        extractedText = 'Excel text extraction would be implemented here';
      } else {
        // For other file types
        extractedText = `Text extraction not implemented for file type: ${document.file_type}`;
      }
      
      // Create embedding for the document
      const embedding = await createEmbedding(extractedText);
      
      // Update the document with extracted text, embedding, and status
      const { data: updatedDocument, error: updateError } = await supabaseAdmin
        .from('documents')
        .update({
          content: extractedText,
          embedding,
          status: 'PROCESSED',
          language: detectedLanguage
        })
        .eq('id', documentId)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      return updatedDocument;
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      
      // Update status to FAILED
      const { data: failedDocument } = await supabaseAdmin
        .from('documents')
        .update({
          status: 'FAILED',
          metadata: {
            ...document.metadata,
            processingError: error instanceof Error ? error.message : String(error)
          }
        })
        .eq('id', documentId)
        .select()
        .single();
      
      return failedDocument;
    }
  } catch (error) {
    console.error(`Error in document processing workflow for ${documentId}:`, error);
    return null;
  }
}

/**
 * Create an API endpoint to process a document
 */
export async function processDocumentAPI(documentId: string) {
  try {
    const result = await processDocument(documentId);
    
    if (!result) {
      return {
        success: false,
        message: 'Document processing failed'
      };
    }
    
    return {
      success: true,
      document: result
    };
  } catch (error) {
    console.error('Error in document processing API:', error);
    return {
      success: false,
      message: 'Document processing failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 