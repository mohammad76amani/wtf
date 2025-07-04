import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { handleImageUploadWithGitHubSync, UploadResult } from '@/middleware/imageUploadMiddleware';

export async function POST(request: NextRequest) {
  return handleImageUploadWithGitHubSync(async () => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return {
          success: false,
          error: 'No file uploaded'
        };
      }

      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image'
        };
      }

      // Create a unique filename
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `/images/salon-logos/${fileName}`;
      const fullPath = path.join(process.cwd(), 'public', filePath);

      // Convert the file to a Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write the file to the public directory
      await writeFile(fullPath, buffer);

      return {
        success: true,
        filePath: filePath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: 'Error uploading file'
      };
    }
  }).then((result: UploadResult) => {
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        filePath: result.filePath 
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  });
}