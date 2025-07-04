import { NextResponse } from 'next/server';
import connect from "@/lib/data";
import SiteSettings from "@/models/siteSettings";

export async function GET() {
  try {
    await connect();
    
    // Get site settings
    const settings = await SiteSettings.findOne({});
    
    if (!settings || !settings.galleryImages || settings.galleryImages.length === 0) {
      return NextResponse.json({ 
        success: true, 
        galleryImages: [] 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      galleryImages: settings.galleryImages 
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error fetching gallery images' 
    }, { status: 500 });
  }
}
