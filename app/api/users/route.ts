import User from "@/models/user";
import connect from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await connect();
  
  try {
    // Get the role from query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    // Build query based on role parameter
    const query = role ? { role } : {};
    
    // Fetch users based on query
    const users = await User.find(query).select('username phoneNumber role');
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", error: (error as Error).message },
      { status: 500 }
    );
  }
}
