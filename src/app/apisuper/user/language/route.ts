import { NextRequest, NextResponse } from 'next/server';

// API endpoint to update the user's preferred language
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { language, userId } = await request.json();
    
    if (!language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    // List of supported languages
    const supportedLanguages = ['en', 'fr', 'de', 'it', 'es'];
    
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    // Update the user's language preference in the database
    // This is a placeholder - actual implementation will depend on your database setup
    // For example:
    /*
    const updatedUser = await updateUserLanguage(userId, language);
    */
    
    // Return success response
    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error('Error updating language preference:', error);
    return NextResponse.json(
      { error: 'Failed to update language preference' },
      { status: 500 }
    );
  }
} 