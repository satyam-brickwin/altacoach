import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { FileType } from 'lucide-react';
import FormData from 'form-data';
import axios from 'axios';

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
    const contentType = formData.get('doctype') as string;
    const language = formData.get('language') as string;
    const source = formData.get('source') as string;
    // const file = formData.get('file') as File;
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
    }
    console.log('Upload API called 1');
    // const userIdStr = formData.get('userId');
    // const userId = userIdStr ? parseInt(userIdStr.toString(), 10) : null;
    // if (userIdStr && isNaN(userId)) {
    //   return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    // }
    const userId = formData.get('userId')?.toString() || null;
    console.log('Upload API called 2');
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
      const contentPath = join(publicDirPath, 'storage', 'content');
      const fullFilePath = join(contentPath, fileName);
      // Create a new content record in the database
      const content = await prisma.document.create({
        data: {
          title,
          description: description || null,
          fileType: type,
          language,
          source,
          contentType,
          url: publicFilePath,
          createdBy: userId ? { connect: { id: userId } } : undefined
        }
      });

      console.log('Content record created in database:', content);

      const businessId = formData.get('businessId');
      // const businessId = businessIdRaw ? parseInt(businessIdRaw.toString(), 10) : null;

      if (businessId) {
        await prisma.businessDocument.create({
          data: {
            businessId: businessId,
            documentId: content.id,
            adminId: userId ?? null
          }
        });
      } else {
        console.warn('Business document uploaded, but user has no businessId');
      }

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
        try {
          const fastapiUrl = `${process.env.FASTAPI_BASE_URL}/upload-api/`;
          const fastapiForm = new FormData();

          fastapiForm.append('file', fs.createReadStream(fullFilePath), fileName);
          fastapiForm.append('file_id', content.id);
          fastapiForm.append('created_by', userId || 'unknown');
          fastapiForm.append(
            'extra_metadata',
            JSON.stringify({
              title,
              description,
              language,
              source,
              contentType,
              fileType: type,
              businessId: businessId || null,
            })
          );

          axios.post(fastapiUrl, fastapiForm, {
            headers: fastapiForm.getHeaders(),
          })
            .then(res => {
              console.log('🔄 FastAPI sync completed in background:', res.data);
            })
            .catch(err => {
              console.error('⚠️ FastAPI background sync failed:', err);
            });
        } catch (fastapiError) {
          console.error('⚠️ FastAPI sync failed:', fastapiError);
        }

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

// Replace the deprecated config export with the new route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout
export const fetchCache = 'force-no-store';

// Optional: Set maximum file size limit if needed
// export const generateStaticParams = () => {
//   return {
//     maxFileSize: 4 * 1024 * 1024, // 4MB
//   };
// };