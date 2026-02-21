import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { israelTimeToUTC } from '@/lib/timezone';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get('studioId');
    const dateStr = searchParams.get('date');
    const startTimeStr = searchParams.get('startTime');
    const duration = parseInt(searchParams.get('duration') || '60');

    if (!studioId || !dateStr || !startTimeStr) {
      return NextResponse.json({ success: false, error: 'חסרים פרטים נדרשים' }, { status: 400 });
    }

    const dateOnly = dateStr.split('T')[0];
    const requestedStart = israelTimeToUTC(dateOnly, startTimeStr);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60 * 1000);

    const overlappingBooking = await Booking.findOne({
      studioId,
      status: 'confirmed',
      $or: [
        { startTime: { $gte: requestedStart, $lt: requestedEnd } },
        { endTime: { $gt: requestedStart, $lte: requestedEnd } },
        { startTime: { $lte: requestedStart }, endTime: { $gte: requestedEnd } },
      ],
    });

    return NextResponse.json({
      success: true,
      available: !overlappingBooking,
      requestedStart: requestedStart.toISOString(),
      requestedEnd: requestedEnd.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}