import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'אין הרשאה' },
        { status: 403 }
      );
    }

    await connectDB();

    const { studioId, startTime, endTime, reason } = await request.json();

    if (!studioId || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'חסרים פרטים' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'שעת הסיום חייבת להיות אחרי שעת ההתחלה' },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      studioId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start },
        },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        { success: false, error: 'קיימת הזמנה בזמן הזה. בטל אותה קודם.' },
        { status: 409 }
      );
    }

    // Create a "blocked" booking
    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const booking = await Booking.create({
      studioId,
      userId: session.user.id,
      startTime: start,
      endTime: end,
      totalHours,
      pricePerHour: 0,
      totalPrice: 0,
      participants: 1, // Changed from 0 to 1 to pass validation
      activityType: 'חזרה',
      isCommercial: false,
      status: 'confirmed',
      paymentStatus: 'paid', // Blocked times don't need payment
      notes: reason || 'חסימת זמן על ידי מנהל',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'השעות נחסמו בהצלחה',
        data: booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error blocking time:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
