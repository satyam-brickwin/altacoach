import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createEmbedding } from '@/lib/rag';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { message, conversationId, userId = 'anonymous' } = body;

    // Validate the message
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Create embedding for the query
    let queryEmbedding;
    try {
      queryEmbedding = await createEmbedding(message);
    } catch (embeddingError) {
      console.error('Error creating embedding:', embeddingError);
      
      // Fallback to direct OpenAI response if embedding fails
      return await handleFallbackResponse(message, conversationId, userId);
    }
    
    // Search for similar documents using Supabase's pgvector extension
    let relevantDocs;
    try {
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5
      });
      
      if (error) throw error;
      relevantDocs = data;
    } catch (searchError) {
      console.error('Error retrieving relevant documents:', searchError);
      
      // Fallback to direct OpenAI response if document search fails
      return await handleFallbackResponse(message, conversationId, userId);
    }
    
    // Format context from relevant documents
    let context = '';
    if (relevantDocs && relevantDocs.length > 0) {
      context = relevantDocs
        .map((doc: any) => `Document: ${doc.title}\n${doc.content.substring(0, 1000)}`)
        .join('\n\n');
    } else {
      // No relevant documents found
      return NextResponse.json({
        message: "I don't have enough information to answer that question specifically. Please upload relevant documents first, or try asking a more general question.",
        conversationId: conversationId || 'temp-' + Date.now(),
        relevantContent: []
      });
    }
    
    // System prompt with context
    const systemPrompt = `You are a document assistant that only answers questions based on the provided documents. 
If the information isn't contained in the documents, say you don't know and suggest uploading more relevant documents.
Never make up information or use your general knowledge to answer questions.

Context from documents:
${context}`;
    
    // Format messages for OpenAI
    let aiResponse;
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      aiResponse = response.choices[0].message?.content || '';
    } catch (openaiError) {
      console.error('Error generating response from OpenAI:', openaiError);
      
      // Fallback to a simple response if OpenAI call fails
      aiResponse = "I'm having trouble processing your request right now. The documents you've uploaded may contain relevant information, but I can't access it at the moment. Please try again later.";
    }
    
    // Save the conversation and messages if we have a valid conversation
    let conversationRecord;
    try {
      if (!conversationId) {
        // Create a new conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            user_id: userId
          })
          .select()
          .single();
        
        if (convError) throw convError;
        conversationRecord = newConversation;
      } else {
        // Use existing conversation
        const { data: existingConversation, error: convError } = await supabase
          .from('conversations')
          .select()
          .eq('id', conversationId)
          .single();
        
        if (convError) throw convError;
        conversationRecord = existingConversation;
      }
      
      // Save user message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationRecord.id,
          content: message,
          role: 'user'
        });
      
      // Save AI response
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationRecord.id,
          content: aiResponse,
          role: 'assistant'
        });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database operations fail
    }
    
    return NextResponse.json({
      message: aiResponse,
      conversationId: conversationRecord?.id || 'temp-' + Date.now(),
      relevantContent: relevantDocs ? relevantDocs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity
      })) : []
    });
  } catch (error) {
    console.error('Error in document chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to handle fallback responses when document search fails
async function handleFallbackResponse(message: string, conversationId: string | undefined, userId: string) {
  try {
    // System prompt for fallback
    const fallbackSystemPrompt = `You are a helpful AI assistant. The user is trying to ask about documents, but there's an issue with the document retrieval system.
Explain that you can't access their documents right now, but you can still help with general questions.
Be empathetic and suggest they try again later or upload more documents if they haven't already.`;
    
    // Get a response from OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: fallbackSystemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const aiResponse = response.choices[0].message?.content || "I'm having trouble accessing the document database right now. Please try again later.";
    
    // Try to save the conversation if possible
    let conversationRecord;
    try {
      if (!conversationId) {
        // Create a new conversation
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            user_id: userId
          })
          .select()
          .single();
        
        if (newConversation) {
          conversationRecord = newConversation;
          
          // Save messages
          await supabase.from('messages').insert([
            {
              conversation_id: conversationRecord.id,
              content: message,
              role: 'user'
            },
            {
              conversation_id: conversationRecord.id,
              content: aiResponse,
              role: 'assistant'
            }
          ]);
        }
      }
    } catch (dbError) {
      console.error('Database error in fallback:', dbError);
      // Continue even if database operations fail
    }
    
    return NextResponse.json({
      message: aiResponse,
      conversationId: conversationRecord?.id || 'temp-' + Date.now(),
      relevantContent: []
    });
  } catch (fallbackError) {
    console.error('Error in fallback response:', fallbackError);
    
    // Ultimate fallback if everything fails
    return NextResponse.json({
      message: "I'm having technical difficulties right now. Please try again later.",
      conversationId: 'temp-' + Date.now(),
      relevantContent: []
    });
  }
} 