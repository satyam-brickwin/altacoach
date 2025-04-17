import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { documentIds, businessId, userIds } = await req.json();
    
    // Validate required parameters
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Document IDs are required' }, { status: 400 });
    }
    
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID is required' }, { status: 400 });
    }
    
    // Log operation details
    console.log(`Connecting ${documentIds.length} documents to business ${businessId}`);
    
    // If userIds not provided, fetch all users for the business
    let usersToConnect = userIds;
    if (!usersToConnect || !Array.isArray(usersToConnect) || usersToConnect.length === 0) {
      // Using direct Prisma query based on your schema
      const businessUsers = await prisma.user.findMany({
        where: { businessId: businessId },
        select: { id: true }
      });
      
      usersToConnect = businessUsers.map(user => user.id);
      console.log(`Found ${usersToConnect.length} users in business ${businessId}`);
    }
    
    if (usersToConnect.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No users found for this business' },
        { status: 404 }
      );
    }
    
    console.log(`Connecting documents to ${usersToConnect.length} users`);
    
    // Track successful connections
    let connectionCount = 0;

    // Based on the provided schema, we need to get the user who created the business or any user from the business
    try {
      // Find business users who are associated with this business
      const businessUserRecord = await prisma.businessUser.findFirst({
        where: {
          businessId: businessId
        },
        select: {
          userId: true
        }
      });
      
      if (!businessUserRecord) {
        // If no business user is found, try to find the user who created the business
        const business = await prisma.business.findUnique({
          where: { id: businessId },
          select: { createdById: true }
        });
        
        if (!business) {
          return NextResponse.json(
            { success: false, error: 'Business not found' },
            { status: 404 }
          );
        }
        
        // Use the business creator as the admin
        const adminId = business.createdById;
        
        // Create BusinessDocument entries for each document
        for (const documentId of documentIds) {
          try {
            // Check if the document-business connection already exists
            const existingConnection = await prisma.businessDocument.findUnique({
              where: {
                businessId_documentId: {
                  businessId: businessId,
                  documentId: documentId
                }
              }
            });
            
            if (!existingConnection) {
              // Create a new BusinessDocument record
              await prisma.businessDocument.create({
                data: {
                  businessId: businessId,
                  documentId: documentId,
                  adminId: adminId,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });
              
              connectionCount++;
              console.log(`Connected document ${documentId} to business ${businessId} using creator as admin`);
            } else {
              console.log(`Document ${documentId} already connected to business ${businessId}`);
            }
          } catch (connectionError) {
            console.error(`Error connecting document ${documentId} to business ${businessId}:`, connectionError);
          }
        }
      } else {
        // Use the first business user as the admin
        const adminId = businessUserRecord.userId;
        
        // Create BusinessDocument entries for each document
        for (const documentId of documentIds) {
          try {
            // Check if the document-business connection already exists
            const existingConnection = await prisma.businessDocument.findUnique({
              where: {
                businessId_documentId: {
                  businessId: businessId,
                  documentId: documentId
                }
              }
            });
            
            if (!existingConnection) {
              // Create a new BusinessDocument record
              await prisma.businessDocument.create({
                data: {
                  businessId: businessId,
                  documentId: documentId,
                  adminId: adminId,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });
              
              connectionCount++;
              console.log(`Connected document ${documentId} to business ${businessId} using business user as admin`);
            } else {
              console.log(`Document ${documentId} already connected to business ${businessId}`);
            }
          } catch (connectionError) {
            console.error(`Error connecting document ${documentId} to business ${businessId}:`, connectionError);
          }
        }
      }
      
      console.log(`Created ${connectionCount} document-business connections`);
      
    } catch (error) {
      console.error("Error finding business users:", error);
      throw error;
    }
    
    // Revalidate content paths to update UI
    revalidatePath('/admin/businesses');
    revalidatePath('/admin/content');
    
    return NextResponse.json({
      success: true,
      message: `Successfully connected ${connectionCount} documents to business ${businessId}`,
      connections: connectionCount
    });
    
  } catch (error) {
    console.error('Error in connect-to-business API route:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: `Failed to connect documents: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Keep OPTIONS method to handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS'
    }
  });
}
