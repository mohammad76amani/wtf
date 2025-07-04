import connect from "@/lib/data";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { name, phoneNumber, password } = await request.json();
  try {
    await connect();
    if (!connect) {
      return NextResponse.json({ error: "connection failed" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: name,
      phoneNumber,
      password: hashedPassword,
    });
    console.log(newUser);

    await newUser.save();
    console.log(newUser, "User created successfully");
    const token = jwt.sign(
      {
        id: newUser._id,
        pass: hashedPassword,
        phoneNumber: newUser.phoneNumber,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1000h" }
    );

    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        name: newUser.username,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connect();
      const token = request.headers.get("token");
      if (!token) {
        return NextResponse.json(
          { message: "No token provided" },
          { status: 401 }
        );
      }
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: string;
      };
      console.log(decodedToken);
      if (decodedToken.role !== "admin") {
          console.log(decodedToken.role);
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );}

     
    const users = await User.find();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  try {
    await connect();
    const id = request.headers.get("id");
    const body = await request.json();
const user = await User.findByIdAndUpdate(id, {
  role: body.role
}, { new: true });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
}