import { supabase } from './supabase';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create an embedding for a text using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

/**
 * Retrieve relevant documents based on a query
 */
export async function retrieveRelevantDocuments(query: string, limit = 5) {
  try {
    // Create embedding for the query
    const queryEmbedding = await createEmbedding(query);
    
    // Search for similar documents using Supabase's pgvector extension
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error retrieving relevant documents:', error);
    return [];
  }
}

// Define document interface
interface DocumentWithSimilarity {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

/**
 * Generate a response using RAG
 */
export async function generateRAGResponse(query: string, userId: string) {
  try {
    // Retrieve relevant documents
    const relevantDocs = await retrieveRelevantDocuments(query) as DocumentWithSimilarity[];
    
    // Format context from relevant documents
    const context = relevantDocs
      .map((doc: DocumentWithSimilarity) => `Document: ${doc.title}\n${doc.content.substring(0, 1000)}`)
      .join('\n\n');
    
    // Call OpenAI with context
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    
    // System prompt with context
    const systemPrompt = `You are AltaCoach, an AI assistant specialized in providing coaching and training support.
Use the following information to answer the user's question. If the information doesn't contain the answer, say so instead of making up information.

Context:
${context}`;
    
    // Format messages for OpenAI
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const aiResponse = response.choices[0].message?.content || '';
    
    // Save the conversation and messages
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        user_id: userId
      })
      .select()
      .single();
    
    if (convError) throw convError;
    
    // Save user message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: query,
        role: 'user'
      });
    
    // Save AI response
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: aiResponse,
        role: 'assistant'
      });
    
    return {
      message: aiResponse,
      conversationId: conversation.id,
      relevantContent: relevantDocs.map((doc: DocumentWithSimilarity) => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity
      }))
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
} 