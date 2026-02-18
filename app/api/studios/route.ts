import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Studio from '@/models/Studio';

// GET /api/studios - Get all active studios
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const studios = await Studio.find({ isActive: true }).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: studios,
    });
  } catch (error: any) {
    console.error('Error fetching studios:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch studios',
      },
      { status: 500 }
    );
  }
}

// POST /api/studios - Create new studio (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, capacity, amenities, hourlyRate, images } = body;

    // TODO: Add authentication check for admin role

    if (!name || !hourlyRate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and hourly rate are required',
        },
        { status: 400 }
      );
    }

    const studio = await Studio.create({
      name,
      description,
      capacity,
      amenities,
      hourlyRate,
      images,
    });

    return NextResponse.json(
      {
        success: true,
        data: studio,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating studio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create studio',
      },
      { status: 500 }
    );
  }
}
