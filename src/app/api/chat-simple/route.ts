import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    // Validate the message
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate a simple response based on the input
    let response = "I'm a simple AI assistant. ";
    
    if (message.toLowerCase().includes('hi') || 
        message.toLowerCase().includes('hello') || 
        message.toLowerCase().includes('hey')) {
      response += "Hello! How can I help you today?";
    } else if (message.toLowerCase().includes('how are you')) {
      response += "I'm doing well, thank you for asking. How can I assist you?";
    } else if (message.toLowerCase().includes('help')) {
      response += "I'd be happy to help. Could you please provide more details about what you need assistance with?";
    } else if (message.toLowerCase().includes('thank')) {
      response += "You're welcome! Let me know if you need anything else.";
    } else {
      response += "I understand you said: \"" + message + "\". Is there something specific you'd like to know more about?";
    }
    
    // Return the response
    return NextResponse.json({
      message: response,
      conversationId: 'simple-' + Date.now(),
    });
  } catch (error) {
    console.error('Error in simple chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 