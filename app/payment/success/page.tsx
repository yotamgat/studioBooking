'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface BookingDetails {
  studioName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  date: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        setBooking({
          studioName: data.studioId?.name || 'סטודיו',
          date: new Date(data.startTime).toLocaleDateString('he-IL'),
          startTime: new Date(data.startTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(data.endTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          totalPrice: data.totalPrice,
        });
      } catch (err) {
        console.error('Failed to fetch booking:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">התשלום בוצע בהצלחה!</h1>
        <p className="text-gray-500 mb-6">ההזמנה שלך אושרה ואימייל אישור נשלח אליך.</p>
        {loading ? (
          <div className="text-gray-400 text-sm mb-6">טוען פרטי הזמנה...</div>
        ) : booking ? (
          <div className="bg-gray-50 rounded-xl p-5 text-right mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">סטודיו</span>
              <span className="font-medium text-gray-800">{booking.studioName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">תאריך</span>
              <span className="font-medium text-gray-800">{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">שעות</span>
              <span className="font-medium text-gray-800">{booking.startTime} - {booking.endTime}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-500 text-sm">סה״כ שולם</span>
              <span className="font-bold text-gray-800">₪{booking.totalPrice}</span>
            </div>
          </div>
        ) : null}
        <button
          onClick={() => router.push('/booking')}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
        >
          עבור להזמנות שלי
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
