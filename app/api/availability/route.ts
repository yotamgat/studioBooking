import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Studio from '@/models/Studio';
import Availability from '@/models/Availability';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get('studioId');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!studioId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Studio ID and date are required',
        },
        { status: 400 }
      );
    }

    // Verify studio exists
    const studio = await Studio.findById(studioId);
    if (!studio) {
      return NextResponse.json(
        {
          success: false,
          error: 'Studio not found',
        },
        { status: 404 }
      );
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get availability settings for this day
    const availability = await Availability.findOne({
      studio: studioId,
      $or: [
        { specificDate: requestedDate },
        { dayOfWeek: dayOfWeek, specificDate: { $exists: false } },
      ],
    }).sort({ specificDate: -1 }); // Prefer specific date over general day

    if (!availability || !availability.isAvailable) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          message: 'Studio is closed on this day',
          timeSlots: [],
        },
      });
    }

    // Get all bookings for this studio on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      studio: studioId,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $gte: startOfDay, $lt: endOfDay } },
        { endTime: { $gt: startOfDay, $lte: endOfDay } },
        { startTime: { $lte: startOfDay }, endTime: { $gte: endOfDay } },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        timeSlots: availability.timeSlots,
        bookedSlots: bookings.map(b => ({
          start: b.startTime,
          end: b.endTime,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}
