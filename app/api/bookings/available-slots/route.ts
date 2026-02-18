import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import RecurringBlock from '@/models/RecurringBlock';
import { startOfDay, endOfDay } from 'date-fns';

// GET /api/bookings/available-slots?studioId=xxx&date=2024-02-15
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
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get all bookings for this studio on this day
    const bookings = await Booking.find({
      studioId,
      status: { $ne: 'cancelled' },
      startTime: {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      },
    });

    // Get recurring blocks for this day of week
    const recurringBlocks = await RecurringBlock.find({
      studioId,
      dayOfWeek,
      isActive: true,
      $or: [
        { endDate: { $exists: false } }, // No end date (forever)
        { endDate: { $gte: date } }, // End date hasn't passed yet
      ],
    });

    // Generate time slots for 09:00-22:00 in 15-minute intervals
    const slots = [];
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 15);

        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        // Check if this 15-minute slot overlaps with any booking
        const hasBooking = bookings.some(booking => {
          return (
            (booking.startTime < slotEnd && booking.endTime > slotStart)
          );
        });

        // Check if this slot is blocked by recurring block
        const hasRecurringBlock = recurringBlocks.some(block => {
          const [blockStartHour, blockStartMin] = block.startTime.split(':').map(Number);
          const [blockEndHour, blockEndMin] = block.endTime.split(':').map(Number);
          
          const blockStartMinutes = blockStartHour * 60 + blockStartMin;
          const blockEndMinutes = blockEndHour * 60 + blockEndMin;
          const slotMinutes = hour * 60 + minute;
          
          return slotMinutes >= blockStartMinutes && slotMinutes < blockEndMinutes;
        });
        
        slots.push({
          time: timeString,
          available: !hasBooking && !hasRecurringBlock,
        });
      }
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
