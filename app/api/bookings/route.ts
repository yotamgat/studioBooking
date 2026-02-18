import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Studio from '@/models/Studio';
import User from '@/models/User';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      studioId, 
      userId, 
      startTime, 
      endTime, 
      totalHours,
      pricePerHour,
      totalPrice,
      participants,
      activityType,
      isCommercial,
      notes 
    } = body;

    // Validate required fields
    if (!studioId || !userId || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'חסרים שדות חובה: studioId, userId, startTime, endTime',
        },
        { status: 400 }
      );
    }

    if (!participants || !activityType || isCommercial === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'חסרים שדות חובה: participants, activityType, isCommercial',
        },
        { status: 400 }
      );
    }

    if (!totalPrice || !pricePerHour || !totalHours) {
      return NextResponse.json(
        {
          success: false,
          error: 'חסרים שדות חובה: totalPrice, pricePerHour, totalHours',
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
          error: 'החלל לא נמצא',
        },
        { status: 404 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

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
        {
          success: false,
          error: 'הזמן הזה כבר תפוס',
        },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      studioId,
      userId,
      startTime: start,
      endTime: end,
      totalHours,
      pricePerHour,
      totalPrice,
      participants,
      activityType,
      isCommercial,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Send confirmation email
    try {
      const [studio, user] = await Promise.all([
        Studio.findById(studioId),
        User.findById(userId),
      ]);

      if (studio && user && user.email) {
        const participantsLabel = 
          participants === 1 ? '1 אדם' :
          participants === 3 ? '2-4 אנשים' :
          participants === 10 ? '5-15 אנשים' :
          participants === 20 ? '16-25 אנשים' :
          '26+ אנשים';

        await sendBookingConfirmationEmail({
          customerName: user.name,
          customerEmail: user.email,
          studioName: studio.name,
          studioAddress: studio.address || 'כתובת תינתן במייל נפרד',
          date: start.toLocaleDateString('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          startTime: start.toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          endTime: end.toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          duration: `${totalHours} שעות`,
          participants: participants,
          activityType,
          totalPrice,
          bookingId: booking._id.toString(),
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the booking
      console.error('Error sending confirmation email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('שגיאה ביצירת הזמנה:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'שגיאה ביצירת ההזמנה',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const studioId = searchParams.get('studioId');

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (studioId) filter.studioId = studioId;

    const bookings = await Booking.find(filter)
      .sort({ startTime: -1 });

    return NextResponse.json({
      success: true,
      data: bookings,
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
