// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyPayment } from '@/lib/pelecard';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parameters sent by PeleCard to the GoodURL/ErrorURL (via GET by default)
  const pelecardStatusCode = searchParams.get('PelecardStatusCode');
  const confirmationKey = searchParams.get('ConfirmationKey');
  const userKey = searchParams.get('UserKey'); // this is our bookingId
  const pelecardTransactionId = searchParams.get('PelecardTransactionId');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Check if payment was successful at PeleCard's end
  if (pelecardStatusCode !== '000') {
    console.error('PeleCard payment failed with status:', pelecardStatusCode);
    return NextResponse.redirect(
      `${baseUrl}/payment/failed?reason=payment_declined&code=${pelecardStatusCode}`
    );
  }

  if (!confirmationKey || !userKey) {
    console.error('Missing confirmationKey or userKey in callback');
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=missing_key`);
  }

  try {
    await connectDB();

    // Fetch the booking to get the original amount for validation
    const booking = await Booking.findById(userKey);
    if (!booking) {
      console.error('Booking not found for userKey:', userKey);
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=booking_not_found`);
    }

    // Step 5: Validate the transaction with PeleCard
    const isValid = await verifyPayment({
      confirmationKey,
      userKey,       // bookingId we originally passed as UserKey
      totalAmount: booking.totalPrice,
    });

    if (!isValid) {
      console.error('PeleCard transaction validation failed for booking:', userKey);
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=verification_failed`);
    }

    // Update booking as paid
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentTransactionId = pelecardTransactionId || '';
    booking.paidAt = new Date();
    await booking.save();

    return NextResponse.redirect(
      `${baseUrl}/payment/success?bookingId=${userKey}`
    );
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=server_error`);
  }
}