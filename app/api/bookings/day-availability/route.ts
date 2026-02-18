import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { startOfDay, endOfDay } from 'date-fns';

// GET /api/bookings/day-availability?studioId=xxx&date=2024-02-15
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get('studioId');
    const dateStr = searchParams.get('date');

    if (!studioId || !dateStr) {
      return NextResponse.json(
        { success: false, error: 'חסרים פרטים' },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);

    // Get all bookings for this studio on this day
    const bookings = await Booking.find({
      studioId,
      status: { $ne: 'cancelled' },
      startTime: {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      },
    });

    // Create slots for each hour (9-22)
    const slots = [];
    for (let hour = 9; hour < 23; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this hour has any booking
      const hasBooking = bookings.some(booking => {
        return (
          (booking.startTime < slotEnd && booking.endTime > slotStart)
        );
      });

      slots.push({
        hour,
        available: !hasBooking,
      });
    }

    return NextResponse.json({
      success: true,
      date: dateStr,
      slots,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
