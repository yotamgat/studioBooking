import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'אין הרשאה' },
        { status: 403 }
      );
    }

    await connectDB();

    const { status, paymentStatus } = await request.json();
    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'ההזמנה לא נמצאה' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
