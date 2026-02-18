import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Studio from '@/models/Studio';

// POST /api/calculate-price
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { studioId, participants, hours, activityType, isCommercial } = body;

    if (!studioId || !participants || !hours || !activityType || isCommercial === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'חסרים פרטים נדרשים',
        },
        { status: 400 }
      );
    }

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

    // Find applicable pricing
    const applicablePricing = studio.pricing.find((p: any) => {
      return (
        participants >= p.minParticipants &&
        (!p.maxParticipants || participants <= p.maxParticipants) &&
        p.activityType === activityType &&
        p.commercial === isCommercial
      );
    });

    if (!applicablePricing) {
      return NextResponse.json(
        {
          success: false,
          error: 'לא נמצא מחיר מתאים לפרמטרים אלו',
        },
        { status: 404 }
      );
    }

    const totalPrice = Math.round(hours * applicablePricing.pricePerHour);

    return NextResponse.json({
      success: true,
      pricePerHour: applicablePricing.pricePerHour,
      totalPrice,
      hours,
      breakdown: {
        participants,
        activityType,
        isCommercial: isCommercial ? 'מסחרי' : 'לא מסחרי',
      },
    });
  } catch (error: any) {
    console.error('Error calculating price:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'שגיאה בחישוב מחיר',
      },
      { status: 500 }
    );
  }
}
