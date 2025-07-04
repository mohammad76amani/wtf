import connect from "@/lib/data";
import SalonData from "@/models/salonData";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  await connect();
  try {
    const salonData = await SalonData.findOne({});

    if (!salonData) {
      return NextResponse.json(
        { message: "No salon data found" },
        { status: 404 }
      );
    }

    return NextResponse.json(salonData, { status: 200 });
  } catch (error) {
    console.error("Error fetching salon data:", error);
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
    
    // Check if salon data already exists
    const existingSalonData = await SalonData.findOne({});
    if (existingSalonData) {
      // Update existing salon data
      const updatedSalonData = await SalonData.findOneAndUpdate(
        {}, // empty filter to match the first document
        body,
        { new: true, runValidators: true }
      );
      
      return NextResponse.json(
        { message: "Salon data updated successfully", data: updatedSalonData },
        { status: 200 }
      );
    }
    
    // Create new salon data
    const newSalonData = new SalonData(body);
    const savedSalonData = await newSalonData.save();
    
    return NextResponse.json(
      { message: "Salon data created successfully", data: savedSalonData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating/updating salon data:", error);
    
    // Handle validation errors from Mongoose
    if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
      return NextResponse.json(
        { message: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
