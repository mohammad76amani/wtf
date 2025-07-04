import connect from "@/lib/data";
import Reservation from "@/models/reservation";
import services from "@/models/services";
import User from "@/models/user";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  await connect();
    
  try {
      const token = request.headers.get('Authorization')?.split(' ')[1];
      if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      if (!decodedToken) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const artistId = decodedToken.userId;

      const reservations = await Reservation.find({ artist: artistId })
          .populate({
              path: 'service',
              model: services,
              select: 'name price duration category'
          }).populate({
              path: 'artist',
              model: User,
              select: 'username phoneNumber'
          });
      
      return NextResponse.json({ reservations });
  } catch (error) {
      console.error("Error fetching reservations:", error);
      return NextResponse.json(
          { message: "Error fetching reservations", error: (error as Error).message },
          { status: 500 }
      );
  }
}  