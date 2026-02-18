import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

async function getStats() {
  await connectDB();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [todayBookings, weekBookings, monthBookings, pendingBookings] = await Promise.all([
    Booking.countDocuments({
      startTime: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' },
    }),
    Booking.countDocuments({
      startTime: { $gte: weekStart, $lte: weekEnd },
      status: { $ne: 'cancelled' },
    }),
    Booking.countDocuments({
      startTime: { $gte: monthStart, $lte: monthEnd },
      status: { $ne: 'cancelled' },
    }),
    Booking.countDocuments({
      status: 'pending',
    }),
  ]);

  // Calculate revenue
  const monthRevenue = await Booking.aggregate([
    {
      $match: {
        startTime: { $gte: monthStart, $lte: monthEnd },
        paymentStatus: 'paid',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
      },
    },
  ]);

  return {
    todayBookings,
    weekBookings,
    monthBookings,
    pendingBookings,
    monthRevenue: monthRevenue[0]?.total || 0,
  };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">פאנל ניהול</h1>
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              חזור לאתר
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 space-x-reverse">
            <Link
              href="/admin"
              className="border-b-2 border-purple-600 text-purple-600 px-3 py-4 text-sm font-medium"
            >
              סקירה כללית
            </Link>
            <Link
              href="/admin/bookings"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              הזמנות
            </Link>
            <Link
              href="/admin/availability"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              ניהול זמינות
            </Link>
            <Link
              href="/admin/all-blocks"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              כל החסימות
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">הזמנות היום</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayBookings}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Week's Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">הזמנות השבוע</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.weekBookings}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ממתינות לאישור</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingBookings}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">הכנסות החודש</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₪{stats.monthRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">פעולות מהירות</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/bookings?status=pending"
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition"
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="font-medium">אשר הזמנות</p>
                <p className="text-sm text-gray-600">{stats.pendingBookings} ממתינות</p>
              </div>
            </Link>

            <Link
              href="/admin/bookings"
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition"
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <div>
                <p className="font-medium">כל ההזמנות</p>
                <p className="text-sm text-gray-600">צפה ונהל</p>
              </div>
            </Link>

            <Link
              href="/admin/all-blocks"
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition"
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="font-medium">כל החסימות</p>
                <p className="text-sm text-gray-600">צפה וערוך</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
