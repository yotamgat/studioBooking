// app/api/admin/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Studio from '@/models/Studio';
import User from '@/models/User';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date'); // ISO date string
    const date = dateParam ? new Date(dateParam) : new Date();

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Get all studios
    const studios = await Studio.find({ isActive: true }).lean();

    // Get all bookings for this day across all studios
    const bookings = await Booking.find({
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
      status: { $ne: 'cancelled' },
    }).lean();

    // Get user details for all bookings
    const userIds = [...new Set(bookings.map(b => b.userId?.toString()).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [(u._id as any).toString(), u]));

    // Enrich bookings with user data
    const enrichedBookings = bookings.map(b => ({
      _id: (b._id as any).toString(),
      studioId: b.studioId.toString(),
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      totalHours: b.totalHours,
      totalPrice: b.totalPrice,
      participants: b.participants,
      activityType: b.activityType,
      isCommercial: b.isCommercial,
      status: b.status,
      paymentStatus: b.paymentStatus,
      user: userMap[b.userId?.toString()] ? {
        name: (userMap[b.userId?.toString()] as any).name,
        email: (userMap[b.userId?.toString()] as any).email,
        phone: (userMap[b.userId?.toString()] as any).phone,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      studios: studios.map(s => ({ _id: (s._id as any).toString(), name: s.name })),
      bookings: enrichedBookings,
      date: date.toISOString(),
    });
  } catch (error: any) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}