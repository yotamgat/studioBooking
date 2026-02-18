// app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPaymentUrl } from '@/lib/pelecard';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(request: NextRequest) {
  try {
    // 1. וידוא שהמשתמש מחובר
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. קבלת bookingId מה-request
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    // 3. שליפת ההזמנה מה-DB
    await dbConnect();
    const booking = await Booking.findById(bookingId).populate('studioId').populate('userId');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 4. וידוא שההזמנה שייכת למשתמש המחובר
    // if (booking.userId.toString() !== session.user.id) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // 5. וידוא שההזמנה עדיין לא שולמה
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // 6. יצירת URL תשלום ב-PeleCard
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const paymentUrl = await createPaymentUrl({
      bookingId: booking._id.toString(),
      totalAmount: booking.totalPrice,
      goodUrl: `${baseUrl}/api/payment/callback`,
      errorUrl: `${baseUrl}/api/payment/callback`,
    });

    // 7. עדכון סטטוס ההזמנה ל-pending
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'pending',
    });

    return NextResponse.json({ paymentUrl });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}