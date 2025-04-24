import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Update the saveMessageToDatabase function to correctly work with your schema
export async function PUT(request: Request) {
  try {
    const message = await request.json();
    
    // Validate required fields
    if (!message.id || !message.role || !message.text || !message.timestamp || !message.userId) {
      return NextResponse.json(
        { error: 'Missing required message fields' },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: message.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get user's business relationship if any
    const userWithBusiness = await prisma.user.findUnique({
      where: { id: message.userId },
      include: { 
        businesses: { 
          include: { business: true },
          take: 1 
        }
      }
    });

    let businessId;
    let adminId;
    
    if (userWithBusiness?.businesses && userWithBusiness.businesses.length > 0) {
      businessId = userWithBusiness.businesses[0].businessId;
      
      // Get business admin
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { createdBy: true }
      });
      
      if (business) {
        adminId = business.createdById;
      } else {
        console.log("Business not found for ID:", businessId);
      }
    } else {
      console.log("User has no associated business");
      return NextResponse.json({ 
        error: 'User has no associated business' 
      }, { status: 400 });
    }
    
    // If adminId is still undefined, we can't proceed
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin not found for this business' },
        { status: 400 }
      );
    }
    
    console.log(`Processing message for user: ${message.userId}, business: ${businessId}, admin: ${adminId}`);
    
    // Generate chat ID if not provided
    const chatId = message.chatId || uuidv4();
    
    if (message.role === 'user') {
      // Check if suggestion already exists with this message ID
      const existingSuggestion = await prisma.suggestion.findFirst({
        where: { 
          questionId: message.id,
          userId: message.userId
        }
      });
      
      if (existingSuggestion) {
        console.log("User message already exists:", existingSuggestion.id);
        
        // Update the existing suggestion with the new question text
        const updatedSuggestion = await prisma.suggestion.update({
          where: { id: existingSuggestion.id },
          data: {
            questionText: message.text, // Make sure to update questionText when message is updated
            updatedAt: new Date()
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'User message updated',
          suggestion: updatedSuggestion
        });
      }
      
      // Create a new suggestion entry for the user question
      try {
        const suggestionId = uuidv4();
        console.log("Creating suggestion for user message with ID:", suggestionId);
        
        const suggestion = await prisma.suggestion.create({
          data: {
            id: suggestionId,
            chatId: chatId,
            questionId: message.id,
            questionText: message.text, // Always store the user message text as questionText
            userId: message.userId,
            businessId: businessId,
            adminId: adminId
          }
        });
        
        console.log("Created suggestion:", suggestion.id);
        
        return NextResponse.json({
          success: true,
          message: 'User message saved as question',
          suggestion: suggestion
        });
      } catch (suggestionError: any) {
        console.error("Error creating suggestion:", suggestionError);
        return NextResponse.json({ 
          error: 'Failed to create suggestion for user message',
          details: suggestionError.message
        }, { status: 500 });
      }
      
    } else if (message.role === 'assistant') {
      // Find the most recent user question in the same chat without an answer
      const lastUserQuestion = await prisma.suggestion.findFirst({
        where: {
          chatId: chatId,
          userId: message.userId,
          answerText: null // Only find questions without answers
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (lastUserQuestion) {
        console.log("Found matching question for assistant response:", lastUserQuestion.id);
        
        // Update the existing suggestion with the answer
        try {
          const updatedSuggestion = await prisma.suggestion.update({
            where: { id: lastUserQuestion.id },
            data: {
              answerText: message.text,
              answerId: message.id,
              updatedAt: new Date()
            }
          });
          
          console.log("Updated suggestion with answer:", updatedSuggestion.id);
          
          return NextResponse.json({
            success: true,
            message: 'Assistant response saved as answer',
            suggestion: updatedSuggestion
          });
        } catch (updateError: any) {
          console.error("Error updating suggestion with answer:", updateError);
          return NextResponse.json({ 
            error: 'Failed to update suggestion with answer',
            details: updateError.message
          }, { status: 500 });
        }
      } else {
        console.log("No matching question found for assistant response, creating new entry");
        
        // If no matching question found, create a new suggestion for the answer
        try {
          const suggestionId = uuidv4();
          const placeholderQuestionId = uuidv4();
          
          const suggestion = await prisma.suggestion.create({
            data: {
              id: suggestionId,
              chatId: chatId,
              questionId: placeholderQuestionId,
              questionText: "Context not available", // Default placeholder
              answerText: message.text,
              answerId: message.id,
              userId: message.userId,
              businessId: businessId,
              adminId: adminId
            }
          });
          
          console.log("Created standalone answer suggestion:", suggestion.id);
          
          return NextResponse.json({
            success: true,
            message: 'Assistant response saved without matching question',
            suggestion: suggestion
          });
        } catch (createError: any) {
          console.error("Error creating suggestion for answer:", createError);
          return NextResponse.json({ 
            error: 'Failed to create suggestion for answer',
            details: createError.message
          }, { status: 500 });
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid message role. Must be "user" or "assistant"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}

// Modify the POST handler to avoid duplicate database entries
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      suggestionText, // User's feedback/suggestion about the assistant
      relatedMessageId,
      messageText,  // The actual message content 
      messageRole,  // 'user' or 'assistant'
      questionText, // A provided question text (which might not be the same as messageText)
      businessAdminName,
      businessDocuments = []
    } = body;

    // Log all received fields for debugging
    console.log('POST request body:', body);

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
          }
        });

        if (existingBusinessDocs.length > 0) {
          console.log(`Found ${existingBusinessDocs.length} existing business documents`);

          // Map ALL existing documents to the documentsSaved array
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
      // [Your existing error handling]
    }

    // IMPORTANT CHANGE: First check if there's already a suggestion record for this message
    let existingSuggestion = null;
    if (relatedMessageId) {
      if (messageRole === 'user') {
        existingSuggestion = await prisma.suggestion.findFirst({
          where: { 
            questionId: relatedMessageId,
            userId: userId
          }
        });
      } else if (messageRole === 'assistant') {
        existingSuggestion = await prisma.suggestion.findFirst({
          where: { 
            answerId: relatedMessageId,
            userId: userId
          }
        });
      }
    }

    // Determine document ID as before...
    let documentId: string | undefined = undefined;
    if (documentsSaved.length > 0) {
      documentId = documentsSaved[0].id;
      // [Your existing document validation code]
    }

    try {
      let suggestion;
      
      if (existingSuggestion) {
        // If a record already exists, update it with the suggestion text
        console.log(`Updating existing suggestion ${existingSuggestion.id} with suggestion text`);
        
        suggestion = await prisma.suggestion.update({
          where: { id: existingSuggestion.id },
          data: {
            suggestionText: suggestionText,
            // Only update document if it's defined
            ...(documentId && { documentId })
          }
        });
      } else {
        // No existing record, create a new one
        const suggestionId = uuidv4();
        console.log(`Creating new suggestion with ID ${suggestionId}`);

        // Improve how we handle the question text to ensure we get the actual user question
        let actualQuestionText;

        // If this is about an AI response, we need to find the user question that came before it
        if (messageRole === 'assistant') {
          // Try different approaches to find the original user question
          
          // First, try to find a question that matches the same chatId if available
          let userQuestion = null;
          
          if (relatedMessageId) {
            // Try to find the question that this answer is responding to
            console.log("Looking for question related to answerId:", relatedMessageId);
            
            // 1. Check if there's a message pair in existing suggestions
            userQuestion = await prisma.suggestion.findFirst({
              where: {
                userId: userId,
                answerId: relatedMessageId
              }
            });
            
            if (userQuestion?.questionText) {
              console.log("Found question through answerId relation");
            }
          }
          
          // 2. If no question found, try to get the most recent question without an answer
          if (!userQuestion) {
            console.log("No direct relation found, trying to find most recent question without answer");
            userQuestion = await prisma.suggestion.findFirst({
              where: {
                userId: userId,
                answerText: null
              },
              orderBy: { createdAt: 'desc' }
            });
            
            if (userQuestion?.questionText) {
              console.log("Found most recent unanswered question");
            }
          }
          
          // 3. If still no question, try to get the most recent question overall
          if (!userQuestion) {
            console.log("No unanswered question found, trying most recent question overall");
            userQuestion = await prisma.suggestion.findFirst({
              where: {
                userId: userId,
                questionText: { not: '' }
              },
              orderBy: { createdAt: 'desc' }
            });
            
            if (userQuestion?.questionText) {
              console.log("Found most recent question overall");
            }
          }
          
          // Use directly provided question text and ID if available
          if (messageRole === 'user') {
            // For user messages, always use the actual input text as the question, not the suggestion
            actualQuestionText = messageText; // This is the user's actual input message
            console.log(`Using user input as question text: "${actualQuestionText?.substring(0, 50)}..."`);
          } else if (questionText) {
            // For assistant replies, use provided question text when available
            actualQuestionText = questionText;
            console.log(`Using provided question text: "${actualQuestionText?.substring(0, 50)}..."`);
          } else if (userQuestion && userQuestion.questionText) {
            actualQuestionText = userQuestion.questionText;
            console.log(`Using related user question as fallback: "${actualQuestionText?.substring(0, 50)}..."`);
          } else {
            // Final fallback
            console.log("No question found in database, using message text as fallback");
            actualQuestionText = messageText || 'Unknown user question';
          }
        } else if (messageRole === 'user') {
          // If this is a user message, use its text as the question
          actualQuestionText = messageText;
          console.log(`Using user message text as question: "${actualQuestionText.substring(0, 50)}..."`);
        } else {
          // Fallback for any other case
          actualQuestionText = questionText || messageText || 'User question unavailable';
          console.log(`Using fallback text as question: "${actualQuestionText.substring(0, 50)}..."`);
        }

        // Set up the suggestion data with the actual question text
        const suggestionData: any = {
          id: suggestionId,
          chatId: uuidv4(), // Generate a chat ID
          questionId: messageRole === 'user' ? relatedMessageId : uuidv4(),
          answerId: messageRole === 'assistant' ? relatedMessageId : null,
          // Fix: Only use messageText for questionText when it's a user message
          questionText: messageRole === 'user' ? messageText : actualQuestionText,
          // Fix: Only set answerText for assistant messages
          answerText: messageRole === 'assistant' ? messageText : null,
          // Fix: Keep suggestionText separate from question/answer text
          suggestionText: suggestionText, // This is the user's feedback about the assistant
          userId: userId,
          businessId: businessId,
          adminId: adminId,
          // Only add documentId if it's defined
          ...(documentId && { documentId })
        };
        
        suggestion = await prisma.suggestion.create({
          data: suggestionData
        });
      }
      
      console.log("Suggestion saved:", suggestion.id);

      return NextResponse.json({ 
        success: true, 
        suggestion: {
          ...suggestion,
          documents: documentsSaved  // This will now include ALL documents
        },
        documentsSaved: documentsSaved.length,
        businessId
      });
    } catch (suggestionError: any) {
      console.error("Error saving suggestion:", suggestionError);
      return NextResponse.json({ 
        error: 'Failed to save suggestion',
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

// Update the GET endpoint to also retrieve messages for a chat
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const suggestionId = url.searchParams.get('suggestionId');
    const includeDocuments = url.searchParams.get('includeDocuments') === 'true';
    const documentType = url.searchParams.get('documentType');
    const chatId = url.searchParams.get('chatId');
    const includeMessages = url.searchParams.get('includeMessages') === 'true';

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

    // Add this debugging code temporarily to your API
    const allBusinessDocs = await prisma.businessDocument.findMany({
      where: { businessId },
      include: { document: true }
    });
    console.log(`DEBUG - All business documents for ${businessId}:`, 
      allBusinessDocs.map(bd => ({
        id: bd.documentId,
        title: bd.document.title,
        createdAt: bd.document.createdAt
      }))
    );

    let response: any = { 
      businessAdminName: business.createdBy.name,
      businessId,
      adminId: business.createdById,
      businessDocumentsCount: docCount
    };

    // If documents are requested, include them in the response
    if (includeDocuments) {
      try {
        // Get user with businesses and all their documents in one efficient query
        const userWithBusinesses = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            businesses: {
              include: {
                business: {
                  include: {
                    businessDocuments: {
                      include: {
                        document: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!userWithBusinesses || userWithBusinesses.businesses.length === 0) {
          console.log(`No businesses found for user ${userId}`);
          response.documents = [];
        } else {
          // Extract all documents from all businesses
          let documents = userWithBusinesses.businesses.flatMap(bu => 
            bu.business.businessDocuments.map(bd => ({
              id: bd.document.id,
              title: bd.document.title,
              description: bd.document.description || '',
              url: bd.document.url,
              fileType: bd.document.fileType,
              contentType: bd.document.contentType,
              source: bd.document.source,
              createdAt: bd.document.createdAt,
              businessDocumentId: `${bu.businessId}_${bd.document.id}`
            }))
          );

          console.log(`Retrieved ${documents.length} documents for user ${userId} across all businesses`);
          
          // Log the first few documents for debugging
          documents.slice(0, 3).forEach((doc, index) => {
            console.log(`Document ${index+1}: ID=${doc.id}, Title=${doc.title}`);
          });

          // Filter documents based on type if specified
          if (documentType) {
            console.log(`Filtering documents to keep only type: ${documentType}`);
            const filteredDocs = documents.filter(doc => doc.fileType === documentType);
            console.log(`After filtering: ${filteredDocs.length} documents remain`);
            documents = filteredDocs;
          }

          response.documents = documents;
        }
      } catch (documentsError: any) {
        console.error("Error retrieving documents:", documentsError);
        response.documentsError = "Failed to retrieve documents";
      }
    }

    // If messages are requested, include them in the response
    if (includeMessages && userId) {
      try {
        const queryParams: any = {
          where: { userId },
          orderBy: { createdAt: 'asc' }
        };
        
        // Add chatId filter if provided
        if (chatId) {
          queryParams.where.chatId = chatId;
        }

        // Get suggestions (which contain both questions and answers)
        const suggestions = await prisma.suggestion.findMany(queryParams);
        
        console.log(`Found ${suggestions.length} suggestion records for messages`);

        // Format suggestions into messages
        const messages = [];
        
        for (const suggestion of suggestions) {
          // Add user question if it exists and is not a placeholder
          if (suggestion.questionText && suggestion.questionText !== 'Context not available' && suggestion.questionText !== 'User Suggestion') {
            messages.push({
              id: suggestion.questionId,
              role: 'user',
              text: suggestion.questionText,
              timestamp: suggestion.createdAt,
              chatId: suggestion.chatId
            });
          }
          
          // Add assistant response if it exists
          if (suggestion.answerText) {
            messages.push({
              id: suggestion.answerId || uuidv4(),
              role: 'assistant',
              text: suggestion.answerText,
              timestamp: suggestion.updatedAt,
              chatId: suggestion.chatId
            });
          }
        }

        response.messages = messages;
        response.chatId = chatId;
      } catch (messagesError: any) {
        console.error("Error retrieving messages:", messagesError);
        response.messagesError = "Failed to retrieve messages";
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