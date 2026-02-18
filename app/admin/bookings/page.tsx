'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BookingActions from '@/components/admin/BookingActions';

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [studioFilter, setStudioFilter] = useState(searchParams.get('studioId') || '');

  useEffect(() => {
    fetchData();
  }, [statusFilter, studioFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (studioFilter) params.set('studioId', studioFilter);

      const [bookingsRes, studiosRes] = await Promise.all([
        fetch(`/api/admin/bookings?${params.toString()}`),
        fetch('/api/studios'),
      ]);

      const bookingsData = await bookingsRes.json();
      const studiosData = await studiosRes.json();

      if (bookingsData.success) setBookings(bookingsData.data);
      if (studiosData.success) setStudios(studiosData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    const labels: Record<string, string> = {
      pending: 'ממתין', confirmed: 'מאושר', cancelled: 'בוטל', completed: 'הושלם',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      pending: 'ממתין לתשלום', paid: 'שולם', refunded: 'הוחזר',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">ניהול הזמנות</h1>
            <Link href="/admin" className="text-purple-600 hover:text-purple-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              חזור לסקירה
            </Link>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 space-x-reverse">
            <Link href="/admin" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 px-3 py-4 text-sm font-medium">סקירה כללית</Link>
            <Link href="/admin/bookings" className="border-b-2 border-purple-600 text-purple-600 px-3 py-4 text-sm font-medium">הזמנות</Link>
            <Link href="/admin/availability" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 px-3 py-4 text-sm font-medium">ניהול זמינות</Link>
            <Link href="/admin/all-blocks" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 px-3 py-4 text-sm font-medium">כל החסימות</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סטטוס</label>
              <select className="w-full border border-gray-300 rounded-lg p-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">הכל</option>
                <option value="pending">ממתין</option>
                <option value="confirmed">מאושר</option>
                <option value="completed">הושלם</option>
                <option value="cancelled">בוטל</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">חלל</label>
              <select className="w-full border border-gray-300 rounded-lg p-2" value={studioFilter} onChange={e => setStudioFilter(e.target.value)}>
                <option value="">הכל</option>
                {studios.map((studio: any) => (
                  <option key={studio._id} value={studio._id}>{studio.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">טוען הזמנות...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['מספר הזמנה', 'תאריך יצירה', 'לקוח', 'חלל', 'תאריך ושעה', 'משתתפים', 'מחיר', 'סטטוס', 'תשלום', 'פעולות'].map(h => (
                      <th key={h} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-500">אין הזמנות להצגה</td></tr>
                  ) : (
                    bookings.map((booking: any) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking._id.slice(-6)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.createdAt).toLocaleDateString('he-IL')}
                          <div className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.user?.name || 'לא ידוע'}
                          <div className="text-xs text-gray-500">{booking.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.studio?.name || 'לא ידוע'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.startTime).toLocaleDateString('he-IL')}
                          <div className="text-xs text-gray-500">
                            {new Date(booking.startTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.participants}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₪{booking.totalPrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getPaymentBadge(booking.paymentStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <BookingActions bookingId={booking._id} status={booking.status} onUpdate={fetchData} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" /></div>}>
      <BookingsContent />
    </Suspense>
  );
}
