import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import RecurringBlock from '@/models/RecurringBlock';
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
    const date = new Date(dateOnly);
    const dayOfWeek = date.getDay();

    const bookings = await Booking.find({
      studioId,
      status: 'confirmed',
      startTime: { $gte: dayStart, $lte: dayEnd },
    });

    const recurringBlocks = await RecurringBlock.find({
      studioId,
      dayOfWeek,
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: date } },
      ],
    });

    const slots = [];
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const slotStart = israelTimeToUTC(dateOnly, timeStr);
        const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);

        const hasBooking = bookings.some(booking =>
          booking.startTime < slotEnd && booking.endTime > slotStart
        );

        const hasRecurringBlock = recurringBlocks.some(block => {
          const [blockStartHour, blockStartMin] = block.startTime.split(':').map(Number);
          const [blockEndHour, blockEndMin] = block.endTime.split(':').map(Number);
          const blockStartMinutes = blockStartHour * 60 + blockStartMin;
          const blockEndMinutes = blockEndHour * 60 + blockEndMin;
          const slotMinutes = hour * 60 + minute;
          return slotMinutes >= blockStartMinutes && slotMinutes < blockEndMinutes;
        });

        slots.push({ time: timeStr, available: !hasBooking && !hasRecurringBlock });
      }
    }

    return NextResponse.json({ success: true, date: dateStr, slots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}