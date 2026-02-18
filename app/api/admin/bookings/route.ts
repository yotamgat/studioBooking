import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Studio from '@/models/Studio';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'אין הרשאה' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const studioId = searchParams.get('studioId');

    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }

    if (studioId) {
      filter.studioId = studioId;
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 }) // -1 = newest first, 1 = oldest first
      .limit(50)
      .lean();

    // Get related studios and users
    const studioIds = [...new Set(bookings.map(b => b.studioId.toString()))];
    const userIds = [...new Set(bookings.map(b => b.userId?.toString()).filter(Boolean))];

    const [studios, users] = await Promise.all([
      Studio.find({ _id: { $in: studioIds } }).lean(),
      User.find({ _id: { $in: userIds } }).lean(),
    ]);

    const studioMap = Object.fromEntries(studios.map(s => [s._id.toString(), s]));
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    const enrichedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      studioId: booking.studioId.toString(),
      userId: booking.userId?.toString(),
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      studio: studioMap[booking.studioId.toString()],
      user: userMap[booking.userId?.toString()],
    }));

    return NextResponse.json({
      success: true,
      data: enrichedBookings,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
