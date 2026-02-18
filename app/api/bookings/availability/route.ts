import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Availability from '@/models/Availability';
import { startOfDay, endOfDay, parse, format } from 'date-fns';

// GET /api/bookings/availability?studioId=xxx&date=2024-01-15
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get('studioId');
    const dateStr = searchParams.get('date');

    if (!studioId || !dateStr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Studio ID and date are required',
        },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    // Get bookings for this studio on this date
    const bookings = await Booking.find({
      studioId,
      status: { $ne: 'cancelled' },
      startTime: {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      },
    }).sort({ startTime: 1 });

    // Get availability rules
    const availabilityRules = await Availability.find({
      studioId,
      $or: [
        { recurring: true, dayOfWeek }, // Weekly recurring
        { recurring: false, date: { $gte: startOfDay(date), $lte: endOfDay(date) } }, // Specific date
      ],
    });

    // Build time slots (example: 9 AM - 10 PM in 1-hour blocks)
    const timeSlots = [];
    for (let hour = 9; hour < 22; hour++) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(hour + 1, 0, 0, 0);

      // Check if slot is blocked by availability rules
      const isBlocked = availabilityRules.some((rule) => {
        if (!rule.isBlocked) return false;
        
        const ruleStart = parse(rule.startTime, 'HH:mm', date);
        const ruleEnd = parse(rule.endTime, 'HH:mm', date);
        
        return startTime >= ruleStart && endTime <= ruleEnd;
      });

      // Check if slot overlaps with existing booking
      const isBooked = bookings.some((booking) => {
        return (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        );
      });

      timeSlots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        available: !isBooked && !isBlocked,
        reason: isBlocked
          ? availabilityRules.find((r) => r.isBlocked)?.reason
          : isBooked
          ? 'Booked'
          : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        studioId,
        timeSlots,
        bookings: bookings.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check availability',
      },
      { status: 500 }
    );
  }
}
