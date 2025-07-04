import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';
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

      // Always use the same filename for the salon logo
      const fileName = 'salon-logo.jpg';
      const dirPath = path.join(process.cwd(), 'public', 'images', 'logos');
      const filePath = `/images/logos/${fileName}`;
      const fullPath = path.join(process.cwd(), 'public', filePath);

      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
      }

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
