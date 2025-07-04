import { NextResponse } from "next/server";
import User from "@/models/user";
import connect from "@/lib/data";

export async function GET() {
  await connect();
  try {
    const users = await User.find({
        role: "artist",
      });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", error: (error as Error).message },
      { status: 500 }
    );
  }
}