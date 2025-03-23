import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

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

    // System prompt for AltaCoach
    const systemPrompt = `You are AltaCoach, an AI assistant specialized in providing coaching and training support.
You help professionals apply their knowledge in real-world scenarios, reinforcing learning and accelerating skill development.
Be concise, helpful, and supportive in your responses.`;
    
    // Format messages for OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const aiResponse = response.choices[0].message?.content || '';
    
    // Save the conversation and messages if we have Supabase configured
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
        
        if (!convError && newConversation) {
          conversationRecord = newConversation;
          
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
        }
      } else {
        // Use existing conversation
        const { data: existingConversation, error: convError } = await supabase
          .from('conversations')
          .select()
          .eq('id', conversationId)
          .single();
        
        if (!convError && existingConversation) {
          conversationRecord = existingConversation;
          
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
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database operations fail
    }
    
    return NextResponse.json({
      message: aiResponse,
      conversationId: conversationRecord?.id || 'temp-' + Date.now(),
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 