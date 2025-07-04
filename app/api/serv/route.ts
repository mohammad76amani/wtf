import {  NextResponse } from "next/server";
import Service from "@/models/services";
import connect from "@/lib/data";
import Category from "@/models/category";
// GET endpoint to fetch all services
export async function GET() {
  try {
    await connect();
    
    // Get query parameters
   
    
    const services = await Service.find().populate({
        path: 'category',
        model: Category,
        select: 'name'
    });
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  await connect();
  try {
    const serviceData = await request.json();
    const service = new Service(serviceData);
    await service.save();
    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { message: "Error creating service", error: (error as Error).message },
      { status: 500 }
    );
  }
}