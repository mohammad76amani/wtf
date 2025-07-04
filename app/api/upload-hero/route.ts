import { NextRequest, NextResponse } from 'next/server';
import connect from "@/lib/data";
import { pushFileDirectlyToGitHub } from '@/lib/githubDirect';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'File must be an image' 
      }, { status: 400 });
    }

    // Convert the file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Connect to database
    await connect();
    
    // Update site settings with the new hero image


    // Define the file path for GitHub
    const filePath = '/images/hero/hero-image.webp';

    // Try to write to local filesystem (will work in development, fail in production)
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      const dir = path.dirname(fullPath);
      
      // Ensure directory exists (will fail in production)
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (mkdirError) {
        console.log('Could not create directory (expected in production):', mkdirError);
      }
      
      // Try to write file (will fail in production)
      try {
        await fs.writeFile(fullPath, buffer);
        console.log('Successfully wrote file to local filesystem');
      } catch (writeError) {
        console.log('Could not write file to local filesystem (expected in production):', writeError);
      }
    } catch (fsError) {
      console.log('Filesystem operations failed (expected in production):', fsError);
    }

    // Push directly to GitHub without relying on local file
    try {
      console.log('Attempting to push hero image directly to GitHub...');
      const pushed = await pushFileDirectlyToGitHub(filePath, base64Image, true);
      
      if (pushed) {
        console.log('Successfully pushed hero image to GitHub');
      } else {
        console.warn('Failed to push hero image to GitHub');
      }
    } catch (githubError) {
      console.error('Error pushing to GitHub:', githubError);
    }

    return NextResponse.json({ 
      success: true, 
      heroImage: base64Image,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error uploading hero image:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error uploading hero image' 
    }, { status: 500 });
  }
}
