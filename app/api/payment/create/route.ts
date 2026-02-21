// app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPaymentUrl } from '@/lib/pelecard';
import dbConnect from '@/lib/mongodb';
import PendingBooking from '@/models/PendingBooking';
import Booking from '@/models/Booking';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      studioId,
      startTime,
      endTime,
      totalHours,
      pricePerHour,
      totalPrice,
      participants,
      activityType,
      isCommercial,
      notes,
    } = body;

    if (!studioId || !startTime || !endTime || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for overlapping CONFIRMED bookings before even going to payment
    const overlapping = await Booking.findOne({
      studioId,
      status: 'confirmed',
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (overlapping) {
      return NextResponse.json({ error: 'הזמן הזה כבר תפוס' }, { status: 409 });
    }

    // Save booking details temporarily (auto-deleted after 30 min if no payment)
    const pending = await PendingBooking.create({
      studioId,
      userId: session.user.id,
      startTime: start,
      endTime: end,
      totalHours,
      pricePerHour,
      totalPrice,
      participants,
      activityType,
      isCommercial,
      notes,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const paymentUrl = await createPaymentUrl({
      bookingId: pending._id.toString(),
      totalAmount: totalPrice,
      goodUrl: `${baseUrl}/api/payment/callback`,
      errorUrl: `${baseUrl}/api/payment/callback`,
    });

    return NextResponse.json({ paymentUrl });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}