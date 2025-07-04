import { NextRequest, NextResponse } from 'next/server';
import connect from "@/lib/data";
import SiteSettings from "@/models/siteSettings";
import { pushFileDirectlyToGitHub } from '@/lib/githubDirect';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const index = formData.get('index') as string; // Position in gallery (0-5)
    const alt = formData.get('alt') as string || 'سالن زیبایی';
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    if (!index || isNaN(parseInt(index)) || parseInt(index) < 0 || parseInt(index) > 5) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid index. Must be between 0 and 5.' 
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

    // Generate a unique ID for this image
    const imageId = uuidv4();
    
    // Create the image object
    const galleryImage = {
      id: imageId,
      src: base64Image,
      alt: alt
    };

    // Connect to database
    await connect();
    
    // Get current settings
    const settings = await SiteSettings.findOne({});
    
    if (!settings) {
      // Create new settings with this gallery image
      const newSettings = new SiteSettings({
        galleryImages: Array(6).fill(null).map((_, i) => 
          i === parseInt(index) ? galleryImage : null
        ).filter(Boolean)
      });
      await newSettings.save();
    } else {
      // Update existing gallery images
      let galleryImages = settings.galleryImages || [];
      
      // Ensure we have 6 slots
      while (galleryImages.length < 6) {
        galleryImages.push(null);
      }
      
      // Update the specific index
      galleryImages[parseInt(index)] = galleryImage;
      
      // Remove any null values
      galleryImages = galleryImages.filter(Boolean);
      
      // Update settings
      await SiteSettings.findOneAndUpdate(
        {}, 
        { galleryImages: galleryImages },
        { new: true }
      );
    }

    // Define the file path for GitHub
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `/images/gallery/gallery-${index}.${fileExtension}`;

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
      console.log('Attempting to push gallery image directly to GitHub...');
      const pushed = await pushFileDirectlyToGitHub(filePath, base64Image, true);
      
      if (pushed) {
        console.log('Successfully pushed gallery image to GitHub');
      } else {
        console.warn('Failed to push gallery image to GitHub');
      }
    } catch (githubError) {
      console.error('Error pushing to GitHub:', githubError);
    }

    return NextResponse.json({ 
      success: true, 
      galleryImage: galleryImage,
      index: parseInt(index),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error uploading gallery image' 
    }, { status: 500 });
  }
}
