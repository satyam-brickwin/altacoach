import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * POST /api/admin/content/upload
 * Uploads a new content file and creates a content record
 */
export async function POST(request: NextRequest) {
  console.log('Content upload API called');
  
  try {
    // Parse the form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const language = formData.get('language') as string;
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    console.log('Received upload request:', { 
      title, 
      type, 
      language, 
      fileName: file?.name,
      fileSize: file?.size 
    });
    
    // Validate required fields
    if (!title || !type || !language || !file) {
      console.error('Missing required fields:', { title, type, language, file });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    try {
      // Generate a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      
      // Define public path for files
      const publicDirPath = join(process.cwd(), 'public');
      
      // First, try to save directly to database without file storage
      // This will help isolate if the problem is with the database or the file system
      const publicFilePath = `/storage/content/${fileName}`;
      
      // Create a new content record in the database
      const content = await prisma.content.create({
        data: {
          title,
          description: description || null,
          type,
          language,
          filePath: publicFilePath,
          createdById: userId || null,
          businessId: null,
        }
      });
      
      console.log('Content record created in database:', content);
      
      // Now try to save the file if possible
      try {
        // Ensure directories exist
        const storagePath = join(publicDirPath, 'storage');
        const contentPath = join(storagePath, 'content');
        
        console.log('Creating directories if they don\'t exist:');
        console.log('- Public dir path:', publicDirPath);
        console.log('- Storage path:', storagePath);
        console.log('- Content path:', contentPath);
        
        // Create directories if they don't exist
        if (!fs.existsSync(storagePath)) {
          await mkdir(storagePath, { recursive: true });
          console.log('Created storage directory');
        }
        
        if (!fs.existsSync(contentPath)) {
          await mkdir(contentPath, { recursive: true });
          console.log('Created content directory');
        }
        
        // Write file to disk
        const filePath = join(contentPath, fileName);
        console.log('Attempting to write file to:', filePath);
        
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        console.log('File successfully written to disk:', filePath);
        
        return NextResponse.json({ 
          success: true, 
          content,
          fileStored: true
        });
      } catch (fileError) {
        // Log file error but don't fail the request since the database entry was created
        console.error('Error writing file to disk (continuing anyway):', fileError);
        
        return NextResponse.json({ 
          success: true, 
          content,
          fileStored: false,
          fileError: 'Could not store file on disk, but database entry was created.'
        });
      }
    } catch (dbError) {
      console.error('Database error creating content:', dbError);
      return NextResponse.json(
        { error: 'Failed to save content to database', details: dbError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error },
      { status: 500 }
    );
  }
}

/**
 * In a production environment, you would use a cloud storage service like:
 * - AWS S3
 * - Google Cloud Storage
 * - Azure Blob Storage
 * - Cloudinary
 * - Vercel Blob
 * 
 * This would avoid filesystem permission issues and make your app more scalable.
 */

// Replace with these:
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Set an appropriate timeout for file uploads