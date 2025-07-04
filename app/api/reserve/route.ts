import Reservation from "@/models/reservation";
import connect from "@/lib/data";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import services from "@/models/services";
import User from "@/models/user";

// Define an interface for the reservation data
interface ReservationData {
  service: string;
  artist: string;
  date: Date;
  notes?: string;
  status: string;
  user?: string;
  guestInfo?: {
    name: string;
    phoneNumber: string;
  };
}

// Define an interface for the JWT token payload
interface JwtPayload {
  id: string;
  [key: string]: string;
}

export async function POST(request: Request) {
  await connect();
  
  try {
    const {
      service,
      artist,
      date,
      notes,
      guestName,
      guestPhoneNumber
    } = await request.json();
    
    const token = request.headers.get("token");
    
    // Initialize reservation data with common fields
    const reservationData: ReservationData = {
      service,
      artist,
      date: new Date(date),
      notes,
      status: 'pending'
    };

    // If token exists, try to use it for user authentication
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        if (decodedToken && typeof decodedToken === "object" && decodedToken.id) {
          // User is authenticated, use their ID
          reservationData.user = decodedToken.id;
          
          // Important: When user is authenticated, we don't need guestInfo
          // So we should NOT add empty guestInfo fields
        } else {
          // Token exists but doesn't have valid user ID
          // Fall back to guest info
          if (guestName && guestPhoneNumber) {
            reservationData.guestInfo = {
              name: guestName,
              phoneNumber: guestPhoneNumber
            };
          } else {
            return NextResponse.json(
              { message: "Invalid token and no guest information provided" },
              { status: 400 }
            );
          }
        }
      } catch (tokenError) {
        console.error("Token verification failed:", tokenError);
        // Token is invalid, fall back to guest info
        if (guestName && guestPhoneNumber) {
          reservationData.guestInfo = {
            name: guestName,
            phoneNumber: guestPhoneNumber
          };
        } else {
          return NextResponse.json(
            { message: "Invalid token and no guest information provided" },
            { status: 400 }
          );
        }
      }
    } 
    // No token, must use guest info
    else if (guestName && guestPhoneNumber) {
      reservationData.guestInfo = {
        name: guestName,
        phoneNumber: guestPhoneNumber
      };
    } 
    // Neither token nor guest info
    else {
      return NextResponse.json(
        { message: "Either login or provide guest information" },
        { status: 400 }
      );
    }

    // Check if we have either user ID or guest info
    if (!reservationData.user && (!reservationData.guestInfo || !reservationData.guestInfo.name || !reservationData.guestInfo.phoneNumber)) {
      return NextResponse.json(
        { message: "Either user authentication or complete guest information is required" },
        { status: 400 }
      );
    }

    const newReservation = new Reservation(reservationData);
    await newReservation.save();
    
    return NextResponse.json(
      { message: "Reservation created successfully", reservation: newReservation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { message: "Error creating reservation", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connect();
  
  try {
    const reservations = await Reservation.find()
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

export async function PUT(request: Request) {
  await connect();

  try {
    const { id, status } = await request.json();

       const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
       if (!validStatuses.includes(status)) {
         return NextResponse.json(
           { message: "وضعیت نامعتبر است" },
           { status: 400 }
         );
       }
       
       // Find and update the reservation
       const updatedReservation = await Reservation.findByIdAndUpdate(
         id,
         { status },
         { new: true }
       ).populate('service');
       
       if (!updatedReservation) {
         return NextResponse.json(
           { message: "رزرو مورد نظر یافت نشد" },
           { status: 404 }
         );
       }
       
       return NextResponse.json({
         message: "وضعیت رزرو با موفقیت بروزرسانی شد",
         reservation: updatedReservation
       });
     } catch (error) {
       console.error("Error updating reservation:", error);
       return NextResponse.json(
         { message: "خطا در بروزرسانی رزرو", error: (error as Error).message },
         { status: 500 }
       );
     }
   }