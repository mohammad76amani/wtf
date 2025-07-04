import connect from "@/lib/data";
import SiteSettings from "@/models/siteSettings";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  await connect();
  try {
    const settings = await SiteSettings.findOne({});

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = new SiteSettings({});
      await defaultSettings.save();
      return NextResponse.json(defaultSettings, { status: 200 });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connect();
  try {
    const body = await request.json();
    
    // Check if settings already exist
    const existingSettings = await SiteSettings.findOne({});
    if (existingSettings) {
      // Update existing settings
      const updatedSettings = await SiteSettings.findOneAndUpdate(
        {}, // empty filter to match the first document
        body,
        { new: true, runValidators: true }
      );
      
      return NextResponse.json(
        { message: "Site settings updated successfully", data: updatedSettings },
        { status: 200 }
      );
    }
    
    // Create new settings
    const newSettings = new SiteSettings(body);
    const savedSettings = await newSettings.save();
    
    return NextResponse.json(
      { message: "Site settings created successfully", data: savedSettings },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
