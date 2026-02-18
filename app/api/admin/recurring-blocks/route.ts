import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import RecurringBlock from '@/models/RecurringBlock';

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

    const { studioId, dayOfWeek, startTime, endTime, endDate, reason } = await request.json();

    if (!studioId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'חסרים פרטים' },
        { status: 400 }
      );
    }

    // Validate day of week
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: 'יום לא תקין' },
        { status: 400 }
      );
    }

    const recurringBlock = await RecurringBlock.create({
      studioId,
      dayOfWeek,
      startTime,
      endTime,
      endDate: endDate ? new Date(endDate) : undefined,
      reason: reason || 'חסימה חוזרת',
      createdBy: session.user.id,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'חסימה חוזרת נוצרה בהצלחה',
        data: recurringBlock,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating recurring block:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

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
    const studioId = searchParams.get('studioId');

    const filter: any = { isActive: true };
    if (studioId) {
      filter.studioId = studioId;
    }

    const blocks = await RecurringBlock.find(filter)
      .populate('studioId', 'name')
      .sort({ dayOfWeek: 1, startTime: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: blocks,
    });
  } catch (error: any) {
    console.error('Error fetching recurring blocks:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'חסר מזהה' },
        { status: 400 }
      );
    }

    await RecurringBlock.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'חסימה חוזרת בוטלה',
    });
  } catch (error: any) {
    console.error('Error deleting recurring block:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
