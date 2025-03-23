import { Message } from '@/types';
import { prisma } from '@/lib/prisma';

// Define the OpenAI API response type
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Get the system prompt from the database
 * @returns The system prompt content
 */
export async function getSystemPrompt(): Promise<string> {
  try {
    // Get the most recent active prompt from the database
    const activePrompt = await prisma.aIPrompt.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Return the active prompt content or a default prompt
    return activePrompt?.content || 
      "You are AltaCoach, an AI assistant specialized in providing coaching and training support. " +
      "Be helpful, clear, and concise in your responses. If you don't know something, say so instead of making up information.";
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    // Return a default prompt if there's an error
    return "You are AltaCoach, an AI assistant specialized in providing coaching and training support. " +
      "Be helpful, clear, and concise in your responses. If you don't know something, say so instead of making up information.";
  }
}

/**
 * Call the OpenAI API with the given messages
 * @param messages Array of messages to send to OpenAI
 * @returns The AI's response content
 */
export async function callOpenAI(messages: any[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

/**
 * Format messages for the OpenAI API
 * @param messages Array of messages from the conversation
 * @returns Formatted messages for the OpenAI API
 */
export async function formatMessagesForOpenAI(messages: Message[]): Promise<any[]> {
  // Get the system prompt
  const systemPrompt = await getSystemPrompt();
  
  // Format the messages for OpenAI
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(message => ({
      role: message.role === 'user' ? 'user' : 'assistant',
      content: message.text,
    })),
  ];

  return formattedMessages;
} 