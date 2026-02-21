// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import PendingBooking from '@/models/PendingBooking';
import { verifyPayment } from '@/lib/pelecard';
import Studio from '@/models/Studio';
import User from '@/models/User';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const pelecardStatusCode = searchParams.get('PelecardStatusCode');
  const confirmationKey = searchParams.get('ConfirmationKey');
  const userKey = searchParams.get('UserKey'); // this is our pendingBookingId
  const pelecardTransactionId = searchParams.get('PelecardTransactionId');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (pelecardStatusCode !== '000') {
    console.error('PeleCard payment failed with status:', pelecardStatusCode);
    // Clean up pending booking
    if (userKey) {
      try {
        await connectDB();
        await PendingBooking.findByIdAndDelete(userKey);
      } catch {}
    }
    return NextResponse.redirect(
      `${baseUrl}/payment/failed?reason=payment_declined&code=${pelecardStatusCode}`
    );
  }

  if (!confirmationKey || !userKey) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=missing_key`);
  }

  try {
    await connectDB();

    // Get pending booking details
    const pending = await PendingBooking.findById(userKey);
    if (!pending) {
      console.error('Pending booking not found:', userKey);
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=booking_not_found`);
    }

    // Validate payment with PeleCard
    const isValid = await verifyPayment({
      confirmationKey,
      userKey,
      totalAmount: pending.totalPrice,
    });

    if (!isValid) {
      console.error('PeleCard validation failed for pending booking:', userKey);
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=verification_failed`);
    }

    // Check one more time for overlaps (race condition protection)
    const overlapping = await Booking.findOne({
      studioId: pending.studioId,
      status: 'confirmed',
      $or: [{ startTime: { $lt: pending.endTime }, endTime: { $gt: pending.startTime } }],
    });

    if (overlapping) {
      await PendingBooking.findByIdAndDelete(userKey);
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=slot_taken`);
    }

    // Create the real confirmed booking
    const booking = await Booking.create({
      studioId: pending.studioId,
      userId: pending.userId,
      startTime: pending.startTime,
      endTime: pending.endTime,
      totalHours: pending.totalHours,
      pricePerHour: pending.pricePerHour,
      totalPrice: pending.totalPrice,
      participants: pending.participants,
      activityType: pending.activityType,
      isCommercial: pending.isCommercial,
      notes: pending.notes,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentTransactionId: pelecardTransactionId || '',
      paidAt: new Date(),
    });

    // Delete the pending booking
    await PendingBooking.findByIdAndDelete(userKey);

    // Send confirmation email
    try {
      const [studioDoc, userDoc] = await Promise.all([
        Studio.findById(booking.studioId),
        User.findById(booking.userId),
      ]);

      if (studioDoc && userDoc && userDoc.email) {
        await sendBookingConfirmationEmail({
          customerName: userDoc.name,
          customerEmail: userDoc.email,
          studioName: studioDoc.name,
          studioAddress: studioDoc.address || 'כתובת תינתן במייל נפרד',
          date: new Date(booking.startTime).toLocaleDateString('he-IL', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          }),
          startTime: new Date(booking.startTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(booking.endTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          duration: `${booking.totalHours} שעות`,
          participants: booking.participants,
          activityType: booking.activityType,
          totalPrice: booking.totalPrice,
          bookingId: booking._id.toString(),
        });
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    return NextResponse.redirect(
      `${baseUrl}/payment/success?bookingId=${booking._id.toString()}`
    );
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=server_error`);
  }
}