import Reservation from "@/models/reservation";
import User from "@/models/user";
import connect from "@/lib/data";
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  await connect();
  
  try {
    const url = request.url;
    const pathParts = url.split('/');
    const id = pathParts[pathParts.indexOf('reserve') + 1];
    
    // Get the artist ID from the request body
    const { artistId } = await request.json();
    
    // Validate artist exists and has the role 'artist'
    const artist = await User.findOne({ _id: artistId, role: 'artist' });
    
    if (!artist) {
      return NextResponse.json(
        { message: "آرایشگر مورد نظر یافت نشد" },
        { status: 404 }
      );
    }
    
    // Find and update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { artist: artistId },
      { new: true }
    ).populate('service').populate('artist', 'username phoneNumber');
    
    if (!updatedReservation) {
      return NextResponse.json(
        { message: "رزرو مورد نظر یافت نشد" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "آرایشگر با موفقیت به رزرو اختصاص داده شد",
      reservation: updatedReservation,
      artist: {
        _id: artist._id,
        username: artist.username,
        phoneNumber: artist.phoneNumber
      }
    });
  } catch (error) {
    console.error("Error assigning artist to reservation:", error);
    return NextResponse.json(
      { message: "خطا در تخصیص آرایشگر", error: (error as Error).message },
      { status: 500 }
    );
  }
}
