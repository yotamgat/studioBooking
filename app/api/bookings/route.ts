import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { israelStartOfDay, israelEndOfDay, israelTimeToUTC } from '@/lib/timezone';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get('studioId');
    const dateStr = searchParams.get('date');

    if (!studioId || !dateStr) {
      return NextResponse.json({ success: false, error: 'חסרים פרטים' }, { status: 400 });
    }

    const dayStart = israelStartOfDay(dateStr);
    const dayEnd = israelEndOfDay(dateStr);
    const dateOnly = dateStr.split('T')[0];

    const bookings = await Booking.find({
      studioId,
      status: 'confirmed',
      startTime: { $gte: dayStart, $lte: dayEnd },
    });

    const slots = [];
    for (let hour = 9; hour < 23; hour++) {
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      const slotStart = israelTimeToUTC(dateOnly, timeStr);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

      const hasBooking = bookings.some(booking =>
        booking.startTime < slotEnd && booking.endTime > slotStart
      );

      slots.push({ hour, available: !hasBooking });
    }

    return NextResponse.json({ success: true, date: dateStr, slots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}