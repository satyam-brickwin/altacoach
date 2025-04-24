import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      suggestionText, 
      businessAdminName,
      businessDocuments = []
    } = body;

    if (!userId || !suggestionText) {
      return NextResponse.json(
        { error: 'User ID and suggestion text are required' },
        { status: 400 }
      );
    }

    // Get user info to determine if user has a business relationship
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        businesses: { 
          include: { business: true },
          take: 1 
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get a business ID and admin ID (required by the schema)
    let businessId: string | undefined;
    let adminId: string | undefined;
    let documentsSaved: any[] = [];
    let suggestionId = uuidv4(); // Generate suggestion ID upfront

    if (user.businesses.length > 0) {
      // Use associated business if available
      businessId = user.businesses[0].businessId;
      
      // Get the business creator (the admin who created the business)
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { createdBy: true }
      });
      
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
      
      // Use the business creator as the admin
      adminId = business.createdById;
      
      // If businessAdminName is provided and the current user is the business creator,
      // update the admin name
      if (businessAdminName && business.createdById === userId) {
        await prisma.user.update({
          where: { id: adminId },
          data: { name: businessAdminName }
        });
      }
      
      // Process business documents if provided
      if (businessDocuments.length > 0) {
        for (const doc of businessDocuments) {
          try {
            // First create the Document record with explicit ID
            const documentId = uuidv4();
            console.log("Creating document with ID:", documentId);
            
            const document = await prisma.document.create({
              data: {
                id: documentId,
                title: doc.name || 'Unnamed Document',
                description: doc.description || '',
                language: 'English',
                source: user.role === 'ADMIN' ? 'admin' : 'business',
                fileType: doc.type || 'pdf',
                contentType: doc.contentType || 'GUIDE',
                url: doc.url || '',
                createdById: userId
              }
            });
            
            console.log("Created document:", document.id);
            
            // Validate the document was created properly
            if (!document || !document.id) {
              console.error("Failed to create document properly");
              continue;
            }
            
            // Then create the BusinessDocument junction record
            try {
              const businessDocument = await prisma.businessDocument.create({
                data: {
                  businessId: businessId,
                  documentId: document.id,
                  adminId: adminId
                }
              });
              
              console.log("Created business document junction:", businessDocument);
              
              // Verify the business document was created
              const verifyBD = await prisma.businessDocument.findFirst({
                where: {
                  businessId: businessId,
                  documentId: document.id
                }
              });
              
              if (verifyBD) {
                console.log("Business document verified in database");
                documentsSaved.push({
                  id: document.id,
                  title: document.title,
                  url: document.url,
                  type: document.fileType,
                  businessDocumentId: `${businessId}_${document.id}`
                });
              } else {
                console.error("Business document not found in database after creation!");
              }
            } catch (bdError: any) {
              console.error("Error creating business document:", bdError);
            }
          } catch (docError: any) {
            console.error("Error creating document:", docError);
            // Continue with the next document even if one fails
          }
        }
      } else {
        // If no business documents are provided in request, check if user has existing ones
        console.log("No business documents provided in request, looking for existing ones...");
        
        const existingBusinessDocs = await prisma.businessDocument.findMany({
          where: { 
            businessId: businessId 
          },
          include: {
            document: true
          },
          take: 5
        });
        
        if (existingBusinessDocs.length > 0) {
          console.log(`Found ${existingBusinessDocs.length} existing business documents`);
          
          // Use the first existing document
          documentsSaved = existingBusinessDocs.map(bd => ({
            id: bd.document.id,
            title: bd.document.title,
            url: bd.document.url,
            type: bd.document.fileType,
            businessDocumentId: `${bd.businessId}_${bd.documentId}`
          }));
        } else {
          console.log("No existing business documents found");
        }
      }
    } else {
      // User has no business association, handle accordingly...
      // [similar logic as before, omitted for brevity]
    }

    // Double-check business document count after processing
    const finalDocCheck = await prisma.businessDocument.count({
      where: { businessId }
    });
    
    console.log(`Final business document count for business ${businessId}: ${finalDocCheck}`);

    // Determine if we have a document to link to the suggestion
    let documentId: string | undefined = undefined;
    if (documentsSaved.length > 0) {
      documentId = documentsSaved[0].id;
      console.log("Setting suggestion document ID to:", documentId);
      
      // Verify document exists
      const docCheck = await prisma.document.findUnique({
        where: { id: documentId }
      });
      
      if (!docCheck) {
        console.error(`Document with ID ${documentId} not found in database!`);
        documentId = undefined;
      } else {
        // Also verify the business document junction record exists
        const bdCheck = await prisma.businessDocument.findFirst({
          where: {
            businessId,
            documentId
          }
        });
        
        if (!bdCheck) {
          console.error(`BusinessDocument junction for document ${documentId} not found!`);
        } else {
          console.log("BusinessDocument junction verified");
        }
      }
    } else {
      console.log("No documents to link to suggestion");
    }

    try {
      // Create the suggestion
      const suggestionData: any = {
        id: suggestionId,
        chatId: uuidv4(),
        questionId: uuidv4(),
        questionText: 'User Suggestion',
        suggestionText,
        userId,
        businessId,
        adminId
      };
      
      // Only add documentId if it's defined
      if (documentId) {
        suggestionData.documentId = documentId;
      }
      
      console.log("Creating suggestion with data:", suggestionData);
      
      const suggestion = await prisma.suggestion.create({
        data: suggestionData
      });
      
      console.log("Created suggestion:", suggestion);

      return NextResponse.json({ 
        success: true, 
        suggestion: {
          ...suggestion,
          documents: documentsSaved
        },
        documentsSaved: documentsSaved.length,
        businessId
      });
    } catch (suggestionError: any) {
      console.error("Error creating suggestion:", suggestionError);
      return NextResponse.json({ 
        error: 'Failed to create suggestion',
        details: suggestionError.message,
        documentsWereSaved: documentsSaved.length > 0,
        documents: documentsSaved
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in suggestion API:', error);
    return NextResponse.json(
      { error: 'Failed to process suggestion', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve business admin name and documents
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const suggestionId = url.searchParams.get('suggestionId');
    const includeDocuments = url.searchParams.get('includeDocuments') === 'true';
    const documentType = url.searchParams.get('documentType');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user info with associated business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        businesses: { 
          include: { business: true },
          take: 1 
        }
      }
    });

    if (!user || user.businesses.length === 0) {
      // User has no business association, return empty response
      return NextResponse.json({ 
        businessAdminName: null,
        documents: []
      });
    }

    // Get the user's business ID
    const businessId = user.businesses[0].businessId;
    console.log(`User ${userId} is associated with business ${businessId}`);
    
    // Get the business creator's information
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { createdBy: true }
    });

    if (!business) {
      return NextResponse.json({ 
        businessAdminName: null,
        documents: []
      });
    }

    // Count business documents to verify data
    const docCount = await prisma.businessDocument.count({
      where: { businessId }
    });
    
    console.log(`Found ${docCount} business documents for business ${businessId}`);

    let response: any = { 
      businessAdminName: business.createdBy.name,
      businessId,
      adminId: business.createdById,
      businessDocumentsCount: docCount
    };

    // If documents are requested, include them in the response
    if (includeDocuments) {
      try {
        // Use Prisma's native API for better reliability
        const businessDocuments = await prisma.businessDocument.findMany({
          where: { 
            businessId
          },
          include: {
            document: true
          },
          orderBy: {
            document: {
              createdAt: 'desc'
            }
          }
        });
        
        console.log(`Retrieved ${businessDocuments.length} business documents with document details`);
        
        if (businessDocuments.length === 0) {
          console.log("No business documents found for this business");
        }
        
        // Format the documents for the response
        let documents = businessDocuments.map(bd => ({
          id: bd.document.id,
          title: bd.document.title,
          description: bd.document.description || '',
          url: bd.document.url,
          fileType: bd.document.fileType,
          contentType: bd.document.contentType,
          source: bd.document.source,
          createdAt: bd.document.createdAt,
          businessDocumentId: `${bd.businessId}_${bd.documentId}`
        }));
        
        // Filter documents based on type if specified
        if (documentType && documents.length > 0) {
          documents = documents.filter(doc => doc.fileType === documentType);
        }

        response.documents = documents;
        
        // If a specific suggestion ID is provided, get its document
        if (suggestionId) {
          const suggestion = await prisma.suggestion.findUnique({
            where: { id: suggestionId }
          });
          
          if (suggestion && suggestion.documentId) {
            console.log(`Suggestion ${suggestionId} has document ID: ${suggestion.documentId}`);
            
            const document = await prisma.document.findUnique({
              where: { id: suggestion.documentId }
            });
            
            if (document) {
              response.suggestionDocument = {
                id: document.id,
                title: document.title,
                description: document.description || '',
                url: document.url,
                fileType: document.fileType,
                contentType: document.contentType,
                source: document.source,
                createdAt: document.createdAt,
                businessDocumentId: `${businessId}_${document.id}`
              };
            }
          } else {
            console.log(`Suggestion ${suggestionId} has no document ID`);
          }
        }
      } catch (documentsError: any) {
        console.error("Error retrieving documents:", documentsError);
        response.documentsError = "Failed to retrieve documents";
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error retrieving business data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve business data', details: error.message },
      { status: 500 }
    );
  }
}