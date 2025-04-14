import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Add this language mapping function at the top of your file
const mapLanguageCodeToFullName = (code: string | null | undefined): string => {
  if (!code) return 'English'; // Default

  // Handle if already full name
  const fullLanguageNames = ['English', 'Español', 'Français', 'Deutsch', 'Português', 'Italiano'];
  if (fullLanguageNames.includes(code)) {
    return code;
  }

  // Map language codes to full names
  const languageMap: Record<string, string> = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'pt': 'Português',
    'it': 'Italiano',
    'EN': 'English',
    'ES': 'Español',
    'FR': 'Français',
    'DE': 'Deutsch',
    'PT': 'Português',
    'IT': 'Italiano'
  };

  return languageMap[code] || 'English';
};

export async function POST(request: Request) {
  try {
    const { users, businessId } = await request.json();
    
    // Log what we've received
    console.log(`Received ${users.length} users to create for business ${businessId}`);
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No users provided or invalid users array' 
      }, { status: 400 });
    }
    
    if (!businessId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Business ID is required' 
      }, { status: 400 });
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return NextResponse.json({ 
        success: false, 
        error: `Business with ID ${businessId} not found` 
      }, { status: 404 });
    }

    // Process users in batches to prevent timeouts
    const createdUsers = [];
    
    // Use Promise.all for better performance
    const userCreatePromises = users.map(async (userData) => {
      try {
        // Validate required fields
        if (!userData.name || !userData.email) {
          console.warn(`Skipping user with missing required fields: ${JSON.stringify(userData)}`);
          return null;
        }
        
        // Check for duplicate email
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });
        
        if (existingUser) {
          console.warn(`Skipping duplicate user with email: ${userData.email}`);
          return null;
        }
        
        // Generate password hash
        const password = userData.password || 'DefaultPassword123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create the user without nested businesses creation
        const newUser = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role?.toLowerCase() || 'user',
            status: userData.status?.toUpperCase() || 'ACTIVE',
            // Apply the mapping function to ensure full language name is stored
            language: mapLanguageCodeToFullName(userData.language),
            isVerified: false
          }
        });
        
        // Create the business user relationship with the correct relation format
        await prisma.businessUser.create({
          data: {
            user: {
              connect: { id: newUser.id }
            },
            business: {
              connect: { id: businessId }
            },
            // Update the createdBy field to be a proper relation
            createdBy: {
              connect: { id: newUser.id } // Connect to the same user
            }
          }
        });
        
        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          language: newUser.language,
          businessId: businessId
        };
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(userCreatePromises);
    const successfulUsers = results.filter(user => user !== null);
    
    console.log(`Successfully created ${successfulUsers.length} users`);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${successfulUsers.length} users`,
      users: successfulUsers
    });
    
  } catch (error) {
    console.error('Error in bulk user creation:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to create users: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}