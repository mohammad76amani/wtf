import connect from "@/lib/data";
import Category from "@/models/category";
import { NextResponse } from "next/server";
export async function GET() {
  await connect();
  try {
    const categories = await Category.find();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { message: "Error fetching reservations", error: (error as Error).message },
      { status: 500 }
    );
  }
}
 
export async function POST(request: Request) {
  await connect();
  try {
    const { name, description } = await request.json();
    const category = new Category({ name, description });
    await category.save();
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { message: "Error creating reservation", error: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  await connect();
  try {
    const { id } = await request.json();
    const category = await Category.findByIdAndDelete(id);
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { message: "Error deleting reservation", error: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  await connect();
  try {
    const { id, name, description } = await request.json();
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { message: "Error updating reservation", error: (error as Error).message },
      { status: 500 }
    );
  }
}