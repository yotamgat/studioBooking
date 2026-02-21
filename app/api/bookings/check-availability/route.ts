import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET /api/bookings/check-availability?studioId=xxx&date=2024-02-15&startTime=09:00&duration=60
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get('studioId');
    const dateStr = searchParams.get('date');
    const startTimeStr = searchParams.get('startTime'); // "HH:mm"
    const duration = parseInt(searchParams.get('duration') || '60'); // minutes

    if (!studioId || !dateStr || !startTimeStr) {
      return NextResponse.json(
        {
          success: false,
          error: 'חסרים פרטים נדרשים',
        },
        { status: 400 }
      );
    }

    // Use local date interpretation
    const dateOnly = new Date(dateStr).toLocaleDateString('en-CA');
    const requestedStart = new Date(`${dateOnly}T${startTimeStr}:00`);

    const requestedEnd = new Date(requestedStart);
    requestedEnd.setMinutes(requestedEnd.getMinutes() + duration);

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      studioId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          // Existing booking starts during requested time
          startTime: {
            $gte: requestedStart,
            $lt: requestedEnd,
          },
        },
        {
          // Existing booking ends during requested time
          endTime: {
            $gt: requestedStart,
            $lte: requestedEnd,
          },
        },
        {
          // Requested time is completely within existing booking
          startTime: { $lte: requestedStart },
          endTime: { $gte: requestedEnd },
        },
      ],
    });

    return NextResponse.json({
      success: true,
      available: !overlappingBooking,
      requestedStart: requestedStart.toISOString(),
      requestedEnd: requestedEnd.toISOString(),
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'שגיאה בבדיקת זמינות',
      },
      { status: 500 }
    );
  }
}
